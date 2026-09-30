-- Campos necessários para o feed XML (formato VrSync) do OLX/ZAP/VivaReal.
--
-- O GrupoZap não expõe uma API: a imobiliária hospeda um XML numa URL pública
-- e o crawler deles baixa o arquivo a cada 12h. Três coisas do nosso modelo
-- não conseguiam ser expressas nesse formato:
--
--   1. `property_types` e `features` são tabelas livres, editáveis pelo admin,
--      enquanto o VrSync exige enums fechados. Daí as colunas de mapeamento.
--   2. Não havia como escolher quais imóveis vão para o portal — e isso
--      importa porque o plano do OLX tem cota paga e porque um imóvel que já
--      existe cadastrado manualmente no Canal Pro é rejeitado por duplicidade
--      (o manual vence, o do XML fica bloqueado com erro).
--   3. `Location` exige `displayAddress` e `Iptu` exige `period` — nenhum dos
--      dois existia.

-- ---------------------------------------------------------------------------
-- 1. Mapeamento de tipo de imóvel -> enum PropertyType/UsageType do VrSync
-- ---------------------------------------------------------------------------
-- `olx_property_type` usa o formato "Categoria / Subtipo" da doc. Fica NULL
-- para tipos novos criados pelo admin: sem mapeamento o imóvel simplesmente
-- não entra no feed, em vez de gerar um anúncio inválido.

ALTER TABLE property_types
  ADD COLUMN IF NOT EXISTS olx_property_type text,
  ADD COLUMN IF NOT EXISTS olx_usage_type text;

ALTER TABLE property_types
  DROP CONSTRAINT IF EXISTS property_types_olx_usage_type_check;
ALTER TABLE property_types
  ADD CONSTRAINT property_types_olx_usage_type_check
  CHECK (olx_usage_type IS NULL OR olx_usage_type IN ('Residential', 'Commercial', 'Residential / Commercial'));

UPDATE property_types SET
  olx_property_type = CASE slug
    WHEN 'casa'                THEN 'Residential / Home'
    WHEN 'apartamento'         THEN 'Residential / Apartment'
    WHEN 'sobrado'             THEN 'Residential / Sobrado'
    WHEN 'terreno'             THEN 'Residential / Land Lot'
    WHEN 'chacara'             THEN 'Residential / Farm Ranch'
    WHEN 'casa-em-condominio'  THEN 'Residential / Condo'
  END,
  olx_usage_type = 'Residential'
WHERE slug IN ('casa', 'apartamento', 'sobrado', 'terreno', 'chacara', 'casa-em-condominio');

-- ---------------------------------------------------------------------------
-- 2. Mapeamento de características -> enum Feature do VrSync
-- ---------------------------------------------------------------------------
-- Lista fechada de ~200 valores em inglês. Característica sem `olx_code` é
-- omitida do feed (não invalida o anúncio).

ALTER TABLE features ADD COLUMN IF NOT EXISTS olx_code text;

-- `parquinho` e `playground` caem no mesmo código de propósito: são a mesma
-- coisa para o portal. `featureList()` em `vrsync.ts` deduplica, então um
-- imóvel marcado com os dois emite um único <Feature>.
UPDATE features SET olx_code = CASE slug
    WHEN 'churrasqueira'    THEN 'BBQ'
    WHEN 'piscina'          THEN 'Pool'
    WHEN 'elevador'         THEN 'Elevator'
    WHEN 'sacada'           THEN 'Balcony'
    WHEN 'area-de-servico'  THEN 'Laundry'
    WHEN 'portaria-24h'     THEN 'Concierge 24h'
    WHEN 'area-gourmet'     THEN 'Gourmet Area'
    WHEN 'parquinho'        THEN 'Playground'
    WHEN 'playground'       THEN 'Playground'
  END
WHERE slug IN (
  'churrasqueira', 'piscina', 'elevador', 'sacada', 'area-de-servico',
  'portaria-24h', 'area-gourmet', 'parquinho', 'playground'
);

-- ---------------------------------------------------------------------------
-- 3. Colunas novas em properties
-- ---------------------------------------------------------------------------

-- `olx_enabled` é opt-out para imóveis novos (default true) mas precisa nascer
-- false para todo imóvel que já existe: o lançamento começa com o feed vazio e
-- o admin habilita um ou dois imóveis para testar. Isso também evita conflito
-- de duplicidade com os anúncios que já estão no Canal Pro cadastrados à mão.
--
-- Os dois ALTERs abaixo são propositais e a ordem importa: o primeiro preenche
-- as linhas existentes com `false`, o segundo faz todo INSERT futuro nascer
-- `true`. Um único ADD COLUMN ... DEFAULT true preencheria tudo com true.
ALTER TABLE properties ADD COLUMN IF NOT EXISTS olx_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE properties ALTER COLUMN olx_enabled SET DEFAULT true;

-- O que o portal mostra publicamente do endereço. `Street` (rua sem número) é
-- o default conservador: não expõe o número do imóvel sem uma escolha
-- explícita de quem cadastrou.
ALTER TABLE properties ADD COLUMN IF NOT EXISTS display_address text NOT NULL DEFAULT 'Street';

ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_display_address_check;
ALTER TABLE properties
  ADD CONSTRAINT properties_display_address_check
  CHECK (display_address IN ('All', 'Street', 'Neighborhood'));

-- `iptu` guardava um número solto, sem dizer se era anual ou mensal. O VrSync
-- exige o atributo `period`; a doc usa `Yearly` como default.
ALTER TABLE properties ADD COLUMN IF NOT EXISTS iptu_period text NOT NULL DEFAULT 'Yearly';

ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_iptu_period_check;
ALTER TABLE properties
  ADD CONSTRAINT properties_iptu_period_check
  CHECK (iptu_period IN ('Yearly', 'Monthly'));

-- Dados de prédio: opcionais no VrSync (`YearBuilt`, `Floors`). `floor` (andar
-- da unidade, -> `UnitFloor`) já existia na tabela desde o schema inicial.
ALTER TABLE properties ADD COLUMN IF NOT EXISTS year_built integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS building_floors integer;

CREATE INDEX IF NOT EXISTS idx_properties_olx_enabled ON properties(olx_enabled);

-- ---------------------------------------------------------------------------
-- 4. internal_code imutável
-- ---------------------------------------------------------------------------
-- `internal_code` é o <ListingID> do feed. Renomear um código faz o OLX ver o
-- anúncio antigo sumir e um novo aparecer — na prática exclui e recria o
-- anúncio, perdendo a idade e o ranking dele no portal.
--
-- A trava precisa estar no banco, não só no formulário: a escrita de imóveis
-- roda client-side através de `@/lib/supabase/client`, então a autorização vem
-- de RLS e constraints, não de um server action. Mesmo padrão de
-- `prevent_profile_role_escalation`.
--
-- auth.uid() é NULL para o service_role e para sessões do SQL Editor; ambos
-- continuam podendo corrigir dados manualmente.

CREATE OR REPLACE FUNCTION public.prevent_internal_code_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.internal_code IS DISTINCT FROM OLD.internal_code
     AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'O código do imóvel não pode ser alterado depois do cadastro.'
      USING ERRCODE = 'integrity_constraint_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_internal_code_immutable ON public.properties;

CREATE TRIGGER enforce_internal_code_immutable
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_internal_code_change();
