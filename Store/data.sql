-- -- Tạo database
-- CREATE DATABASE IF NOT EXISTS book_store;

-- USE book_store;

-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     email VARCHAR(100) NOT NULL UNIQUE,
--     password VARCHAR(255) NOT NULL,
--     phone VARCHAR(20) UNIQUE,
--     address TEXT,
--     role ENUM('admin', 'customer') DEFAULT 'customer',
    
--     -- Thêm các cột này vào để khớp với Entity User.java
--     failed_login_attempts INT NOT NULL DEFAULT 0,
--     is_locked BOOLEAN NOT NULL DEFAULT FALSE,
--     lock_until TIMESTAMP NULL,
    
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- CHỈ GIỮ LẠI tài khoản Admin mặc định để bạn có thể đăng nhập vào hệ thống quản trị lần đầu tiên.
-- INSERT INTO
--     users (
--         name, email, password, phone, address, role, failed_login_attempts, is_locked
--     )
-- VALUES (
--         'System Admin',
--         'admin@gmail.com',
--         'admin123',
--         '0999999999',
--         'Hồ Chí Minh',
--         'admin',
--         0,
--         FALSE
--     );

-- -- ================= 2. CATEGORIES =================
-- CREATE TABLE categories (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL UNIQUE, -- Không cho phép trùng tên danh mục
--     description TEXT
-- );

-- -- ================= 3. PRODUCTS =================
-- CREATE TABLE products (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
--     quantity INT NOT NULL DEFAULT 0,
--     description TEXT,
--     image VARCHAR(255) DEFAULT 'default-product.jpg', -- Ảnh mặc định nếu admin không upload
--     category_id INT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL -- Nếu xóa danh mục, sản phẩm không bị mất mà chuyển về NULL
-- );

-- -- ================= 4. ORDERS =================
-- CREATE TABLE orders (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NULL, -- NULL nếu là khách vãng lai (Guest) mua hàng
--     customer_name VARCHAR(100) NOT NULL,
--     phone VARCHAR(20) NOT NULL,
--     address TEXT NOT NULL,
--     total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
--     status ENUM(
--         'pending',
--         'confirmed',
--         'shipping',
--         'completed',
--         'cancelled'
--     ) DEFAULT 'pending',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL -- Khách xóa tài khoản thì đơn hàng cũ vẫn giữ lại để thống kê doanh thu
-- );

-- -- ================= 5. ORDER DETAILS =================
-- CREATE TABLE order_details (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     order_id INT NOT NULL,
--     product_id INT NULL, -- Nếu sản phẩm bị xóa, chi tiết đơn hàng cũ vẫn lưu thông tin
--     quantity INT NOT NULL DEFAULT 1,
--     price DECIMAL(10, 2) NOT NULL, -- Lưu giá tại thời điểm mua để tránh admin đổi giá sản phẩm làm sai lệch đơn cũ
--     FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE, -- Xóa đơn hàng thì xóa chi tiết đơn hàng đó
--     FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
-- );

-- -- ================= 6. PAYMENTS =================
-- CREATE TABLE payments (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     order_id INT NOT NULL,
--     method VARCHAR(50) NOT NULL,
--     status VARCHAR(50) DEFAULT 'pending',
--     transaction_code VARCHAR(100) UNIQUE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
-- );

-- -- ================= 7. CHATS =================
-- CREATE TABLE chats (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NULL, -- NULL nếu là khách vãng lai chưa đăng nhập
--     message TEXT NOT NULL,
--     sender ENUM('customer', 'admin') NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
-- );

-- -- ================= 8. LANGUAGES =================
-- -- Cấu hình ngôn ngữ giữ lại vì đây là dữ liệu nền (Master Data), Admin thường chỉ xem chứ ít khi thay đổi.
-- CREATE TABLE languages (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     code VARCHAR(10) NOT NULL UNIQUE,
--     name VARCHAR(50) NOT NULL
-- );

-- INSERT INTO
--     languages (code, name)
-- VALUES ('vi', 'Vietnamese'),
--     ('en', 'English');

-- -- ================= 9. TRANSLATIONS =================
-- -- Các từ khóa giao diện mặc định cần có để web không bị lỗi hiển thị.
-- CREATE TABLE translations (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     lang_code VARCHAR(10) NOT NULL,
--     key_text VARCHAR(100) NOT NULL,
--     value_text TEXT NOT NULL,
--     FOREIGN KEY (lang_code) REFERENCES languages (code) ON DELETE CASCADE
-- );

-- INSERT INTO
--     translations (
--         lang_code,
--         key_text,
--         value_text
--     )
-- VALUES ('vi', 'home', 'Trang chủ'),
--     ('en', 'home', 'Home'),
--     ('vi', 'cart', 'Giỏ hàng'),
--     ('en', 'cart', 'Cart'),
--     (
--         'vi',
--         'checkout',
--         'Thanh toán'
--     ),
--     ('en', 'checkout', 'Checkout'),
--     ('vi', 'login', 'Đăng nhập'),
--     ('en', 'login', 'Login'),
--     ('vi', 'register', 'Đăng ký'),
--     ('en', 'register', 'Register');
-- 1. Tạo database
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
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);


-- ================= 3. PRODUCTS =================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,    -- Giá gốc
    selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Giá bán
    quantity INT NOT NULL DEFAULT 0,                     -- Số lượng tồn kho
    description TEXT,
    image VARCHAR(255) DEFAULT 'default-product.jpg',
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);


-- ================= 4. ORDERS =================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NULL,
    quantity INT NOT NULL DEFAULT 1,
    cost_price DECIMAL(10, 2) NOT NULL,    
    selling_price DECIMAL(10, 2) NOT NULL, 
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
);


-- ================= 6. PAYMENTS =================
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    method VARCHAR(50) NOT NULL, 
    status VARCHAR(50) DEFAULT 'pending',
    transaction_code VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);


-- ================= 7. 1-1 CHATS (Cải tiến) =================
CREATE TABLE chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
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