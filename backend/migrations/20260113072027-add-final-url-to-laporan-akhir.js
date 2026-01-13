'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('LaporanAkhirs', 'finalUrl', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'ikuUrl' // Optional: place it after ikuUrl
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('LaporanAkhirs', 'finalUrl');
  }
};
