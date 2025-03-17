module.exports = (sequelize, DataTypes) => {
    return sequelize.define('subscription', {
        userid: { type: DataTypes.INTEGER, allowNull: false },  
    })
}