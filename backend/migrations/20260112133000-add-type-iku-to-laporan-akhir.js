'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn('LaporanAkhirs', 'type_iku', {
                type: Sequelize.STRING,
                allowNull: true
            });
        } catch (e) {
            console.log('Skipping adding column type_iku to LaporanAkhirs: ', e.message);
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('LaporanAkhirs', 'type_iku');
    }
};
