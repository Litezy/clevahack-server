const { Sequelize, DataTypes } = require("sequelize");
require('dotenv').config()

const isproduction = process.env.NODE_ENV === 'production'
const sequelize = new Sequelize(isproduction ? process.env.DB_NAME : 'clevahack', isproduction ? process.env.DB_USER : 'root', isproduction ? process.env.DB_PASSWORD : '', {
  host: isproduction ? process.env.DB_HOST : 'localhost',
  dialect: isproduction ? process.env.DB_DIALECT : 'mysql'
});

sequelize.authenticate()
  .then(() => { console.log(`Db connected`) })
  .catch((error) => { console.log(error) })

const db = {}
db.sequelize = sequelize
db.Sequelize = Sequelize

db.users = require('./userModel')(sequelize, DataTypes)
db.notifications = require('./notificationModel')(sequelize, DataTypes)



//One to Many relationships
db.users.hasMany(db.notifications, { foreignKey: 'userid', as: 'usernotify' })


// One to One relationships
db.notifications.belongsTo(db.users, { foreignKey:'userid', as:'usernotify'})


db.sequelize.sync({ force: false})
  .then(() => console.log(`Connection has been established successfully on ${isproduction ? 'online db' : 'local db'} `))
  .catch((error) => console.log(error))
module.exports = db