const { Sequelize, DataTypes } = require("sequelize");
require('dotenv').config()

const isproduction = process.env.NODE_ENV === 'production'
const sequelize = new Sequelize(isproduction ? process.env.DB_NAME : 'clevahack', isproduction ? process.env.DB_USER : 'root', isproduction ? process.env.DB_PASSWORD : '',{
  host: isproduction ? process.env.DB_HOST : 'localhost',
  dialect: isproduction ? process.env.DB_DIALECT : 'mysql',
  dialectOptions: isproduction ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

sequelize.authenticate()
  .then(() => { console.log(`Db connected`) })
  .catch((error) => { console.log(error) })

const db = {}
db.sequelize = sequelize
db.Sequelize = Sequelize

db.users = require('./userModel')(sequelize, DataTypes)
db.notifications = require('./notificationModel')(sequelize, DataTypes)
db.rooms = require('./roomModel')(sequelize, DataTypes)
db.messages = require('./messageModel')(sequelize, DataTypes)
db.subs = require('./subscriptionModel')(sequelize, DataTypes)



//One to Many relationships
db.users.hasMany(db.notifications, { foreignKey: 'userid', as: 'usernotify' })
db.users.hasMany(db.rooms, {foreignKey: 'userid', as:'friend'})
db.users.hasMany(db.subs, {foreignKey: 'userid', as:'subscribers'})
db.rooms.hasMany(db.messages, {foreignKey: 'roomid', as:'room_messages'})


// One to One relationships
db.notifications.belongsTo(db.users, { foreignKey:'userid', as:'usernotify'})
db.messages.belongsTo(db.rooms, {foreignKey: 'roomid', as:'room_messages'})
db.rooms.belongsTo(db.users, {foreignKey:'userid', as:'friend'})
db.subs.belongsTo(db.users, {foreignKey: 'userid', as:'subscriber'})



db.sequelize.sync({ force: false})
  .then(() => console.log(`Connection has been established successfully on ${isproduction ? 'online db' : 'local db'} `))
  .catch((error) => console.log(error))
module.exports = db