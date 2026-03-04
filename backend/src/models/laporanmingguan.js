'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class LaporanMingguan extends Model {
        static associate(models) {
            LaporanMingguan.belongsTo(models.Pendaftaran, { foreignKey: 'pendaftaranId', as: 'pendaftaran' });
        }
    }
    LaporanMingguan.init({
        pendaftaranId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        mingguKe: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fileUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        signedFileUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        feedback: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
            defaultValue: 'PENDING'
        }
    }, {
        sequelize,
        modelName: 'LaporanMingguan',
        indexes: [
            { fields: ['pendaftaranId'] },
            { fields: ['status'] }
        ]
    });
    return LaporanMingguan;
};
