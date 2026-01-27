'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Kegiatan extends Model {
        static associate(models) {
            // Define associations here if needed
        }
    }
    Kegiatan.init({
        judul: {
            type: DataTypes.STRING,
            allowNull: false
        },
        deskripsi: DataTypes.TEXT,
        lokasi: DataTypes.STRING,
        tanggal: DataTypes.DATE,
        posterUrl: DataTypes.STRING,
        status: {
            type: DataTypes.ENUM('OPEN', 'CLOSED', 'UPCOMING'),
            defaultValue: 'UPCOMING'
        }
    }, {
        sequelize,
        modelName: 'Kegiatan',
    });
    return Kegiatan;
};
