const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ============================================
// ПОДКЛЮЧЕНИЕ К POSTGRESQL
// ============================================
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'sneakers_shop',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

// Проверка подключения
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Ошибка подключения к базе данных:', err.stack);
    } else {
        console.log('✅ Успешное подключение к PostgreSQL');
        release();
    }
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Настройка сессий
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 дней
    }
}));

// ============================================
// МИДЛВАР ДЛЯ ПРОВЕРКИ АВТОРИЗАЦИИ
// ============================================
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Необходима авторизация' });
    }
};

// ============================================
// МАРШРУТЫ ДЛЯ СТРАНИЦ
// ============================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'catalog.html'));
});

app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'product.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'orders.html'));
});

app.get('/statistics', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'statistics.html'));
});

// ============================================
// API ЭНДПОИНТЫ
// ============================================

// Получение всех товаров
app.get('/api/products', async (req, res) => {
    try {
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        
        if (req.query.search) {
            query += ` AND (name ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`;
            params.push(`%${req.query.search}%`, `%${req.query.search}%`);
        }
        
        if (req.query.brand && req.query.brand !== '') {
            query += ` AND brand = $${paramIndex++}`;
            params.push(req.query.brand);
        }
        
        if (req.query.category && req.query.category !== '') {
            query += ` AND category = $${paramIndex++}`;
            params.push(req.query.category);
        }
        
        if (req.query.minPrice) {
            query += ` AND price >= $${paramIndex++}`;
            params.push(parseFloat(req.query.minPrice));
        }
        
        if (req.query.maxPrice) {
            query += ` AND price <= $${paramIndex++}`;
            params.push(parseFloat(req.query.maxPrice));
        }
        
        if (req.query.sort) {
            switch(req.query.sort) {
                case 'price_asc': query += ' ORDER BY price ASC'; break;
                case 'price_desc': query += ' ORDER BY price DESC'; break;
                case 'name_asc': query += ' ORDER BY name ASC'; break;
                case 'rating_desc': query += ' ORDER BY rating DESC'; break;
                default: query += ' ORDER BY id ASC';
            }
        } else {
            query += ' ORDER BY id ASC';
        }
        
        if (req.query.limit) {
            query += ` LIMIT $${paramIndex++}`;
            params.push(parseInt(req.query.limit));
        }
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение товара по ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Товар не найден' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение корзины
app.get('/api/cart', async (req, res) => {
    try {
        if (req.session.userId) {
            const result = await pool.query(
                `SELECT c.*, p.name, p.price, p.image_url, p.brand 
                 FROM cart c 
                 JOIN products p ON c.product_id = p.id 
                 WHERE c.user_id = $1 
                 ORDER BY c.added_at DESC`,
                [req.session.userId]
            );
            
            const items = result.rows;
            const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
            
            res.json({ items, totalAmount, itemsCount });
        } else {
            const sessionCart = req.session.cart || [];
            const items = [];
            let totalAmount = 0;
            
            for (const cartItem of sessionCart) {
                const product = await pool.query('SELECT * FROM products WHERE id = $1', [cartItem.productId]);
                if (product.rows[0]) {
                    items.push({
                        id: cartItem.tempId,
                        product_id: cartItem.productId,
                        name: product.rows[0].name,
                        price: product.rows[0].price,
                        image_url: product.rows[0].image_url,
                        brand: product.rows[0].brand,
                        quantity: cartItem.quantity,
                        size: cartItem.size
                    });
                    totalAmount += product.rows[0].price * cartItem.quantity;
                }
            }
            
            res.json({ items, totalAmount, itemsCount: items.length });
        }
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавление в корзину
app.post('/api/cart', async (req, res) => {
    const { productId, quantity, size } = req.body;
    
    if (!productId || !quantity || !size) {
        return res.status(400).json({ error: 'Не все данные заполнены' });
    }
    
    try {
        if (req.session.userId) {
            const existing = await pool.query(
                'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2 AND size = $3',
                [req.session.userId, productId, size]
            );
            
            if (existing.rows.length > 0) {
                await pool.query(
                    'UPDATE cart SET quantity = quantity + $1 WHERE id = $2',
                    [quantity, existing.rows[0].id]
                );
            } else {
                await pool.query(
                    'INSERT INTO cart (user_id, product_id, quantity, size) VALUES ($1, $2, $3, $4)',
                    [req.session.userId, productId, quantity, size]
                );
            }
        } else {
            if (!req.session.cart) {
                req.session.cart = [];
            }
            
            const existingItem = req.session.cart.find(
                item => item.productId === productId && item.size === size
            );
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                req.session.cart.push({
                    tempId: Date.now() + Math.random(),
                    productId,
                    quantity,
                    size
                });
            }
        }
        
        res.json({ success: true, message: 'Товар добавлен в корзину' });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновление корзины
app.put('/api/cart/:id', async (req, res) => {
    const { quantity } = req.body;
    const cartId = req.params.id;
    
    try {
        if (req.session.userId) {
            await pool.query(
                'UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3',
                [quantity, cartId, req.session.userId]
            );
        } else {
            const itemIndex = req.session.cart.findIndex(item => item.tempId == cartId);
            if (itemIndex !== -1) {
                req.session.cart[itemIndex].quantity = quantity;
            }
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удаление из корзины
app.delete('/api/cart/:id', async (req, res) => {
    const cartId = req.params.id;
    
    try {
        if (req.session.userId) {
            await pool.query('DELETE FROM cart WHERE id = $1 AND user_id = $2', [cartId, req.session.userId]);
        } else {
            req.session.cart = req.session.cart.filter(item => item.tempId != cartId);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Перенос корзины после входа
async function mergeCartAfterLogin(userId, sessionCart) {
    if (!sessionCart || sessionCart.length === 0) return;
    
    for (const item of sessionCart) {
        const existing = await pool.query(
            'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2 AND size = $3',
            [userId, item.productId, item.size]
        );
        
        if (existing.rows.length > 0) {
            await pool.query(
                'UPDATE cart SET quantity = quantity + $1 WHERE id = $2',
                [item.quantity, existing.rows[0].id]
            );
        } else {
            await pool.query(
                'INSERT INTO cart (user_id, product_id, quantity, size) VALUES ($1, $2, $3, $4)',
                [userId, item.productId, item.quantity, item.size]
            );
        }
    }
}

// Регистрация
app.post('/api/register', async (req, res) => {
    const { email, password, fullName, phone, address, birthDate } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query(
            `INSERT INTO users (email, password_hash, full_name, phone, address, birth_date) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [email, hashedPassword, fullName, phone || null, address || null, birthDate || null]
        );
        
        res.json({ success: true, message: 'Регистрация успешна' });
    } catch (error) {
        if (error.code === '23505') {
            res.status(400).json({ error: 'Email уже используется' });
        } else {
            console.error('Ошибка:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
});

// Вход
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        const user = result.rows[0];
        let valid = false;
        
        if (user.password_hash === password) {
            valid = true;
        } else {
            try {
                valid = await bcrypt.compare(password, user.password_hash);
            } catch (err) {
                valid = false;
            }
        }
        
        if (valid) {
            req.session.userId = user.id;
            req.session.userEmail = user.email;
            req.session.userName = user.full_name;
            
            const sessionCart = req.session.cart;
            if (sessionCart && sessionCart.length > 0) {
                await mergeCartAfterLogin(user.id, sessionCart);
                req.session.cart = [];
            }
            
            await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
            
            res.json({ 
                success: true, 
                user: { 
                    id: user.id, 
                    email: user.email, 
                    fullName: user.full_name 
                } 
            });
        } else {
            res.status(401).json({ error: 'Неверный email или пароль' });
        }
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Выход
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Получение данных пользователя
app.get('/api/user', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Не авторизован' });
    }
    
    try {
        const result = await pool.query(
            'SELECT id, email, full_name, phone, address, birth_date, registration_date, last_login FROM users WHERE id = $1',
            [req.session.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Оформление заказа
app.post('/api/orders', requireAuth, async (req, res) => {
    const { deliveryAddress, deliveryMethod, paymentMethod } = req.body;
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const cartItems = await client.query(
            `SELECT c.*, p.name, p.price 
             FROM cart c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = $1`,
            [req.session.userId]
        );
        
        if (cartItems.rows.length === 0) {
            throw new Error('Корзина пуста');
        }
        
        const totalAmount = cartItems.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, order_number, total_amount, payment_method, delivery_address, delivery_method, status) 
             VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING id`,
            [req.session.userId, orderNumber, totalAmount, paymentMethod, deliveryAddress, deliveryMethod]
        );
        
        const orderId = orderResult.rows[0].id;
        
        for (const item of cartItems.rows) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, size) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [orderId, item.product_id, item.name, item.quantity, item.price, item.size]
            );
            
            await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);
        }
        
        await client.query('DELETE FROM cart WHERE user_id = $1', [req.session.userId]);
        
        await client.query('COMMIT');
        
        res.json({ success: true, orderId, orderNumber });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка:', error);
        res.status(500).json({ error: error.message || 'Ошибка оформления заказа' });
    } finally {
        client.release();
    }
});

// Получение истории заказов
app.get('/api/orders', requireAuth, async (req, res) => {
    try {
        const orders = await pool.query(
            'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
            [req.session.userId]
        );
        
        for (const order of orders.rows) {
            const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
            order.items = items.rows;
        }
        
        res.json(orders.rows);
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ============================================
// СТАТИСТИКА ПРОДАЖ (ПОЛНАЯ ВЕРСИЯ)
// ============================================
app.get('/api/statistics/sales', requireAuth, async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        
        console.log('📊 Запрос статистики за период:', period);
        
        // 1. Продажи по дням
        const salesByDate = await pool.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as orders_count,
                SUM(total_amount) as total_sales,
                AVG(total_amount) as avg_order_value
            FROM orders
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        `);
        console.log('salesByDate:', salesByDate.rows.length);
        
        // 2. Топ товаров
        const topProducts = await pool.query(`
            SELECT 
                p.name,
                p.brand,
                p.category,
                SUM(oi.quantity) as total_sold,
                SUM(oi.price * oi.quantity) as revenue,
                COUNT(DISTINCT oi.order_id) as orders_count
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.id, p.name, p.brand, p.category
            ORDER BY total_sold DESC
            LIMIT 10
        `);
        console.log('topProducts:', topProducts.rows.length);
        
        // 3. Продажи по брендам
        const salesByBrand = await pool.query(`
            SELECT 
                p.brand,
                SUM(oi.quantity) as total_sold,
                SUM(oi.price * oi.quantity) as revenue,
                COUNT(DISTINCT oi.order_id) as orders_count,
                AVG(oi.price) as avg_price
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.brand
            ORDER BY revenue DESC
        `);
        console.log('salesByBrand:', salesByBrand.rows.length);
        
        // 4. Продажи по категориям
        const salesByCategory = await pool.query(`
            SELECT 
                p.category,
                SUM(oi.quantity) as total_sold,
                SUM(oi.price * oi.quantity) as revenue,
                COUNT(DISTINCT oi.order_id) as orders_count
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE p.category IS NOT NULL AND p.category != ''
            GROUP BY p.category
            ORDER BY revenue DESC
        `);
        console.log('salesByCategory:', salesByCategory.rows.length);
        
        // 5. Продажи по размерам
        const salesBySize = await pool.query(`
            SELECT 
                oi.size,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.price * oi.quantity) as revenue,
                COUNT(*) as items_sold
            FROM order_items oi
            WHERE oi.size IS NOT NULL
            GROUP BY oi.size
            ORDER BY oi.size ASC
        `);
        console.log('salesBySize:', salesBySize.rows);
        
        // 6. Общая статистика
        const totalStats = await pool.query(`
            SELECT 
                COUNT(*) as total_orders,
                COUNT(DISTINCT user_id) as total_customers,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(AVG(total_amount), 0) as avg_order_value,
                COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
                COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) as completed_revenue
            FROM orders
        `);
        console.log('totalStats:', totalStats.rows[0]);
        
        // 7. Статистика посещений
        const visitStats = await pool.query(`
            SELECT 
                page_url,
                COUNT(*) as visits,
                COUNT(DISTINCT session_id) as unique_visitors,
                COUNT(DISTINCT user_id) as registered_visitors
            FROM visit_logs
            WHERE visit_time >= NOW() - INTERVAL '30 days'
            GROUP BY page_url
            ORDER BY visits DESC
            LIMIT 10
        `);
        console.log('visitStats:', visitStats.rows.length);
        
        // Отправляем ВСЕ данные
        res.json({
            salesByDate: salesByDate.rows,
            topProducts: topProducts.rows,
            salesByBrand: salesByBrand.rows,
            salesByCategory: salesByCategory.rows,
            salesBySize: salesBySize.rows,
            totalStats: totalStats.rows[0] || {
                total_orders: 0,
                total_customers: 0,
                total_revenue: 0,
                avg_order_value: 0,
                completed_orders: 0,
                completed_revenue: 0
            },
            visitStats: visitStats.rows
        });
        
    } catch (error) {
        console.error('❌ Ошибка статистики:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    }
});

// ============================================
// ОТЛАДОЧНЫЙ ЭНДПОИНТ
// ============================================
app.get('/api/debug/all-data', requireAuth, async (req, res) => {
    try {
        const orders = await pool.query('SELECT * FROM orders');
        const orderItems = await pool.query('SELECT * FROM order_items');
        const products = await pool.query('SELECT * FROM products');
        
        res.json({
            orders_count: orders.rows.length,
            orders: orders.rows,
            order_items_count: orderItems.rows.length,
            order_items: orderItems.rows,
            products: products.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================
app.listen(port, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════╗
    ║     🚀 Сервер интернет-магазина запущен!         ║
    ╠═══════════════════════════════════════════════════╣
    ║  📍 Адрес: http://localhost:${port}                ║
    ║  🗄️  База данных: ${process.env.DB_NAME || 'sneakers_shop'} ║
    ║  👤 Тестовый пользователь: test@example.com       ║
    ║  🔑 Тестовый пароль: test123                      ║
    ╚═══════════════════════════════════════════════════╝
    `);
});