---
name: olx-zap-feed
description: Use ao gerar, revisar ou validar o feed XML de imóveis para OLX/ZAP/VivaReal (GrupoZap, formato VrSync) — estrutura do XML, campos obrigatórios por tipo de imóvel, regras de conexão/envio e como interpretar relatórios de erro do feed.
---

# Integração de feed OLX/GrupoZap

Integração em lote (não é uma API síncrona): a imobiliária hospeda um
arquivo XML no formato **VrSync** numa URL própria, e o GrupoZap baixa e
processa esse arquivo **a cada 12 horas (2x/dia)**. As alterações aparecem
no ZAP, VivaReal ou OLX dependendo do plano contratado. Resultado do
processamento é reportado por email, webhook ou no Canal Pro. O formato ZAP
antigo (não-VrSync) está descontinuado desde out/2024 e não é coberto por
esta skill — só VrSync.

Fonte: https://developers.grupozap.com/feeds/ (sincronizado em 2026-08-24).

## Referências (`references/`)

Carregue só o(s) arquivo(s) relevante(s) para a tarefa, não todos de uma vez:

- **`conexao-e-hospedagem.md`** — como hospedar o XML: frequência de
  polling, timeouts, TLS/certificado, IPs para whitelist, User-Agent
  obrigatório, limites de URL/redirect.
- **`encoding-e-url.md`** — percent-encoding da URL do feed e charset
  aceito no arquivo XML (`ISO8859-1`/`UTF-8`) + declaração obrigatória.
- **`regras-de-negocio.md`** — anúncio via XML é read-only no Canal Pro,
  duplicidade XML vs. manual, bloqueio por cota excedida, limite de 50 mil
  anúncios por arquivo.
- **`estrutura-e-header-xml.md`** — elemento raiz `ListingDataFeed`
  (namespace/schema) e elemento `Header` (dados de contato de quem gera o
  feed).
- **`campos-do-anuncio.md`** — elemento `Listing`: ListingID, Title,
  TransactionType, Location, Media (regras de fotos/vídeo), ContactInfo,
  PublicationType, VirtualTourLink.
- **`detalhes-precos-caracteristicas.md`** — elemento `Details`: preços
  (ListPrice/RentalPrice/Iptu/PropertyAdministrationFee), Description,
  PropertyType (lista fechada), UsageType, áreas, cômodos, dados de prédio,
  Features (lista fechada) e Warranties.
- **`exemplos-xml.md`** — 4 exemplos completos de feed (venda, aluguel,
  venda+aluguel, múltiplos imóveis), com notas sobre onde os exemplos da
  doc oficial estão desatualizados em relação às páginas de referência de
  campos.
- **`relatorios-e-validacao.md`** — como o resultado do processamento é
  reportado (email com nota de qualidade 0-10, webhook, relatório de erro
  após 3 dias) e o validador XML oficial. Não existem códigos de erro
  numéricos documentados — só categorias.

## Script de validação

`scripts/validar-feed.ts` valida um arquivo XML de feed contra as regras
mecânicas documentadas (campos obrigatórios, tamanhos de string,
enumerações, formato de preço/data). Rodar com:

```bash
npx tsx .claude/skills/olx-zap-feed/scripts/validar-feed.ts caminho/para/feed.xml
```
