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
        type_iku: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ikuUrl: {
            type: DataTypes.STRING,
            allowNull: true
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
