-- 003_cuerpo.sql — cuerpo Tiptap (jsonb) para el editor visual del panel.
-- Convive con `contenido` (text legacy del mock) durante la transición.
alter table public.notas add column if not exists cuerpo jsonb;
