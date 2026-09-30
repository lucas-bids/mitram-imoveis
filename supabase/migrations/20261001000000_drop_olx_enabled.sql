-- Remove `properties.olx_enabled`, criado em 20260922000000_olx_feed_fields.sql.
--
-- O XML é a única fonte de anúncios do OLX/ZAP/VivaReal: a carga do feed
-- substitui tudo o que existe no portal, então não há anúncio manual com o
-- qual conflitar. O opt-out por imóvel perdeu o sentido — todo imóvel
-- publicado entra no feed (ver src/features/feed/queries.ts).

DROP INDEX IF EXISTS idx_properties_olx_enabled;
ALTER TABLE properties DROP COLUMN IF EXISTS olx_enabled;
