module.exports = (sequelize, DataTypes) =>{
    return sequelize.define('room',{
        sender: {type: DataTypes.INTEGER},
        userid: {type: DataTypes.INTEGER},
        receiver: {type: DataTypes.INTEGER},
    })
}