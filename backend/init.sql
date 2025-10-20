-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO transactions (description, amount, type, category, date) VALUES
('เงินเดือน', 30000, 'income', 'เงินเดือน', '2025-10-01'),
('ค่าเช่าบ้าน', 8000, 'expense', 'ที่อยู่อาศัย', '2025-10-05'),
('ค่าอาหาร', 150, 'expense', 'อาหาร', '2025-10-06'),
('ขายของออนไลน์', 2500, 'income', 'รายได้เสริม', '2025-10-08'),
('ค่าน้ำค่าไฟ', 1200, 'expense', 'ค่าสาธารณูปโภค', '2025-10-10'),
('ค่าเดินทาง', 500, 'expense', 'การเดินทาง', '2025-10-12'),
('โบนัส', 5000, 'income', 'โบนัส', '2025-10-15'),
('ค่าอินเทอร์เน็ต', 599, 'expense', 'ค่าสาธารณูปโภค', '2025-10-16'),
('ช้อปปิ้ง', 3500, 'expense', 'ช้อปปิ้ง', '2025-10-18'),
('ค่ารักษาพยาบาล', 800, 'expense', 'สุขภาพ', '2025-10-20');