// Backup database SQLite konsisten tanpa menghentikan server.
//
// Dipakai lewat cron / scheduled task di host:
//   0 3 * * *  cd /srv/schoolhub/server && npm run backup
//
// Backup ditulis dengan VACUUM INTO, jadi aman dijalankan kapan pun walau
// server sedang melayani request (tidak mengunci tabel seperti cp file mentah).
//
// Env:
//   SQLITE_PATH  lokasi database aktif (default server/data/schoolhub.db)
//   BACKUP_DIR   tujuan backup   (default server/backups)
//   BACKUP_KEEP  jumlah backup lama yang dipertahankan (default 14)

const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.SQLITE_PATH || path.join(__dirname, '..', 'data', 'schoolhub.db');
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups');
const KEEP = Math.max(1, Number(process.env.BACKUP_KEEP) || 14);

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
}

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`[backup] database tidak ditemukan: ${DB_PATH}`);
    process.exit(1);
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const target = path.join(BACKUP_DIR, `schoolhub-${stamp()}.db`);
  const db = require('../src/db');

  try {
    db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
  } catch (e) {
    console.error(`[backup] gagal menulis backup: ${e.message}`);
    process.exit(1);
  } finally {
    try {
      db.close();
    } catch {
      /* sudah tertutup */
    }
  }

  const sizeKb = Math.round(fs.statSync(target).size / 1024);
  console.log(`[backup] tersimpan: ${target} (${sizeKb} KB)`);

  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => /^schoolhub-\d{8}-\d{6}\.db$/.test(f))
    .sort();

  const stale = files.slice(0, Math.max(0, files.length - KEEP));
  for (const f of stale) {
    fs.unlinkSync(path.join(BACKUP_DIR, f));
    console.log(`[backup] dihapus (lampau): ${f}`);
  }

  console.log(`[backup] selesai, ${Math.min(files.length, KEEP)} backup tersimpan.`);
}

main();
