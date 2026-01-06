'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Mahasiswa extends Model {
        static associate(models) {
            Mahasiswa.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            Mahasiswa.hasMany(models.Pendaftaran, { foreignKey: 'mahasiswaId', as: 'pendaftaran' });
        }
    }
    Mahasiswa.init({
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        nim: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        nama: {
            type: DataTypes.STRING,
            allowNull: false
        },
        kelas: DataTypes.STRING,
        angkatan: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Mahasiswa',
    });
    return Mahasiswa;
};
