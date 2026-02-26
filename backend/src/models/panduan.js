'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Panduan extends Model {
        static associate(models) {
            // define association here
        }
    }
    Panduan.init({
        judul: {
            type: DataTypes.STRING,
            allowNull: false
        },
        deskripsi: DataTypes.TEXT,
        fileUrl: DataTypes.STRING,
        kategori: {
            type: DataTypes.STRING,
            defaultValue: 'UMUM'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Panduan',
    });
    return Panduan;
};
