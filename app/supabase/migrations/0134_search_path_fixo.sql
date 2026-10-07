-- Rodada de testes (07/10): o verificador do Supabase pediu search_path fixo nestas 4 funções.
alter function public.dados_do_desenho(scene_drawings) set search_path = public;
alter function public.dados_do_som(scene_sounds) set search_path = public;
alter function public.nome_do_desenho(text, text) set search_path = public;
alter function public.pode_conduzir_acao(chat_messages) set search_path = public;
