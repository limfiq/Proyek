'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Sidang extends Model {
        static associate(models) {
            Sidang.belongsTo(models.Pendaftaran, { foreignKey: 'pendaftaranId', as: 'pendaftaran' });
            Sidang.belongsTo(models.Dosen, { foreignKey: 'dosenPengujiId', as: 'penguji' });
        }
    }
    Sidang.init({
        pendaftaranId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        dosenPengujiId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        tanggal: DataTypes.DATE,
        ruang: DataTypes.STRING,
        sesi: DataTypes.STRING,
        nilaiAkhir: DataTypes.FLOAT,
        revisiPenguji: DataTypes.TEXT,
        status: {
            type: DataTypes.ENUM('BELUM', 'SUDAH'),
            defaultValue: 'BELUM'
        }
    }, {
        sequelize,
        modelName: 'Sidang',
    });
    return Sidang;
};
