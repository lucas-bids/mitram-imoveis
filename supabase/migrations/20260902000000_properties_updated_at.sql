-- properties.updated_at só tinha `default now()` no insert. Nenhum trigger o
-- tocava, então ele só mudava quando o formulário do admin o escrevia
-- explicitamente na edição: mover para a lixeira, restaurar ou trocar a imagem
-- de capa deixavam o valor obsoleto.
--
-- O sitemap usa essa coluna como <lastmod>, então ela precisa ser verdadeira
-- para todo caminho de escrita.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS properties_set_updated_at ON public.properties;

CREATE TRIGGER properties_set_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
