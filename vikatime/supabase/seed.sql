-- VikaTime V2 — Datos de ejemplo (seed)
-- Ejecutar DESPUÉS del schema.sql

-- Planes
insert into plans (name, lunches_per_week, is_active) values
  ('Esencial', 2, true),
  ('Balance', 3, true),
  ('Completo', 5, true);

-- Días del menú
insert into weekly_menu_days (day_key, day_label, is_active, delivery_time, sort_order) values
  ('lunes',     'Lunes',     true,  '12:00–13:00', 1),
  ('martes',    'Martes',    true,  '12:00–13:00', 2),
  ('miercoles', 'Miércoles', true,  '12:00–13:00', 3),
  ('jueves',    'Jueves',    true,  '12:00–13:00', 4),
  ('viernes',   'Viernes',   true,  '12:00–13:00', 5);

-- Items del menú (martes como ejemplo completo)
with d as (select id from weekly_menu_days where day_key = 'martes')
insert into menu_items (day_id, category, name, emoji, sort_order) values
  ((select id from d), 'protein', 'Pechuga de Pollo a la Plancha', '🍗', 1),
  ((select id from d), 'protein', 'Salmón en cubos grillados',     '🐟', 2),
  ((select id from d), 'protein', 'Mechada',                        '🥩', 3),
  ((select id from d), 'carb',    'Arroz Árabe',                    '🍝', 1),
  ((select id from d), 'carb',    'Fettuccini Pesto',               '🍝', 2),
  ((select id from d), 'carb',    'Sorpresa del Chef',              '⭐', 3),
  ((select id from d), 'salad',   'Lechuga',                        '🥗', 1),
  ((select id from d), 'salad',   'Tomate cherry',                  '🍅', 2),
  ((select id from d), 'salad',   'Zanahoria rallada',              '🥕', 3),
  ((select id from d), 'salad',   'Pepino',                         '🥒', 4),
  ((select id from d), 'salad',   'Pimentón',                       '🫑', 5),
  ((select id from d), 'salad',   'Repollo morado',                 '🟣', 6);

-- Jueves
with d as (select id from weekly_menu_days where day_key = 'jueves')
insert into menu_items (day_id, category, name, emoji, sort_order) values
  ((select id from d), 'protein', 'Salmón en cubos grillados',     '🐟', 1),
  ((select id from d), 'protein', 'Pechuga de Pollo a la Plancha', '🍗', 2),
  ((select id from d), 'carb',    'Sorpresa del Chef',              '⭐', 1),
  ((select id from d), 'carb',    'Arroz Árabe',                    '🍝', 2),
  ((select id from d), 'salad',   'Tomate cherry',                  '🍅', 1),
  ((select id from d), 'salad',   'Pepino',                         '🥒', 2),
  ((select id from d), 'salad',   'Pimentón',                       '🫑', 3);

-- Viernes
with d as (select id from weekly_menu_days where day_key = 'viernes')
insert into menu_items (day_id, category, name, emoji, sort_order) values
  ((select id from d), 'protein', 'Mechada',                        '🥩', 1),
  ((select id from d), 'protein', 'Pechuga de Pollo a la Plancha', '🍗', 2),
  ((select id from d), 'carb',    'Fettuccini Pesto',               '🍝', 1),
  ((select id from d), 'carb',    'Arroz Árabe',                    '🍝', 2),
  ((select id from d), 'salad',   'Tomate cherry',                  '🍅', 1),
  ((select id from d), 'salad',   'Repollo morado',                 '🟣', 2),
  ((select id from d), 'salad',   'Pepino',                         '🥒', 3);
