<!-- Fonte: https://developers.grupozap.com/feeds/vrsync/elements/listing.html | Sincronizado em: 2026-08-24 -->

# Campos do elemento `Listing`

Cada imóvel é um elemento `<Listing>` dentro de `<Listings>` (ver
`estrutura-e-header-xml.md`). Este arquivo cobre a identificação,
localização, mídia e contato do anúncio. Preço, descrição, tipo/uso,
áreas, cômodos e características ficam em `detalhes-precos-caracteristicas.md`
(sub-elemento `<Details>`).

## ListingID

- **Obrigatório.** String, **1 a 50 caracteres**.
- Deve ser **único** no arquivo — se houver duplicata, só um é processado
  (o outro é descartado silenciosamente, não gera dois anúncios).
- É o identificador usado nos relatórios do Canal Pro e nos portais OLX.

## Title

- **Obrigatório.** String, **10 a 100 caracteres**.
- Não pode conter tags HTML.
- Recomendado envolver em `CDATA` para lidar com acentuação/caracteres
  especiais sem quebrar o XML.

## TransactionType

- **Obrigatório.** Enum:
  - `For Sale` (venda)
  - `For Rent` (aluguel)
  - `Sale/Rent` (venda e aluguel)
- Para aluguel por temporada ou período não padrão (diário, semanal), usar
  `For Rent` e especificar o período no `RentalPrice` (ver
  `detalhes-precos-caracteristicas.md`).

## Location

Elemento complexo, **obrigatório**. Atributo `displayAddress` (obrigatório)
controla o que é exibido publicamente no anúncio:

- `All` — endereço completo com número
- `Street` — endereço sem número
- `Neighborhood` — só o bairro

Sub-elementos:

| Campo | Obrigatório? | Notas |
|---|---|---|
| `Country` | Sim | Atributo `abbreviation="BR"` |
| `State` | Sim | Atributo `abbreviation` obrigatório (ex: `SP`) |
| `City` | Sim | |
| `Neighborhood` | Sim | |
| `PostalCode` | Sim | **obrigatório em todos os anúncios**, sem exceção |
| `Zone` | Não | Para desambiguar regiões, ex: "Zona Sul" |
| `Address` | Não | Nome da rua |
| `StreetNumber` | Não | |
| `Complement` | Não | Complemento (apto/bloco) — não aparece nos portais publicamente |
| `Latitude` | Não | Formato decimal, ex: `-23.5531131` |
| `Longitude` | Não | Formato decimal, ex: `-46.659864` |

Casos especiais:

- **Distrito Federal**: nomes de regiões administrativas entre parênteses
  nos registros de CEP são reconhecidos como cidades-satélite.
- **Cidades com CEP único**: quando a cidade tem um único CEP para toda a
  área, o campo `State` passa a ser obrigatório (além de já ser sempre
  obrigatório).
- Usar `CDATA` para nomes com acentuação, para evitar erro de encoding.
- `Complement` é recomendado para apartamento, flat, cobertura, kitnet,
  loft e condomínio (ex: "apt 22, bl A").

## Media

Elemento complexo, **obrigatório**, contém `Item` filhos:

- `Item` tem atributo `medium` (obrigatório): `"image"` ou `"video"`.
- `primary="true"` (opcional): marca a foto principal/destaque —
  **no máximo uma** por anúncio.
- `caption` (opcional): texto descritivo da foto.

Regras:

- **Mínimo de 5 imagens** por anúncio.
- Tamanho máximo por imagem: **7MB**.
- Formato: **apenas JPG**.
- Vídeo: apenas link do **YouTube**, **um por imóvel**.
- Se o conteúdo de uma imagem for atualizado, a **URL precisa mudar**
  (o sistema não reprocessa a mesma URL como atualizada).
- Todas as imagens são importadas para os servidores da OLX para otimização.

Exemplo:

```xml
<Media>
  <Item medium="video">https://www.youtube.com/watch?v=example</Item>
  <Item medium="image" caption="img1" primary="true">http://example.com/foto01.jpg</Item>
  <Item medium="image" caption="img2">http://example.com/foto02.jpg</Item>
  <Item medium="image" caption="img3">http://example.com/foto03.jpg</Item>
  <Item medium="image" caption="img4">http://example.com/foto04.jpg</Item>
  <Item medium="image" caption="img5">http://example.com/foto05.jpg</Item>
</Media>
```

