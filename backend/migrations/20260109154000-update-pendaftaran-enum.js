'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Pendaftarans', 'tipe', {
            type: Sequelize.ENUM('PKL1', 'PKL2', 'MBKM'),
            allowNull: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Pendaftarans', 'tipe', {
            type: Sequelize.ENUM('PKL1', 'PKL2'),
            allowNull: false
        });
    }
};
