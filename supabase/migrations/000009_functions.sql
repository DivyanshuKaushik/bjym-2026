-- =====================================================================
-- 000009_functions.sql
-- Reusable server-side functions. All are SECURITY DEFINER since the
-- app always connects with the service-role key (see src/lib/db/client.ts)
-- — that key already bypasses RLS, so SECURITY DEFINER here is about
-- keeping search_path pinned, not about elevating privilege further.
-- =====================================================================

-- ---- Membership ID: BJYM-CG-{year}-{000001}, never reused ----
create or replace function public.generate_membership_id()
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  cur_year int := extract(year from now());
  next_serial int;
begin
  insert into public.membership_sequences (year, last_serial)
  values (cur_year, 1)
  on conflict (year) do update set last_serial = public.membership_sequences.last_serial + 1
  returning last_serial into next_serial;

  return 'BJYM-CG-' || cur_year || '-' || lpad(next_serial::text, 6, '0');
end;
$$;

-- ---- Referral code: 5-letter name prefix + 5 random alnum chars ----
create or replace function public.generate_referral_code(p_name text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  base text;
  candidate text;
  i int := 0;
begin
  base := upper(regexp_replace(coalesce(split_part(p_name, ' ', 1), 'BJYM'), '[^a-zA-Z]', '', 'g'));
  base := left(coalesce(nullif(base, ''), 'BJYM'), 5);
  loop
    candidate := base || substr(replace(gen_random_uuid()::text, '-', ''), 1, 5);
    exit when not exists (select 1 from public.members where referral_code = upper(candidate));
    i := i + 1;
    exit when i > 20;
  end loop;
  return upper(candidate);
end;
$$;

-- ---- Referral stats: bump the referrer's denormalized counter ----
create or replace function public.update_referral_stats(p_referrer_membership_id text)
returns void
language sql
security definer set search_path = public
as $$
  update public.members
  set referral_count = referral_count + 1
  where membership_id = p_referrer_membership_id;
$$;

-- ---- Generic activity log entry ----
create or replace function public.log_activity(
  p_actor_type text, p_actor_id text, p_actor_label text,
  p_action text, p_target_table text, p_target_id text, p_meta jsonb default '{}'::jsonb
)
returns void
language sql
security definer set search_path = public
as $$
  insert into public.activity_logs (actor_type, actor_id, actor_label, action, target_table, target_id, meta)
  values (p_actor_type, p_actor_id, p_actor_label, p_action, p_target_table, p_target_id, p_meta);
$$;

-- ---- Status transition helpers (all log to member_status_history + activity_logs) ----

create or replace function public.soft_delete_member(p_member_id uuid, p_admin_id uuid, p_reason text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_old_status text;
begin
  select status into v_old_status from public.members where id = p_member_id;

  update public.members
  set status = 'Deleted', deleted_at = now(), deleted_by = p_admin_id, updated_by = p_admin_id
  where id = p_member_id;

  insert into public.member_status_history (member_id, from_status, to_status, reason, changed_by)
  values (p_member_id, v_old_status, 'Deleted', p_reason, p_admin_id);

  perform public.log_activity('admin', p_admin_id::text, null, 'member_soft_deleted', 'members', p_member_id::text, jsonb_build_object('reason', p_reason));
end;
$$;

create or replace function public.suspend_member(p_member_id uuid, p_admin_id uuid, p_reason text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_old_status text;
begin
  select status into v_old_status from public.members where id = p_member_id;

  update public.members
  set status = 'Suspended', suspended_at = now(), suspended_by = p_admin_id, updated_by = p_admin_id
  where id = p_member_id;

  insert into public.member_status_history (member_id, from_status, to_status, reason, changed_by)
  values (p_member_id, v_old_status, 'Suspended', p_reason, p_admin_id);

  perform public.log_activity('admin', p_admin_id::text, null, 'member_suspended', 'members', p_member_id::text, jsonb_build_object('reason', p_reason));
end;
$$;

create or replace function public.restore_member(p_member_id uuid, p_admin_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_old_status text;
begin
  select status into v_old_status from public.members where id = p_member_id;

  update public.members
  set status = 'Active', deleted_at = null, deleted_by = null, suspended_at = null, suspended_by = null, updated_by = p_admin_id
  where id = p_member_id;

  insert into public.member_status_history (member_id, from_status, to_status, reason, changed_by)
  values (p_member_id, v_old_status, 'Active', 'Restored/activated by admin', p_admin_id);

  perform public.log_activity('admin', p_admin_id::text, null, 'member_activated', 'members', p_member_id::text, '{}'::jsonb);
end;
$$;

-- ---- Reset a member's MPIN (hash computed in the app with bcrypt, passed in) ----
create or replace function public.reset_member_mpin(p_member_id uuid, p_new_mpin_hash text, p_admin_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.members
  set mpin_hash = p_new_mpin_hash, token_version = token_version + 1, updated_by = p_admin_id
  where id = p_member_id;

  perform public.log_activity('admin', p_admin_id::text, null, 'mpin_reset', 'members', p_member_id::text, '{}'::jsonb);
end;
$$;
