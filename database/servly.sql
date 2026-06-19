-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS servly;
USE servly;

-- Products Table
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    table_number INT NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    order_status ENUM('pending', 'preparing', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items Table
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings Table
DROP TABLE IF EXISTS settings;
CREATE TABLE settings (
    `key` VARCHAR(100) NOT NULL PRIMARY KEY,
    value VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Sessions Table
DROP TABLE IF EXISTS table_sessions;
CREATE TABLE table_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    table_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO products (name, description, price, image_url, category) VALUES
('Parmesan Truffle Fries', 'Crispy thin-cut golden fries tossed in rich white truffle oil, grated Parmigiano-Reggiano, and fresh chopped parsley. Served with garlic aioli.', 250.00, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=600&q=80', 'Starters'),
('Garlic Butter Tiger Prawns', 'Sizzling tiger prawns sautéed in a rich garlic butter white wine reduction, finished with fresh red chili flakes and toasted sourdough.', 480.00, 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?auto=format&fit=crop&w=600&q=80', 'Starters'),
('Signature Wagyu Truffle Burger', 'Pan-seared A5 Wagyu beef patty, melted aged gruyere cheese, caramelized onions, wild rocket, and house truffle mayo on a toasted brioche bun. Served with side greens.', 550.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', 'Mains'),
('Pan-Seared Atlantic Salmon', 'Crispy-skin salmon fillet served over a bed of creamy baby spinach, roasted fingerling potatoes, and drizzled with a citrus dill butter sauce.', 590.00, 'https://static01.nyt.com/images/2024/02/13/multimedia/LH-pan-seared-salmon-lwzt/LH-pan-seared-salmon-lwzt-mediumSquareAt3X.jpg', 'Mains'),
('Deconstructed Matcha Tiramisu', 'Layers of light mascarpone cream, espresso-soaked ladyfingers, and premium Uji matcha powder, topped with dark chocolate shavings.', 280.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80', 'Desserts'),
('Warm Chocolate Lava Cake', 'Decadent chocolate cake with a molten liquid center. Served warm with a scoop of organic Madagascar vanilla bean gelato and fresh raspberries.', 250.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', 'Desserts'),
('Ceremonial Matcha Latte', 'Whisked premium Uji matcha sweetened with organic agave nectar and poured over chilled oat milk.', 180.00, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80', 'Drinks'),
('Artisanal Hibiscus Lemonade', 'Cold-pressed lemon juice, organic cane sugar, and brewed hibiscus flower tea, garnished with fresh mint and lemon slices.', 160.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', 'Drinks');

-- Seed Default Settings
INSERT INTO settings (`key`, value) VALUES ('table_count', '5');
