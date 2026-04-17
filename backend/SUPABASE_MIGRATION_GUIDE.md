# 🚀 Supabase Production Migration Guide - Mask Polymers

This document outlines the architecture and technical setup for the Mask Polymers backend migration to **Supabase PostgreSQL**.

---

## 🌍 Infrastructure
- **Host**: `aws-1-us-east-1.pooler.supabase.com`
- **Port**: `6543` (IPv4 Compatible Pooler)
- **User**: `postgres.fpwfspxymlnbrwbnosfu`
- **SSL**: Enabled (`rejectUnauthorized: false`)

## 🔑 Environment Variables
Defined in `.env`:
- `DATABASE_URL`: Connection string using the Pooler.
- `SUPABASE_URL`: API gateway for HTTPS requests.
- `JWT_SECRET`: Production token security.

## 🛡️ Hardening Steps
1. **Disabled Auto-Sync**: Removed `sequelize.sync()` to protect production data.
2. **Frozen Tables**: Enabled `freezeTableName: true` to match exact casing in Supabase.
3. **Safe Types**: Replaced `ENUM` with `STRING` and `ARRAY` with `JSON` to avoid schema lock-in.

---
**Status**: `PROD-READY`  
**Date**: April 17, 2026