## ContactInfo

Elemento complexo, **obrigatório**.

Obrigatórios: `Name` (nome da imobiliária), `Email`.

Opcionais: `Website`, `Logo` (URL da logo), `OfficeName` (nome da filial),
`Telephone`, `Location` (endereço do escritório — mesma estrutura do
`Location` do imóvel, acima).

## PublicationType

- Opcional. Enum de destaque do anúncio nos portais:
  - `STANDARD`
  - `PREMIUM`
  - `SUPER_PREMIUM`
  - `PREMIERE_1` (Zap+ apenas)
  - `PREMIERE_2` (Zap+ apenas)
  - `TRIPLE` (Zap+ apenas)

## VirtualTourLink

- Opcional. String (URL).
- Precisa ser **HTTPS com certificado válido**.
- Não pode ser um encurtador de URL.
- A página apontada deve conter **apenas** conteúdo do tour virtual (nada
  mais na página).

## Campo visto nos exemplos mas não documentado: `DetailViewUrl`

Todos os exemplos em `exemplos-xml.md` incluem um elemento
`<DetailViewUrl>` (URL da página do imóvel no site da imobiliária/origem),
logo após `PublicationType`. **A página de referência de campos do
`Listing` não documenta esse elemento** — nem como obrigatório, nem como
opcional. Tratar como não-oficial: não depender dele para nada obrigatório,
mas é seguro incluí-lo (parece ser só um link de referência de volta à
fonte) se o sistema de origem já tiver essa URL disponível.

## Exemplo completo de `Listing` (estrutura, sem `Details`)

```xml
<Listing>
  <ListingID>29080</ListingID>
  <Title><![CDATA[Lindo Apartamento à venda em São Paulo]]></Title>
  <TransactionType>For Sale</TransactionType>
  <Location displayAddress="All">
    <Country abbreviation="BR">Brasil</Country>
    <State abbreviation="SP">Sao Paulo</State>
    <City>São Paulo</City>
    <Zone>Zona Sul</Zone>
    <Neighborhood>Consolação</Neighborhood>
    <Address>Rua Bela Cintra</Address>
    <StreetNumber>539</StreetNumber>
    <Complement>APT 12</Complement>
    <PostalCode>01415-003</PostalCode>
    <Latitude>-23.5531131</Latitude>
    <Longitude>-46.659864</Longitude>
  </Location>
  <Media>
    <Item medium="video">https://www.youtube.com/watch?v=example</Item>
    <Item medium="image" caption="img1" primary="true">http://example.com/foto01.jpg</Item>
    <Item medium="image" caption="img2">http://example.com/foto02.jpg</Item>
    <Item medium="image" caption="img3">http://example.com/foto03.jpg</Item>
    <Item medium="image" caption="img4">http://example.com/foto04.jpg</Item>
    <Item medium="image" caption="img5">http://example.com/foto05.jpg</Item>
  </Media>
  <ContactInfo>
    <Name>Imobiliaria Feliz</Name>
    <Email>contato@imobiliariafeliz.com.br</Email>
    <Website>http://www.imobiliariafeliz.com.br</Website>
    <Logo>http://www.imobiliariafeliz.com.br/logo.jpg</Logo>
    <OfficeName>Imobiliária Feliz - Agencia Principal</OfficeName>
    <Telephone>(11) 3150-4646</Telephone>
    <Location>
      <Country abbreviation="BR">Brasil</Country>
      <State abbreviation="SP">Sao Paulo</State>
      <City>São Paulo</City>
      <Neighborhood>Alto da Mooca</Neighborhood>
      <Address>Rua Joá, 1890</Address>
      <PostalCode>03178-200</PostalCode>
    </Location>
  </ContactInfo>
  <PublicationType>STANDARD</PublicationType>
  <VirtualTourLink>https://www.grupozap.com/virtualtourlinkexample</VirtualTourLink>
  <Details>...</Details> <!-- ver detalhes-precos-caracteristicas.md -->
</Listing>
```
