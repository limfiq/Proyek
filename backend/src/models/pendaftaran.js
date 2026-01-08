'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Pendaftaran extends Model {
        static associate(models) {
            Pendaftaran.belongsTo(models.Mahasiswa, { foreignKey: 'mahasiswaId', as: 'mahasiswa' });
            Pendaftaran.belongsTo(models.Instansi, { foreignKey: 'instansiId', as: 'instansi' });
            Pendaftaran.belongsTo(models.Dosen, { foreignKey: 'dosenPembimbingId', as: 'pembimbing' });
            Pendaftaran.belongsTo(models.Periode, { foreignKey: 'periodeId', as: 'periode' });
            Pendaftaran.hasMany(models.LaporanHarian, { foreignKey: 'pendaftaranId', as: 'laporanHarian' });
            Pendaftaran.hasMany(models.LaporanMingguan, { foreignKey: 'pendaftaranId', as: 'laporanMingguan' });
        }
    }
    Pendaftaran.init({
        mahasiswaId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        instansiId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        dosenPembimbingId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        periodeId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        tipe: {
            type: DataTypes.ENUM('PKL1', 'PKL2', 'MBKM'),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED'),
            defaultValue: 'PENDING'
        },
        judulProject: {
            type: DataTypes.STRING,
            allowNull: true // Only for PKL 2
        }
    }, {
        sequelize,
        modelName: 'Pendaftaran',
    });
    return Pendaftaran;
};
