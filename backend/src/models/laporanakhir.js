'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class LaporanAkhir extends Model {
        static associate(models) {
            LaporanAkhir.belongsTo(models.Pendaftaran, { foreignKey: 'pendaftaranId', as: 'pendaftaran' });
        }
    }
    LaporanAkhir.init({
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
        modelName: 'LaporanAkhir',
    });
    return LaporanAkhir;
};
