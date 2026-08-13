-- Prevent the same posting from being saved twice for the same user.
-- A plain UNIQUE constraint (not a partial index) is used deliberately: SQL's
-- standard NULL semantics already let unlimited NULL source_url rows coexist
-- per user (NULL is never equal to NULL), which is exactly what's wanted for
-- any row that never had a source URL. This also matches PostgREST's
-- .upsert(rows, { onConflict: 'user_id,source_url' }) target shape directly,
-- unlike a partial unique index, which needs a matching WHERE clause on the
-- ON CONFLICT clause itself to be usable as an arbiter.
ALTER TABLE jobs
  ADD CONSTRAINT jobs_user_source_url_unique UNIQUE (user_id, source_url);
