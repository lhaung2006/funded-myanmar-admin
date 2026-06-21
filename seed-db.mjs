import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function seedDatabase() {
  let connection;

  try {
    // Parse the DATABASE_URL
    const url = new URL(DATABASE_URL);
    const config = {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: url.searchParams.get('ssl') ? JSON.parse(url.searchParams.get('ssl')) : undefined,
    };

    connection = await mysql.createConnection(config);
    console.log('Connected to database');

    // Insert demo trader
    const traderResult = await connection.execute(
      `INSERT INTO traders (userId, traderName, email, accountNumber, challengeStatus, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [1, 'Demo Trader', 'trader@fundedmyanmar.com', 'ACC-001', 'active']
    );

    const traderId = traderResult[0].insertId;
    console.log(`Created trader with ID: ${traderId}`);

    // Insert demo trading metrics
    await connection.execute(
      `INSERT INTO tradingMetrics (
        traderId, balance, equity, profitTarget, dailyDrawdown, dailyDrawdownLimit,
        maxDrawdown, maxDrawdownLimit, tradingDaysUsed, tradingDaysLimit, winRate,
        totalTrades, challengeStartDate, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [
        traderId,
        1050000,      // balance: $10,500
        1075000,      // equity: $10,750
        100000,       // profitTarget: $1,000
        -25000,       // dailyDrawdown: -$250
        50000,        // dailyDrawdownLimit: $500
        -40000,       // maxDrawdown: -$400
        100000,       // maxDrawdownLimit: $1,000
        5,            // tradingDaysUsed: 5
        30,           // tradingDaysLimit: 30
        65,           // winRate: 65%
        20,           // totalTrades: 20
      ]
    );

    console.log('Created trading metrics');

    // Verify the data
    const [traders] = await connection.execute('SELECT * FROM traders');
    const [metrics] = await connection.execute('SELECT * FROM tradingMetrics');

    console.log('\n✅ Database seeded successfully!');
    console.log(`\nTraders (${traders.length}):`);
    console.table(traders);
    console.log(`\nMetrics (${metrics.length}):`);
    console.table(metrics);

    console.log('\n📝 Demo Credentials:');
    console.log('Admin Login: admin@fundedmyammer.com / password123');
    console.log('Trader Email: trader@fundedmyammer.com');
    console.log('Account Number: ACC-001');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
