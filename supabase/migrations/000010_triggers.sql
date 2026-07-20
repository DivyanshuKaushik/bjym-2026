-- =====================================================================
-- 000010_triggers.sql
-- `updated_at` triggers for admin_users and members were already wired
-- in their own migrations (000003, 000004) so they ship atomically with
-- the table. This file covers everything else: auto-generating
-- membership_id/referral_code on insert, and the after-insert referral
-- bookkeeping (member_referrals row + referrer's referral_count +
-- activity log entry).
-- =====================================================================

create or replace function public.set_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_settings_updated_at on public.settings;
create trigger trg_settings_updated_at
  before update on public.settings
  for each row execute procedure public.set_settings_updated_at();

-- ---- Auto-fill membership_id + referral_code before insert ----
create or replace function public.before_member_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.membership_id is null or new.membership_id = '' then
    new.membership_id := public.generate_membership_id();
  end if;
  if new.referral_code is null or new.referral_code = '' then
    new.referral_code := public.generate_referral_code(new.full_name);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_before_member_insert on public.members;
create trigger trg_before_member_insert
  before insert on public.members
  for each row execute procedure public.before_member_insert();

-- ---- After insert: log the referral + bump the referrer's counter ----
create or replace function public.after_member_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_referrer_membership_id text;
begin
  if new.referred_by_code is not null then
    select membership_id into v_referrer_membership_id
    from public.members
    where referral_code = new.referred_by_code;

    if v_referrer_membership_id is not null then
      insert into public.member_referrals (referrer_membership_id, referred_membership_id)
      values (v_referrer_membership_id, new.membership_id)
      on conflict (referred_membership_id) do nothing;

      perform public.update_referral_stats(v_referrer_membership_id);
    end if;
  end if;

  insert into public.member_status_history (member_id, from_status, to_status, reason)
  values (new.id, null, new.status, 'Initial registration');

  perform public.log_activity('member', new.membership_id, new.full_name, 'member_registered', 'members', new.id::text, '{}'::jsonb);

  return new;
end;
$$;

drop trigger if exists trg_after_member_insert on public.members;
create trigger trg_after_member_insert
  after insert on public.members
  for each row execute procedure public.after_member_insert();
