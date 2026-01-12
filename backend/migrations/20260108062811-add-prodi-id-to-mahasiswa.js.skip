'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Mahasiswas', 'prodiId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Prodis',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Mahasiswas', 'prodiId');
  }
};
