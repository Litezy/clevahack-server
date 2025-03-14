module.exports = (sequelize, DataTypes) => {
    return sequelize.define('notification', {
        type: { type: DataTypes.STRING,allowNull:false },
        message: { type: DataTypes.TEXT },
        status: { type: DataTypes.STRING,defaultValue:'unread' },
        userid: { type: DataTypes.INTEGER },
    })
}