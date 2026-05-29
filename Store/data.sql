CREATE DATABASE IF NOT EXISTS book_store;
USE book_store;

-- ================= 1. USERS =================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    address TEXT,
    role ENUM('admin', 'customer') DEFAULT 'customer',
    
    -- Bảo mật đăng nhập
    failed_login_attempts INT NOT NULL DEFAULT 0,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    lock_until TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tài khoản Admin mặc định
INSERT INTO users (name, email, password, phone, address, role)
VALUES ('System Admin', 'admin@gmail.com', 'admin123', '0999999999', 'Hồ Chí Minh', 'admin');


-- ================= 2. CATEGORIES =================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);


-- ================= 3. PRODUCTS =================
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,    -- Giá gốc
    selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Giá bán
    quantity INT NOT NULL DEFAULT 0,                     -- Số lượng tồn kho
    description TEXT,
    image VARCHAR(255) DEFAULT 'default-product.jpg',
    category_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);


-- ================= 4. ORDERS =================
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL, 
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    total_selling_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00, 
    status ENUM('pending', 'confirmed', 'shipping', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);


-- ================= 5. ORDER DETAILS =================
CREATE TABLE order_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NULL,
    quantity INT NOT NULL DEFAULT 1,
    cost_price DECIMAL(10, 2) NOT NULL,    
    selling_price DECIMAL(10, 2) NOT NULL, 
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
);


-- ================= 6. PAYMENTS =================
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    method VARCHAR(50) NOT NULL, 
    status VARCHAR(50) DEFAULT 'pending',
    transaction_code VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);


-- ================= 7. 1-1 CHATS (Cải tiến) =================
CREATE TABLE chats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Định danh phòng chat (Cuộc hội thoại)
    user_id INT NULL,             -- NULL nếu là khách vãng lai
    guest_token VARCHAR(255) NULL, -- Lưu Session ID / Token của khách chưa login
    
    -- Nội dung tin nhắn
    message TEXT NOT NULL,
    sender_role ENUM('admin', 'customer') NOT NULL, -- Ai là người gửi tin này?
    is_read BOOLEAN DEFAULT FALSE,                  -- Admin hoặc khách đã đọc chưa (để làm thông báo chuông)
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);