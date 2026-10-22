-- Tabela de cartões de visita
create table public.cartoes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  nome text,
  empresa text,
  cargo text,
  email text,
  telefone text,
  site text,
  endereco text,
  notas text,
  foto_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS: cada usuário acessa apenas seus próprios cartões
alter table public.cartoes enable row level security;

create policy "usuarios veem apenas seus cartoes"
  on public.cartoes for select
  using (auth.uid() = user_id);

create policy "usuarios inserem seus cartoes"
  on public.cartoes for insert
  with check (auth.uid() = user_id);

create policy "usuarios atualizam seus cartoes"
  on public.cartoes for update
  using (auth.uid() = user_id);

create policy "usuarios deletam seus cartoes"
  on public.cartoes for delete
  using (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cartoes_updated_at
  before update on public.cartoes
  for each row execute procedure public.handle_updated_at();

-- Storage bucket para fotos dos cartões
insert into storage.buckets (id, name, public)
values ('cartoes-fotos', 'cartoes-fotos', false);

create policy "usuarios fazem upload das proprias fotos"
  on storage.objects for insert
  with check (bucket_id = 'cartoes-fotos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "usuarios veem suas proprias fotos"
  on storage.objects for select
  using (bucket_id = 'cartoes-fotos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "usuarios deletam suas proprias fotos"
  on storage.objects for delete
  using (bucket_id = 'cartoes-fotos' and auth.uid()::text = (storage.foldername(name))[1]);
