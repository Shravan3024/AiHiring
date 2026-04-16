"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add `timestamp` column with default CURRENT_TIMESTAMP
    await queryInterface.addColumn(
      'admin_audit_logs',
      'timestamp',
      {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('admin_audit_logs', 'timestamp');
  }
};
