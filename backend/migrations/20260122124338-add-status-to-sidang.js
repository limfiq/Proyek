'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn('Sidangs', 'status', {
                type: Sequelize.ENUM('BELUM', 'SUDAH'),
                allowNull: false,
                defaultValue: 'BELUM'
            });
        } catch (e) {
            console.log("Skipping adding column status to Sidangs: ", e.message);
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Sidangs', 'status');
    }
};
