const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'sneakers_shop',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function testConnection() {
    try {
        console.log('🔍 Проверка подключения к базе данных...');
        console.log('Параметры:', {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
        
        const client = await pool.connect();
        console.log('✅ Подключение успешно!');
        
        // Проверяем таблицы
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log('📋 Таблицы в базе данных:');
        tables.rows.forEach(table => {
            console.log(`   - ${table.table_name}`);
        });
        
        // Проверяем наличие заказов
        const orders = await client.query('SELECT COUNT(*) as count FROM orders');
        console.log(`📦 Всего заказов: ${orders.rows[0].count}`);
        
        if (orders.rows[0].count > 0) {
            const sampleOrder = await client.query(`
                SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
                       COUNT(oi.id) as items_count
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                GROUP BY o.id
                LIMIT 3
            `);
            console.log('📝 Примеры заказов:');
            sampleOrder.rows.forEach(order => {
                console.log(`   ID: ${order.id}, Номер: ${order.order_number}, Сумма: ${order.total_amount}, Статус: ${order.status}, Товаров: ${order.items_count}`);
            });
        } else {
            console.log('⚠️ В базе данных нет заказов!');
        }
        
        // Проверяем товары
        const products = await client.query('SELECT COUNT(*) as count FROM products');
        console.log(`👟 Всего товаров: ${products.rows[0].count}`);
        
        // Проверяем users
        const users = await client.query('SELECT COUNT(*) as count FROM users');
        console.log(`👤 Всего пользователей: ${users.rows[0].count}`);
        
        client.release();
        await pool.end();
        
    } catch (error) {
        console.error('❌ Ошибка подключения:', error.message);
        console.error('Подробности:', error);
    }
}

testConnection();