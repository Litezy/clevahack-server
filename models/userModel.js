module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user', {
        fullname: { type: DataTypes.STRING, alowNull: false },
        avatar: { type: DataTypes.TEXT, alowNull: true },
        email: { type: DataTypes.STRING, alowNull: false },
        level: { type: DataTypes.STRING, alowNull: false },
        phone_number: { type: DataTypes.STRING, alowNull: true },
        gender: { type: DataTypes.STRING, alowNull: false },
        dob: { type: DataTypes.STRING, alowNull: false },
        location: { type: DataTypes.STRING, alowNull: false },
        password: { type: DataTypes.STRING, alowNull: false },
        unique_id: { type: DataTypes.STRING, alowNull: false },
        code: { type: DataTypes.STRING, alowNull: true },
        role: { type: DataTypes.STRING, alowNull: false, defaultValue: 'student' },
        test_passed: { type: DataTypes.STRING, defaultValue: 'false' },
         verified: { type: DataTypes.STRING, alowNull: false, defaultValue: 'unverified' },
    }) 
}