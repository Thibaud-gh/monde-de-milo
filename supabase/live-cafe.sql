-- Run on the existing Milo project to enable private live café controls.
begin;

drop policy if exists "Milo parent receives own live cafe" on realtime.messages;
create policy "Milo parent receives own live cafe"
on realtime.messages for select to authenticated
using (
  extension = 'broadcast'
  and (select realtime.topic()) = 'milo-cafe:' || (select auth.uid())::text
);

drop policy if exists "Milo parent sends to own live cafe" on realtime.messages;
create policy "Milo parent sends to own live cafe"
on realtime.messages for insert to authenticated
with check (
  extension = 'broadcast'
  and (select realtime.topic()) = 'milo-cafe:' || (select auth.uid())::text
);

commit;
