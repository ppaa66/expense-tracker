import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const API_URL = 'http://localhost:5000/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, balance: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch data
  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, []);

  useEffect(() => {
    if (formData.type) {
      fetchCategoryData(formData.type);
    }
  }, [formData.type, transactions]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/transactions`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_URL}/summary`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchCategoryData = async (type) => {
    try {
      const response = await fetch(`${API_URL}/transactions/category/${type}`);
      const data = await response.json();
      setCategoryData(data.map(item => ({
        name: item.category,
        value: parseFloat(item.total)
      })));
    } catch (error) {
      console.error('Error fetching category data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      });

      if (response.ok) {
        setFormData({
          description: '',
          amount: '',
          type: 'expense',
          category: '',
          date: new Date().toISOString().split('T')[0]
        });
        fetchTransactions();
        fetchSummary();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
      });
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>💰 ระบบบันทึกรายรับรายจ่าย</h1>
      </header>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card income">
          <h3>รายรับ</h3>
          <p className="amount">฿{parseFloat(summary.total_income).toLocaleString()}</p>
        </div>
        <div className="card expense">
          <h3>รายจ่าย</h3>
          <p className="amount">฿{parseFloat(summary.total_expense).toLocaleString()}</p>
        </div>
        <div className="card balance">
          <h3>คงเหลือ</h3>
          <p className="amount">฿{parseFloat(summary.balance).toLocaleString()}</p>
        </div>
      </div>

      {/* Chart Section */}
      {categoryData.length > 0 && (
        <div className="chart-container">
          <h2>สัดส่วน{formData.type === 'income' ? 'รายรับ' : 'รายจ่าย'}ตามหมวดหมู่</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `฿${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="content">
        {/* Add Transaction Form */}
        <div className="form-container">
          <h2>เพิ่มรายการใหม่</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ประเภท</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="expense">รายจ่าย</option>
                <option value="income">รายรับ</option>
              </select>
            </div>

            <div className="form-group">
              <label>รายละเอียด</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="เช่น ค่าอาหาร, เงินเดือน"
                required
              />
            </div>

            <div className="form-group">
              <label>จำนวนเงิน (฿)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label>หมวดหมู่</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="เช่น อาหาร, ที่อยู่อาศัย"
                required
              />
            </div>

            <div className="form-group">
              <label>วันที่</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-submit">
              ➕ เพิ่มรายการ
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div className="transactions-container">
          <h2>รายการทั้งหมด</h2>
          <div className="transactions-list">
            {transactions.length === 0 ? (
              <p className="no-data">ยังไม่มีรายการ</p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`transaction-item ${transaction.type}`}
                >
                  <div className="transaction-info">
                    <h3>{transaction.description}</h3>
                    <p className="category">📁 {transaction.category}</p>
                    <p className="date">📅 {new Date(transaction.date).toLocaleDateString('th-TH')}</p>
                  </div>
                  <div className="transaction-actions">
                    <p className="transaction-amount">
                      {transaction.type === 'income' ? '+' : '-'}
                      ฿{parseFloat(transaction.amount).toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="btn-delete"
                      title="ลบรายการ"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;