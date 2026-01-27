'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasOne(models.Mahasiswa, { foreignKey: 'userId', as: 'mahasiswa' });
            User.hasOne(models.Dosen, { foreignKey: 'userId', as: 'dosen' });
            User.hasOne(models.Instansi, { foreignKey: 'userId', as: 'instansi' });
        }
    }
    User.init({
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('MAHASISWA', 'DOSEN', 'INSTANSI', 'ADMIN', 'SUPERADMIN', 'ADMINPRODI', 'ADMINKEMAHASISWAAN'),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'User',
    });
    return User;
};
