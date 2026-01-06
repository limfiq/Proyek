'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Periode extends Model {
        static associate(models) {
            Periode.hasMany(models.Pendaftaran, { foreignKey: 'periodeId', as: 'pendaftaran' });
        }
    }
    Periode.init({
        nama: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Periode',
    });
    return Periode;
};
