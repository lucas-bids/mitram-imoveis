<!-- Fonte: https://developers.grupozap.com/feeds/vrsync/elements/header.html | Sincronizado em: 2026-08-24 -->

# Estrutura raiz do XML e elemento `Header`

Formato: **VrSync** (único formato aceito atualmente — o formato ZAP antigo
foi descontinuado em out/2024 e não é documentado aqui).

## Elemento raiz `ListingDataFeed`

Todo feed é um único documento XML com um elemento raiz `ListingDataFeed`,
com namespace e schema location fixos:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://www.vivareal.com/schemas/1.0/VRSync http://xml.vivareal.com/vrsync.xsd">
  <Header>...</Header>
  <Listings>
    <Listing>...</Listing>
    <Listing>...</Listing>
  </Listings>
</ListingDataFeed>
```

- A declaração `<?xml ... encoding="..."?>` na linha 1 segue as regras de
  `encoding-e-url.md` (só `ISO8859-1` ou `UTF-8`).
- `Listings` é o contêiner de todos os `Listing` — ver
  `campos-do-anuncio.md` para o conteúdo de cada `Listing` e
  `detalhes-precos-caracteristicas.md` para o sub-elemento `Details` de
  cada `Listing`.

## Elemento `Header`

Contém os dados de contato de quem **desenvolveu/gera** o arquivo XML (não
é o contato do anúncio — isso é `ContactInfo`, dentro de cada `Listing`).
Todos os 5 campos abaixo são **obrigatórios**:

| Campo | Tipo | Formato/Notas |
|---|---|---|
| `Provider` | string | Nome do desenvolvedor do feed ou da empresa/sistema que gera o XML |
| `Email` | string | E-mail de contato |
| `ContactName` | string | Nome da pessoa de contato |
| `PublishDate` | datetime (ISO 8601) | `YYYY-MM-DDTHH:MM:SS`, ex: `2018-05-29T17:47:57` |
| `Telephone` | string | Telefone de contato |

Exemplo:

```xml
<Header>
  <Provider>Desenvolvedor do Feed</Provider>
  <Email>desenvolvefeed@feed.com.br</Email>
  <ContactName>Nome do Cliente</ContactName>
  <PublishDate>2018-05-29T17:47:57</PublishDate>
  <Telephone>11-3450 4646</Telephone>
</Header>
```
