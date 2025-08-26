# Supabase Advisors – After Apply (Security)

Date: 2025-08-26
Project: nubi (project_id: nfnmoqepgjyutcbbaqjg)

## Summary
- No security lints reported after apply.
- Previously flagged: `function_search_path_mutable` for `public.archive_and_maybe_drop`.
  - Remediated via: `ALTER FUNCTION public.archive_and_maybe_drop(text, text, boolean) SET search_path = pg_temp;`
  - Rationale: Locks down the function’s search path so it isn't role-mutable.

## Next Steps
- Continue focusing on performance RLS policy improvements (see After-Performance report).
- Review any future functions created to ensure explicit `search_path` if they perform dynamic SQL.

## Verification
- Advisors re-run post-fix returned zero security lints.
