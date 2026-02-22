'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Mahasiswa extends Model {
        static associate(models) {
            Mahasiswa.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            Mahasiswa.hasMany(models.Pendaftaran, { foreignKey: 'mahasiswaId', as: 'pendaftaran' });
            Mahasiswa.belongsTo(models.Prodi, { foreignKey: 'prodiId', as: 'prodi' });
        }
    }
    Mahasiswa.init({
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        angkatan: DataTypes.STRING,
        noHp: {
            type: DataTypes.STRING,
            allowNull: true
        },
        prodiId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Mahasiswa',
    });
    return Mahasiswa;
};
