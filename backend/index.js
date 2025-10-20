const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'expense_tracker',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password123',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (err) {
    console.error('Database connection error:', err);
  }
})();

// Routes

// Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM transactions ORDER BY date DESC, id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO transactions (description, amount, type, category, date) VALUES (?, ?, ?, ?, ?)',
      [description, amount, type, category, date]
    );
    
    const [rows] = await pool.query(
      'SELECT * FROM transactions WHERE id = ?',
      [result.insertId]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM transactions WHERE id = ?', [id]);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get summary statistics
app.get('/api/summary', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance
      FROM transactions
    `);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get transactions by category
app.get('/api/transactions/category/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const [rows] = await pool.query(`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE type = ?
      GROUP BY category
      ORDER BY total DESC
    `, [type]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});