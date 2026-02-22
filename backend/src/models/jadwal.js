'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Jadwal extends Model {
        static associate(models) {
            // No direct associations needed yet, but could associate with Periode if desired
        }
    }
    Jadwal.init({
        namaKegiatan: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tanggal: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        kategori: {
            type: DataTypes.ENUM('PKL1', 'PKL2', 'MBKM', 'MBKM2', 'GENERAL'),
            allowNull: false,
            defaultValue: 'GENERAL'
        }
    }, {
        sequelize,
        modelName: 'Jadwal',
    });
    return Jadwal;
};
