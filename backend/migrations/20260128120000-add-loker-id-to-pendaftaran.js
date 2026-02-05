'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Pendaftarans', 'lokerId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Lokers',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Pendaftarans', 'lokerId');
    }
};
