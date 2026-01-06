'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class LaporanHarian extends Model {
        static associate(models) {
            LaporanHarian.belongsTo(models.Pendaftaran, { foreignKey: 'pendaftaranId', as: 'pendaftaran' });
        }
    }
    LaporanHarian.init({
        pendaftaranId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        tanggal: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        kegiatan: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'),
            defaultValue: 'DRAFT'
        },
        feedback: DataTypes.TEXT,
        ttdUrl: DataTypes.STRING // URL to signature image if handled programmatically or boolean
    }, {
        sequelize,
        modelName: 'LaporanHarian',
    });
    return LaporanHarian;
};
