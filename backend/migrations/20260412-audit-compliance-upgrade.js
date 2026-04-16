"use strict";

/**
 * Migration: Audit & Compliance Upgrade
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Add LOGOUT and ACCESS_REVOKED to admin_audit_logs.actionType ENUM
 * 2. Add `metadata` JSON column to admin_audit_logs
 * 3. Add indexes for actionType, userId, entityType+entityId, status, timestamp
 *
 * Safe to run on SQLite (uses raw SQL fallbacks) and PostgreSQL.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    // ── 1. Add `metadata` column ───────────────────────────────────────────
    try {
      await queryInterface.addColumn("admin_audit_logs", "metadata", {
        type: Sequelize.JSON,
        defaultValue: null,
        comment: "Flexible extra payload (confidence, AI config id, etc.)",
        allowNull: true,
      });
      console.log("✅ Added column: admin_audit_logs.metadata");
    } catch (err) {
      if (err.message?.includes("already exists") || err.message?.includes("duplicate column")) {
        console.log("⚠️  Column metadata already exists — skipping");
      } else {
        throw err;
      }
    }

    // ── 2. Handle ENUM upgrade (PostgreSQL only) ───────────────────────────
    if (dialect === "postgres") {
      try {
        await queryInterface.sequelize.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_enum
              WHERE enumlabel = 'LOGOUT'
              AND enumtypid = (
                SELECT oid FROM pg_type WHERE typname = 'enum_admin_audit_logs_actionType'
              )
            ) THEN
              ALTER TYPE "enum_admin_audit_logs_actionType" ADD VALUE 'LOGOUT';
            END IF;
          END
          $$;
        `);
        await queryInterface.sequelize.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_enum
              WHERE enumlabel = 'ACCESS_REVOKED'
              AND enumtypid = (
                SELECT oid FROM pg_type WHERE typname = 'enum_admin_audit_logs_actionType'
              )
            ) THEN
              ALTER TYPE "enum_admin_audit_logs_actionType" ADD VALUE 'ACCESS_REVOKED';
            END IF;
          END
          $$;
        `);
        console.log("✅ ENUM values LOGOUT + ACCESS_REVOKED added (PostgreSQL)");
      } catch (err) {
        console.warn("⚠️  ENUM upgrade skipped:", err.message);
      }
    } else {
      // SQLite — ENUM is stored as TEXT; no ALTER TYPE needed.
      console.log(`ℹ️  Dialect "${dialect}" — ENUM values managed by Sequelize at runtime`);
    }

    // ── 3. Add indexes ─────────────────────────────────────────────────────
    const indexes = [
      { name: "idx_aal_action_type",  fields: ["actionType"] },
      { name: "idx_aal_user_id",      fields: ["userId"] },
      { name: "idx_aal_status",       fields: ["status"] },
      { name: "idx_aal_timestamp",    fields: ["timestamp"] },
      { name: "idx_aal_entity",       fields: ["entityType", "entityId"] },
    ];

    for (const idx of indexes) {
      try {
        await queryInterface.addIndex("admin_audit_logs", idx.fields, {
          name: idx.name,
        });
        console.log(`✅ Index "${idx.name}" created`);
      } catch (err) {
        if (
          err.message?.includes("already exists") ||
          err.message?.includes("SQLITE_ERROR: index") ||
          err.message?.includes("duplicate")
        ) {
          console.log(`⚠️  Index "${idx.name}" already exists — skipping`);
        } else {
          // Non-critical — log and continue
          console.warn(`⚠️  Index "${idx.name}" failed: ${err.message}`);
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove metadata column
    try {
      await queryInterface.removeColumn("admin_audit_logs", "metadata");
    } catch (_) {}

    // Remove indexes
    const indexNames = [
      "idx_aal_action_type",
      "idx_aal_user_id",
      "idx_aal_status",
      "idx_aal_timestamp",
      "idx_aal_entity",
    ];
    for (const name of indexNames) {
      try {
        await queryInterface.removeIndex("admin_audit_logs", name);
      } catch (_) {}
    }
    // NOTE: PostgreSQL ENUM values cannot be removed without full type recreation.
  },
};
