const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

const pool = new Pool({
  user: 'postgres',
  host: '192.168.1.115',
  database: 'ADAM',
  password: 'arb8468mdsRt',
  port: 5432
});

(async () => {
  const client = await pool.connect();
  await client.query('SET search_path TO 13955');
  client.release();
})();

app.use(express.json());
app.use(cors())

app.get('/', async (req, res) => {
    res.json({
        status: "ok"
    });
});

app.get('/hello/:name', async (req, res) => {
    res.json({
        message: `Hello, ${req.params.name}`
    });
});

app.listen(8001)