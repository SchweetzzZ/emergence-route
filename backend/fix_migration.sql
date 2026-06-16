UPDATE "_prisma_migrations" 
SET "finished_at" = NOW(), "logs" = NULL 
WHERE "migration_name" = '20260615234051_add_table_tracking';
