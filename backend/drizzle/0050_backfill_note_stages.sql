-- Recover the stage at creation from recorded moves; leave notes without history unknown.
UPDATE "candidate_notes" AS note
SET "stage_name" = (
  SELECT stage."name"
  FROM "candidate_stage_history" AS history
  JOIN "job_pipeline_stages" AS stage ON stage."id" = history."stage_id"
  WHERE history."candidate_id" = note."candidate_id"
    AND history."moved_at" <= note."created_at"
  ORDER BY history."moved_at" DESC, history."id" DESC
  LIMIT 1
)
WHERE note."stage_name" IS NULL;
