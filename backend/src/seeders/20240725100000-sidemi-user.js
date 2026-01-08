'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('sidemi123', salt);
    const timestamp = new Date();

    await queryInterface.bulkInsert('Users', [{
      username: 'sidemi',
      password: passwordHash,
      role: 'ADMIN',
      createdAt: timestamp,
      updatedAt: timestamp
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { username: 'sidemi' }, {});
  }
};
