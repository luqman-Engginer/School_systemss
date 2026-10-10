const mysql = require('mysql2/promise');

const combos = [
  { user: 'root', password: '' },
  { user: 'schoolhub_app', password: '' },
  { user: 'schoolhub_app', password: 'schoolhub' },
  { user: 'schoolhub_app', password: 'schoolhub_app' },
  { user: 'schoolhub_app', password: 'schoolhub123' },
  { user: 'schoolhub_app', password: 'password' },
];

(async () => {
  for (const c of combos) {
    try {
      const conn = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: c.user,
        password: c.password,
        connectTimeout: 5000,
      });
      const [rows] = await conn.query('SELECT CURRENT_USER() AS u, VERSION() AS v');
      const [dbs] = await conn.query('SHOW DATABASES');
      console.log('OK', c.user, JSON.stringify(c.password), rows[0].u, rows[0].v, dbs.map((d) => d.Database).join(','));
      await conn.end();
    } catch (e) {
      console.log('FAIL', c.user, JSON.stringify(c.password), e.code || e.message);
    }
  }
})();
