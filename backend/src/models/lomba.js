'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Lomba extends Model {
        static associate(models) {
            // Define associations here if needed
        }
    }
    Lomba.init({
        judul: {
            type: DataTypes.STRING,
            allowNull: false
        },
        deskripsi: DataTypes.TEXT,
        penyelenggara: DataTypes.STRING,
        tanggalMulai: DataTypes.DATEONLY,
        tanggalSelesai: DataTypes.DATEONLY,
        linkPendaftaran: DataTypes.STRING,
        posterUrl: DataTypes.STRING,
        status: {
            type: DataTypes.ENUM('OPEN', 'CLOSED', 'UPCOMING'),
            defaultValue: 'OPEN'
        }
    }, {
        sequelize,
        modelName: 'Lomba',
    });
    return Lomba;
};
