'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Instansi extends Model {
        static associate(models) {
            Instansi.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            Instansi.hasMany(models.Pendaftaran, { foreignKey: 'instansiId', as: 'pkl' });
            Instansi.hasMany(models.Loker, { foreignKey: 'instansiId', as: 'loker' });
        }
    }
    Instansi.init({
        userId: {
            type: DataTypes.INTEGER,
            // allowNull: true, // Instansi might not always have a user login immediately if just listed? User said instant can input values so they need login.
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        nama: {
            type: DataTypes.STRING,
            allowNull: false
        },
        alamat: DataTypes.TEXT,
        kontak: DataTypes.STRING,
        mapsUrl: DataTypes.STRING,
        pimpinan: DataTypes.STRING,
        logoUrl: DataTypes.STRING,
        noSurat: DataTypes.STRING,
        isProposed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        posisi: DataTypes.STRING,      // e.g. "Frontend Developer"
        kota: DataTypes.STRING,        // e.g. "Jakarta"
        jenisLowongan: DataTypes.STRING, // e.g. "Magang Bersertifikat", "MBKM"
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Instansi',
    });
    return Instansi;
};
