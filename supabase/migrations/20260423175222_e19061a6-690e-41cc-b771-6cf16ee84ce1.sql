drop policy if exists "Anyone authenticated can read app config" on public.app_config;

create policy "Admins read app config" on public.app_config
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));