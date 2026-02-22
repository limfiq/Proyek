'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Sppd extends Model {
        static associate(models) {
            Sppd.belongsTo(models.Dosen, { foreignKey: 'dosenId', as: 'dosen' });
            Sppd.belongsTo(models.Pendaftaran, { foreignKey: 'pendaftaranId', as: 'pendaftaran' });
        }
    }
    Sppd.init({
        dosenId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        pendaftaranId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        tanggal: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        lokasi: {
            type: DataTypes.STRING,
            allowNull: false
        },
        yangDitemui: {
            type: DataTypes.STRING,
            allowNull: false
        },
        koordinat: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fotoUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        keterangan: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Sppd',
    });
    return Sppd;
};
