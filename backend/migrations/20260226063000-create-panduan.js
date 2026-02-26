'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Panduans', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            judul: {
                type: Sequelize.STRING,
                allowNull: false
            },
            deskripsi: {
                type: Sequelize.TEXT
            },
            fileUrl: {
                type: Sequelize.STRING
            },
            kategori: {
                type: Sequelize.STRING,
                defaultValue: 'UMUM'
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Panduans');
    }
};
