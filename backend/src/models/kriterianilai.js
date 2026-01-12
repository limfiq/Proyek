'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class KriteriaNilai extends Model {
        static associate(models) {
            // Can be associated with scores later
        }
    }
    KriteriaNilai.init({
        nama: {
            type: DataTypes.STRING,
            allowNull: false
        },
        bobot: {
            type: DataTypes.FLOAT,
            allowNull: false, // Percentage 0-100
            defaultValue: 0
        },
        role: {
            type: DataTypes.ENUM('PEMBIMBING', 'PENGUJI', 'INSTANSI'),
            allowNull: false
        },
        tipe: {
            type: DataTypes.ENUM('PKL1', 'PKL2', 'MBKM'),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'KriteriaNilai',
    });
    return KriteriaNilai;
};
