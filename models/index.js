const { Sequelize, DataTypes } = require("sequelize");
require('dotenv').config();

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// Separate connection parameters for clarity
const dbConfig = {
  database: isProduction ? process.env.DB_NAME : 'clevahack',
  username: isProduction ? process.env.DB_USER : 'root',
  password: isProduction ? process.env.DB_PASSWORD : '',
  host: isProduction ? process.env.DB_HOST : 'localhost',
  port: isProduction ? process.env.DB_PORT : 3306,
  dialect: isProduction ? process.env.DB_DIALECT || 'mysql' : 'mysql',
  dialectOptions: isProduction ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {},
  // Connection pool settings to improve reliability
  pool: {
    max: 5, // Maximum number of connections in pool
    min: 0, // Minimum number of connections in pool
    acquire: 60000, // Maximum time (ms) to acquire connection (increased from default)
    idle: 10000, // Maximum time (ms) connection can be idle before being released
    evict: 1000, // How frequently to check for idle connections to evict
  },
  // Retry logic for connection failures
  retry: {
    max: 3 // Maximum retry attempts
  },
  // Longer timeouts
  dialectOptions: isProduction ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 60000 // Longer connect timeout (ms)
  } : {},
  // Logging settings
  logging: console.log, // Set to false in production if you want to disable SQL logging
  // Handle disconnects and timeouts
  keepAlive: true,
};

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username, 
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    pool: dbConfig.pool,
    retry: dbConfig.retry,
    logging: dbConfig.logging,
    keepAlive: dbConfig.keepAlive
  }
);

// Try to connect with better error handling
sequelize.authenticate()
  .then(() => { 
    console.log(`Database connected successfully on ${isProduction ? dbConfig.host : 'localhost'}`);
  })
  .catch((error) => { 
    console.error('Unable to connect to the database:', error.message);
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
  });

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Models
db.users = require('./userModel')(sequelize, DataTypes);
db.notifications = require('./notificationModel')(sequelize, DataTypes);
db.rooms = require('./roomModel')(sequelize, DataTypes);
db.messages = require('./messageModel')(sequelize, DataTypes);
db.subs = require('./subscriptionModel')(sequelize, DataTypes);

// One to Many relationships
db.users.hasMany(db.notifications, { foreignKey: 'userid', as: 'usernotify' });
db.users.hasMany(db.rooms, {foreignKey: 'userid', as:'friend'});
db.users.hasMany(db.subs, {foreignKey: 'userid', as:'subscribers'});
db.rooms.hasMany(db.messages, {foreignKey: 'roomid', as:'room_messages'});

// One to One relationships
db.notifications.belongsTo(db.users, { foreignKey:'userid', as:'usernotify'});
db.messages.belongsTo(db.rooms, {foreignKey: 'roomid', as:'room_messages'});
db.rooms.belongsTo(db.users, {foreignKey:'userid', as:'friend'});
db.subs.belongsTo(db.users, {foreignKey: 'userid', as:'subscriber'});

// Sync models with better error handling
db.sequelize.sync({ force: false })
  .then(() => console.log(`Models synced successfully with database`))
  .catch((error) => console.error('Unable to sync models:', error.message));

module.exports = db;