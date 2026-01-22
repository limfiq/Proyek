'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn('LaporanAkhirs', 'ikuUrl', {
                type: Sequelize.STRING,
                allowNull: true
            });
        } catch (e) {
            console.log('Skipping adding column ikuUrl to LaporanAkhirs: ', e.message);
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('LaporanAkhirs', 'ikuUrl');
    }
};
