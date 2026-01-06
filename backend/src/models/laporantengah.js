'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class LaporanTengah extends Model {
        static associate(models) {
            LaporanTengah.belongsTo(models.Pendaftaran, { foreignKey: 'pendaftaranId', as: 'pendaftaran' });
        }
    }
    LaporanTengah.init({
        pendaftaranId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fileUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('SUBMITTED', 'APPROVED', 'REJECTED'),
            defaultValue: 'SUBMITTED'
        }
    }, {
        sequelize,
        modelName: 'LaporanTengah',
    });
    return LaporanTengah;
};
