// Backup database MySQL/MariaDB tanpa menghentikan server.
//
// Dipakai lewat cron / scheduled task di host:
//   0 3 * * *  cd /srv/schoolhub/server && npm run backup
//
// Dua mode, dipilih otomatis:
//   1. mysqldump / mariadb-dump bila binary-nya ada.|--single-transaction
//      menjamin snapshot konsisten tanpa mengunci tabel.
//   2. Kalau binary tidak ada, dump disusun sendiri lewat mysql2. Konsisten
//      karena berjalan di dalam satu REPEATABLE READ transaction, tapi jauh
//      lebih lambat pada tabel besar.
//
// Env:
//   DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME  (lihat src/db.js)
//   BACKUP_DIR   tujuan backup (default server/backups)
//   BACKUP_KEEP  jumlah backup lama yang dipertahankan (default 14)

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const mysql = require('mysql2/promise');

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups');
const KEEP = Math.max(1, Number(process.env.BACKUP_KEEP) || 14);
const FILE_RE = /^schoolhub-\d{8}-\d{6}\.sql(\.gz)?$/;

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
}

function connectionOptions() {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'schoolhub',
    charset: 'utf8mb4_unicode_ci',
    timezone: 'Z',
    dateStrings: true,
    supportBigNumbers: true,
  };
}

function findDumpBinary() {
  for (const bin of ['mariadb-dump', 'mysqldump']) {
    if (spawnSync(bin, ['--version'], { stdio: 'ignore' }).status === 0) return bin;
  }
  return null;
}

function dumpWithBinary(bin, target) {
  const args = [
    `-h${process.env.DB_HOST || '127.0.0.1'}`,
    `-P${process.env.DB_PORT || 3306}`,
    `-u${process.env.DB_USER || 'root'}`,
    '--single-transaction',
    '--quick',
    '--routines',
    '--triggers',
    '--events',
    '--default-character-set=utf8mb4',
    '--result-file',
    target,
    process.env.DB_NAME || 'schoolhub',
  ];
  if (process.env.DB_PASSWORD) args.splice(4, 0, `-p${process.env.DB_PASSWORD}`);

  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ['ignore', 'inherit', 'inherit'] });
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`${bin} keluar dengan kode ${code}`))
    );
  });
}

const quote = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? '1' : '0';
  if (Buffer.isBuffer(v)) return `X'${v.toString('hex')}'`;
  return `'${String(v)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z')}'`;
};

async function dumpWithNode(target) {
  const conn = await mysql.createConnection(connectionOptions());
  try {
    await conn.query('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await conn.beginTransaction();

    const [tables] = await conn.query(
      'SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = ?',
      ['BASE TABLE']
    );

    const out = fs.createWriteStream(target, { encoding: 'utf8' });
    const write = (s) =>
      out.write(s) ? Promise.resolve() : new Promise((r) => out.once('drain', r));

    await write(
      `-- SchoolHub dump ${new Date().toISOString()}\n-- database: ${process.env.DB_NAME || 'schoolhub'}\n` +
        'SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n'
    );

    for (const { name } of tables) {
      const [ddl] = await conn.query(`SHOW CREATE TABLE \`${name}\``);
      await write(`DROP TABLE IF EXISTS \`${name}\`;\n${ddl[0]['Create Table']};\n\n`);

      const [rows] = await conn.query(`SELECT * FROM \`${name}\``);
      if (!rows.length) continue;

      const cols = Object.keys(rows[0]);
      const prefix =
        `INSERT INTO \`${name}\` (${cols.map((c) => `\`${c}\``).join(',')}) VALUES\n`;

      await write(prefix);

      let chunk = '';
      for (const row of rows) {
        chunk += `(${cols.map((c) => quote(row[c])).join(',')});\n`;
        if (chunk.length > 1024 * 1024) {
          await write(chunk);
          chunk = '';
        }
      }
      if (chunk) await write(chunk);
      await write('\n');
    }

    await write('SET FOREIGN_KEY_CHECKS = 1;\n');
    out.end();
    await new Promise((resolve, reject) => out.on('close', resolve).on('error', reject));
    await conn.commit();
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    await conn.end().catch(() => {});
  }
}

function prune() {
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => FILE_RE.test(f))
    .sort();

  const stale = files.slice(0, Math.max(0, files.length - KEEP));
  for (const f of stale) {
    fs.unlinkSync(path.join(BACKUP_DIR, f));
    console.log(`[backup] dihapus (lampau): ${f}`);
  }
  console.log(`[backup] selesai, ${Math.min(files.length, KEEP)} backup tersimpan.`);
}

async function main() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const target = path.join(BACKUP_DIR, `schoolhub-${stamp()}.sql`);

  const bin = findDumpBinary();
  try {
    if (bin) {
      await dumpWithBinary(bin, target);
      console.log(`[backup] metode: ${bin}`);
    } else {
      await dumpWithNode(target);
      console.log('[backup] metode: dump internal mysql2 (mysqldump tidak ditemukan)');
    }
  } catch (e) {
    console.error(`[backup] gagal menulis backup: ${e.message}`);
    if (fs.existsSync(target)) fs.unlinkSync(target);
    process.exit(1);
  }

  console.log(`[backup] tersimpan: ${target} (${Math.round(fs.statSync(target).size / 1024)} KB)`);
  prune();
}

main();
