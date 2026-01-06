'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Dosen extends Model {
        static associate(models) {
            Dosen.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            Dosen.hasMany(models.Pendaftaran, { foreignKey: 'dosenPembimbingId', as: 'bimbingan' });
            // Sidang relation
            // Dosen.hasMany(models.Sidang, { foreignKey: 'dosenPengujiId', as: 'ujiID' });
        }
    }
    Dosen.init({
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        nidn: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        nama: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Dosen',
    });
    return Dosen;
};
