'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Candidates');

    if (!tableDescription.candidate_type) {
      await queryInterface.addColumn('Candidates', 'candidate_type', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        comment: 'FRESHER or WORKING_PROFESSIONAL'
      });
    }

    if (!tableDescription.domain) {
      await queryInterface.addColumn('Candidates', 'domain', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        comment: 'Domain of interest / industry domain'
      });
    }

    if (!tableDescription.area_of_interest) {
      await queryInterface.addColumn('Candidates', 'area_of_interest', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        comment: 'Area of interest for fresher candidates'
      });
    }

    if (!tableDescription.current_company) {
      await queryInterface.addColumn('Candidates', 'current_company', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        comment: 'Current employer name for working professionals'
      });
    }

    if (!tableDescription.working_address) {
      await queryInterface.addColumn('Candidates', 'working_address', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        comment: 'Work address for working professionals'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Candidates', 'candidate_type');
    await queryInterface.removeColumn('Candidates', 'domain');
    await queryInterface.removeColumn('Candidates', 'area_of_interest');
    await queryInterface.removeColumn('Candidates', 'current_company');
    await queryInterface.removeColumn('Candidates', 'working_address');
  }
};
