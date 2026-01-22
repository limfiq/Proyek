'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Sidangs', 'status', {
            type: Sequelize.ENUM('BELUM', 'SUDAH'),
            allowNull: false,
            defaultValue: 'BELUM'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Sidangs', 'status');
    }
};
