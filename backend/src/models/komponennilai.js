'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class KomponenNilai extends Model {
        static associate(models) {
            KomponenNilai.belongsTo(models.Pendaftaran, { foreignKey: 'pendaftaranId', as: 'pendaftaran' });
            KomponenNilai.belongsTo(models.KriteriaNilai, { foreignKey: 'kriteriaNilaiId', as: 'kriteria' });
        }
    }
    KomponenNilai.init({
        pendaftaranId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        kriteriaNilaiId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        jenis: {
            type: DataTypes.ENUM('HARIAN', 'LOGBOOK', 'MONEV', 'PEMBIMBING', 'PENGUJI', 'INSTANSI'),
            allowNull: false
        },
        nilai: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'KomponenNilai',
    });
    return KomponenNilai;
};
