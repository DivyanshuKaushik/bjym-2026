-- =====================================================================
-- 000021_previous_membership.sql
--
-- New registration question: "क्या आप पूर्व में भाजयुमो के सदस्य अथवा
-- किसी सांगठनिक दायित्व पर रहे हैं?" (Have you previously been a BJYM
-- member or held any organizational responsibility?) — Yes/No, asked
-- right after the declaration checkbox in the Security step.
--
-- Nullable so existing members (registered before this question existed)
-- simply have NULL — not "No" — since we genuinely don't know their
-- answer, and NULL correctly reflects that rather than assuming either
-- way.
-- =====================================================================

alter table public.members
  add column if not exists was_previous_member boolean;

comment on column public.members.was_previous_member is
  'Self-declared at registration: previously a BJYM member or held an organizational responsibility. NULL = registered before this question existed / not answered.';
