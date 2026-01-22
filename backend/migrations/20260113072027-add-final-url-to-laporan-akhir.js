'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('LaporanAkhirs', 'finalUrl', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'ikuUrl' // Optional: place it after ikuUrl
      });
    } catch (e) {
      console.log('Skipping adding column finalUrl to LaporanAkhirs: ', e.message);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('LaporanAkhirs', 'finalUrl');
  }
};
