'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Loker extends Model {
        static associate(models) {
            Loker.belongsTo(models.Instansi, { foreignKey: 'instansiId', as: 'instansi' });
            Loker.hasMany(models.Pendaftaran, { foreignKey: 'lokerId', as: 'pendaftar' });
        }
    }
    Loker.init({
        instansiId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Instansis',
                key: 'id'
            }
        },
        posisi: {
            type: DataTypes.STRING,
            allowNull: false
        },
        jenisLowongan: {
            type: DataTypes.ENUM('Magang Reguler', 'Magang Bersertifikat', 'Magang Mandiri', 'MBKM', 'Lowongan Pekerjaan'),
            allowNull: false
        },
        kota: DataTypes.STRING, // Can differ from Instansi address
        deskripsi: DataTypes.TEXT,
        kuota: DataTypes.INTEGER,
        status: {
            type: DataTypes.ENUM('OPEN', 'CLOSED'),
            defaultValue: 'OPEN'
        }
    }, {
        sequelize,
        modelName: 'Loker',
    });
    return Loker;
};
