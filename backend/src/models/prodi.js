'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Prodi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Prodi.hasMany(models.Mahasiswa, { foreignKey: 'prodiId', as: 'mahasiswas' });
    }
  }
  Prodi.init({
    nama: DataTypes.STRING,
    jenjang: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Prodi',
  });
  return Prodi;
};