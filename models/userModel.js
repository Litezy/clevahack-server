module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user', {
        firstname: { type: DataTypes.STRING, alowNull: false },
        avatar: { type: DataTypes.TEXT, alowNull: true },
        lastname: { type: DataTypes.STRING, alowNull: false },
        email: { type: DataTypes.STRING, alowNull: false },
        phone: { type: DataTypes.STRING, alowNull: true },
        gender: { type: DataTypes.STRING, alowNull: false },
        password: { type: DataTypes.STRING, alowNull: false },
        unique_id: { type: DataTypes.STRING, alowNull: false },
        code: { type: DataTypes.STRING, alowNull: true },
        role: { type: DataTypes.STRING, alowNull: false, defaultValue: 'student' },
         verified: { type: DataTypes.STRING, alowNull: false, defaultValue: 'unverified' },
    })
}