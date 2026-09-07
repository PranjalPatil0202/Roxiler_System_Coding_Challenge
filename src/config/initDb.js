const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  });

  await client.connect();
  const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'store_rating_db'");
  if (res.rowCount === 0) {
    console.log('Creating database store_rating_db...');
    await client.query('CREATE DATABASE store_rating_db');
    console.log('✓ store_rating_db created successfully');
  } else {
    console.log('✓ store_rating_db already exists');
  }
  await client.end();
}

main().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
