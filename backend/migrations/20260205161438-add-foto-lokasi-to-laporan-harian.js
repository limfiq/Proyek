'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('LaporanHarians', 'foto', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('LaporanHarians', 'lokasi', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('LaporanHarians', 'foto');
    await queryInterface.removeColumn('LaporanHarians', 'lokasi');
  }
};
