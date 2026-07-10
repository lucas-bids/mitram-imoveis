-- Insert default Admin (password handled by Supabase Auth, but we can't create Auth easily in pure SQL without pgcrypto/extensions, usually we do it via Dashboard)
-- So the seed will insert types, cities, neighborhoods, features, and properties.

-- We assume an admin user exists or we create properties without checking auth (bypassing RLS or running as superuser)

-- Property Types
INSERT INTO property_types (id, name, slug, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', 'Casa', 'casa', 1),
('22222222-2222-2222-2222-222222222222', 'Apartamento', 'apartamento', 2),
('33333333-3333-3333-3333-333333333333', 'Sobrado', 'sobrado', 3),
('44444444-4444-4444-4444-444444444444', 'Terreno', 'terreno', 4),
('55555555-5555-5555-5555-555555555555', 'Chácara', 'chacara', 5),
('66666666-6666-6666-6666-666666666666', 'Casa em condomínio', 'casa-em-condominio', 6)
ON CONFLICT (slug) DO NOTHING;

-- Cities
INSERT INTO cities (id, name, state, slug) VALUES
('aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Curitiba', 'PR', 'curitiba')
ON CONFLICT (slug) DO NOTHING;

-- Neighborhoods
INSERT INTO neighborhoods (id, city_id, name, slug) VALUES
('bbbb1111-bbbb-1111-bbbb-1111bbbb1111', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Hauer', 'hauer'),
('bbbb2222-bbbb-2222-bbbb-2222bbbb2222', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Santa Felicidade', 'santa-felicidade'),
('bbbb3333-bbbb-3333-bbbb-3333bbbb3333', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Guaíra', 'guaira'),
('bbbb4444-bbbb-4444-bbbb-4444bbbb4444', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Bigorrilho', 'bigorrilho'),
('bbbb5555-bbbb-5555-bbbb-5555bbbb5555', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Pilarzinho', 'pilarzinho'),
('bbbb6666-bbbb-6666-bbbb-6666bbbb6666', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Abranches', 'abranches')
ON CONFLICT (city_id, slug) DO NOTHING;

-- Features
INSERT INTO features (id, name, slug) VALUES
('cccc1111-cccc-1111-cccc-1111cccc1111', 'Churrasqueira', 'churrasqueira'),
('cccc2222-cccc-2222-cccc-2222cccc2222', 'Piscina', 'piscina'),
('cccc3333-cccc-3333-cccc-3333cccc3333', 'Elevador', 'elevador'),
('cccc4444-cccc-4444-cccc-4444cccc4444', 'Sacada', 'sacada'),
('cccc5555-cccc-5555-cccc-5555cccc5555', 'Área de serviço', 'area-de-servico'),
('cccc6666-cccc-6666-cccc-6666cccc6666', 'Portaria 24h', 'portaria-24h')
ON CONFLICT (slug) DO NOTHING;

-- Properties
INSERT INTO properties (id, internal_code, title, slug, purpose, property_type_id, status, price, description, city_id, neighborhood_id, bedrooms, bathrooms, parking_spaces, total_area, featured)
VALUES
('dddd1111-dddd-1111-dddd-1111dddd1111', 'MIT-0001', 'Casa Comercial no Hauer', 'casa-comercial-no-hauer', 'sale', '11111111-1111-1111-1111-111111111111', 'published', 1000000.00, 'Excelente casa comercial', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb1111-bbbb-1111-bbbb-1111bbbb1111', 4, 3, 2, 300, true),
('dddd2222-dddd-2222-dddd-2222dddd2222', 'MIT-0002', 'Apartamento em Santa Felicidade', 'apartamento-em-santa-felicidade', 'sale', '22222222-2222-2222-2222-222222222222', 'published', 599000.00, 'Apartamento bem localizado', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb2222-bbbb-2222-bbbb-2222bbbb2222', 3, 2, 1, 90, true),
('dddd3333-dddd-3333-dddd-3333dddd3333', 'MIT-0003', 'Sobrado no Guaíra', 'sobrado-no-guaira', 'sale', '33333333-3333-3333-3333-333333333333', 'published', 499000.00, 'Sobrado amplo', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb3333-bbbb-3333-bbbb-3333bbbb3333', 3, 2, 2, 120, true),
('dddd4444-dddd-4444-dddd-4444dddd4444', 'MIT-0004', 'Apartamento no Bigorrilho', 'apartamento-no-bigorrilho', 'rent', '22222222-2222-2222-2222-222222222222', 'published', 4490.00, 'Excelente apartamento para alugar', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb4444-bbbb-4444-bbbb-4444bbbb4444', 2, 1, 1, 65, true),
('dddd5555-dddd-5555-dddd-5555dddd5555', 'MIT-0005', 'Casa em condomínio fechado Pilarzinho', 'casa-em-condominio-fechado-pilarzinho', 'sale', '66666666-6666-6666-6666-666666666666', 'published', 1795000.00, 'Casa alto padrão', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb5555-bbbb-5555-bbbb-5555bbbb5555', 4, 4, 3, 400, true),
('dddd6666-dddd-6666-dddd-6666dddd6666', 'MIT-0006', 'Terreno no Abranches', 'terreno-no-abranches', 'sale', '44444444-4444-4444-4444-444444444444', 'published', 730000.00, 'Excelente terreno para construção', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb6666-bbbb-6666-bbbb-6666bbbb6666', 0, 0, 0, 800, true),
('dddd7777-dddd-7777-dddd-7777dddd7777', 'MIT-0007', 'Apartamento vendido no Hauer', 'apartamento-vendido-no-hauer', 'sale', '22222222-2222-2222-2222-222222222222', 'sold', 420000.00, 'Imóvel vendido recentemente', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb1111-bbbb-1111-bbbb-1111bbbb1111', 2, 1, 1, 70, false),
('dddd8888-dddd-8888-dddd-8888dddd8888', 'MIT-0008', 'Casa alugada em Santa Felicidade', 'casa-alugada-em-santa-felicidade', 'rent', '11111111-1111-1111-1111-111111111111', 'rented', 3500.00, 'Imóvel alugado', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb2222-bbbb-2222-bbbb-2222bbbb2222', 3, 2, 2, 150, false),
('dddd9999-dddd-9999-dddd-9999dddd9999', 'MIT-0009', 'Rascunho de imóvel', 'rascunho-de-imovel', 'sale', '33333333-3333-3333-3333-333333333333', 'draft', 550000.00, 'Imóvel em rascunho para testes administrativos', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb3333-bbbb-3333-bbbb-3333bbbb3333', 3, 2, 1, 110, false)
ON CONFLICT (internal_code) DO NOTHING;

-- Sync internal code sequence after fixed seed codes (only if migration 00001 was applied)
DO $$
BEGIN
  IF to_regclass('public.property_internal_code_seq') IS NOT NULL THEN
    PERFORM setval(
      'property_internal_code_seq',
      GREATEST(
        (SELECT COALESCE(MAX(CAST(SUBSTRING(internal_code FROM 5) AS integer)), 0) FROM properties),
        1
      ),
      true
    );
  END IF;
END $$;

-- Property Features
INSERT INTO property_features (property_id, feature_id) VALUES
('dddd2222-dddd-2222-dddd-2222dddd2222', 'cccc1111-cccc-1111-cccc-1111cccc1111'),
('dddd2222-dddd-2222-dddd-2222dddd2222', 'cccc3333-cccc-3333-cccc-3333cccc3333'),
('dddd5555-dddd-5555-dddd-5555dddd5555', 'cccc1111-cccc-1111-cccc-1111cccc1111'),
('dddd5555-dddd-5555-dddd-5555dddd5555', 'cccc2222-cccc-2222-cccc-2222cccc2222'),
('dddd5555-dddd-5555-dddd-5555dddd5555', 'cccc6666-cccc-6666-cccc-6666cccc6666')
ON CONFLICT DO NOTHING;

-- Insert bucket if we could (must be done in console or through API usually, but SQL can be used if extension pg_net is available or direct insert to storage.buckets)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true) ON CONFLICT DO NOTHING;
