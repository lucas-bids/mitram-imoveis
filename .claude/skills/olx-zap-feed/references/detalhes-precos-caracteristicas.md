<!-- Fonte: https://developers.grupozap.com/feeds/vrsync/elements/details.html | Sincronizado em: 2026-08-24 -->

# Elemento `Details` — preço, descrição, tipo, área, cômodos e características

Sub-elemento de cada `<Listing>` (ver `campos-do-anuncio.md` para o resto do
anúncio). Todos os campos de preço/área abaixo usam **apenas valores
inteiros** — sem casas decimais, símbolo de moeda ou separador de milhar.

## Preços

| Elemento | Obrigatório? | Atributos | Formato/Notas |
|---|---|---|---|
| `ListPrice` | **Sim, se** `TransactionType` = `For Sale` ou `Sale/Rent` | `currency="BRL"` | Inteiro. Ex: `<ListPrice currency="BRL">560000</ListPrice>` |
| `RentalPrice` | **Sim, se** `TransactionType` = `For Rent` ou `Sale/Rent` | `currency="BRL"`, `period` (`Monthly`\|`Daily`\|`Weekly`\|`Quarterly`\|`Yearly`, default `Monthly`) | Inteiro. Apenas **um** `RentalPrice` por imóvel. Ex: `<RentalPrice currency="BRL" period="Monthly">2800</RentalPrice>` |
| `Iptu` | Não | `currency="BRL"`, `period` (`Yearly`\|`Monthly`, default `Yearly`) | Inteiro. Ex: `<Iptu currency="BRL" period="Yearly">5000</Iptu>`. Existe um campo antigo `YearlyTax` que a própria doc diz estar em desuso ("o antigo campo `yearlyTax` entrará em desuso") — **usar `Iptu`**, não `YearlyTax`, apesar de `exemplos-xml.md` (página de exemplos da doc, aparentemente desatualizada) ainda usar o campo antigo. |
| `PropertyAdministrationFee` | Não | `currency="BRL"` | Inteiro. Condomínio. `0` = isento. Ex: `<PropertyAdministrationFee currency="BRL">2800</PropertyAdministrationFee>` |

## Description

- **Obrigatório.** **50 a 3.000 caracteres.**
- Sem tags HTML cruas — usar `CDATA`.
- Formatação suportada via entidade HTML: quebra de linha (`&lt;br&gt;`),
  negrito (`&lt;b&gt;`), itálico (`&lt;i&gt;`), marcadores (`&bull;`).

## PropertyType

- **Obrigatório.** Enum no formato `Categoria / Subtipo`. Lista completa
  capturada da doc:

  **Residential:** Apartment, Home, Condo, Village House, Farm Ranch,
  Penthouse, Flat, Kitnet, Studio, Loft, Land Lot, Agricultural, Sobrado

  **Commercial:** Consultorio, Edificio Residencial, Industrial, Building,
  Garage, Hotel, Loja, Land Lot, Business, Office, Edificio Comercial,
  Corporate Floor

  Ex: `Residential / Apartment`, `Commercial / Office`.

## UsageType

- Opcional. Enum: `Residential` | `Commercial` | `Residential / Commercial`.

## Áreas

| Elemento | Obrigatório? | Atributo | Notas |
|---|---|---|---|
| `LivingArea` | Ao menos uma área é obrigatória | `unit="square metres"` | Área útil. Usada por todos os tipos, exceto terrenos/fazendas/industrial |
| `LotArea` | Para terreno, fazenda, galpão, industrial | `unit="square metres"` | Área total do lote |

Formato: inteiro.

## Cômodos

| Elemento | Obrigatório? | Notas |
|---|---|---|
| `Bedrooms` | Sim para a maioria dos tipos residenciais; obrigatório p/ Studio (mín. 1) | Inteiro. Kitnet: default `0` |
| `Bathrooms` | Sim para apartamento, casa, condomínio, cobertura, loft, studio; não para terreno/industrial | Inteiro |
| `Suites` | Não | Inteiro |

## Dados do prédio

| Elemento | Obrigatório? | Notas |
|---|---|---|
| `Garage` | Não | Vagas de garagem, inteiro. A página de referência do elemento não documenta nenhum atributo em `Garage` (é só o inteiro) — apesar de `exemplos-xml.md` mostrar `<Garage type="Parking Space">2</Garage>`. Seguir a página de referência: **sem atributo `type`**. |
| `Floors` | Não | Total de andares da torre, inteiro |
| `UnitFloor` | Não | Andar da unidade, inteiro |
| `Buildings` | Não | Número de torres, inteiro |
| `YearBuilt` | Não | Ano com 4 dígitos |

## Features (características)

- Elemento `<Features>` (pai) → `<Feature>` (filhos, um por característica).
- Opcional. Lista fechada de valores — **não inventar valores fora desta
  lista**, o portal só reconhece os itens abaixo (capturados da doc em
  2026-08-24):

```
Close to main roads/avenues, Close to shopping centers, Close to public
transportation, Close to schools, Close to hospitals, Utilities, Gravel,
Administration, Alarm System, Armored Security Cabin, Backyard, Balcony,
Band Practice Room, Bathtub, Bar, Barbecue Balcony, BBQ, Beauty Room,
Bicycles Place, Builtin Wardrobe, Caretaker, Caretaker House, Cable
Television, Closet, Controlled Access, Cooling, Copa, Digital Locker,
Dinner Room, Eco Condominium, Eco Garbage Collector, Edicule, Electric
Charger, Elevator, Exterior View, Fenced Yard, Fireplace, Fitness Room,
Fully Wired, Furnished, Game room, Garden Area, Geminada, Generator,
Gourmet Area, Gourmet Balcony, Gourmet Kitchen, Green space / Park, Gym,
Heating, Home Office, Indoor Soccer, Integrated Environments, Intercom,
Internet Connection, Jogging track, Kitchen, Kitchen Cabinets, Lake View,
Land, Large Kitchen, Large Window, Laundry, Lawn, Lunch Room, Maid's
Quarters, Massage Room, Media Room, Meeting Room, Mezzanine, Mountain
View, Number of stories, Ocean View, Parking Garage, Party Room, Patrol,
Paved Street, Pay-per-use Services, Pets Allowed, Pet Space, Playground,
Pool, Reception room, Recreation Area, Reflective Pool, Sand Pit, Sauna,
Security Guard on Duty, Semi Olympic Pool, Smart Apartment, Smart
Condominium, Solar Energy, Spa, Sports Court, Square, Squash, Stair,
Stores, Tennis court, TV Security, Valet Parking, Warehouse, Water Tank,
American Kitchen, Full Floor, Aquarium, Bedroom Wardrobe, Bathroom
Cabinets, Service Bathroom, Blindex Box, Carpet, Background House,
Headquarters, Gas Shower, Burn Cement, Employee Dependency, Pantry,
Drywall, Cooker, Pizza Oven, Freezer, Sanca, Whirlpool, Corner Property,
Soundproofing, Thermal Insulation, Aluminium Window, Slab, Lavabo, Half
Floor, Planned Furniture, Glass Wall, Walls Grids, Hot Tub, High Ceiling
Height, Private Pool, Wood Floor, Raised Floor, Cold Floor, Laminated
Floor, Vinyl Floor, Platibanda, Porcelain, Dividers, Service Room,
Reversible Room, Large Room, Small Room, Wall Balcony, Natural
Ventilation, Panoramic View, Disabled Access, Coworking, Electronic Gate,
Fruit Trees, Tree Climbing, Library, Toys Place, Security Camera, Dog
Kennel, Barn, Beauty Center, Fence, Children Care, Coverage, Corral, Deck,
Service Entrance, Side Entrance, Entrance Hall, Vegetable Garden, Lake,
Marina, Climbing Wall, Orchid Place, Redario, Restaurant, River,
Convention Hall, Solarium, Pasture, Heated Pool, Covered Pool, Skate Lane,
Well, Artesian Well, Pomar, Zen Space, Football Field, Golf Field,
Helipad, Pool Bar, Coffee Shop, Dress Room2, Guest Parking, Adult Pool,
Childrens Pool, Concierge 24h, Near Shopping Center, Teen Space
```

> `Dress Room2` está grafado assim na doc-fonte (provável erro de digitação
> deles, tipo "Dress Room" duplicado). Mantido verbatim — não corrigir sem
> confirmar contra a doc atual.

## Warranties (garantias — apenas aluguel)

- Elemento `<Warranties>` (pai) → `<Warranty>` (filhos).
- Opcional, só faz sentido para anúncios de aluguel.
- Valores válidos: `SECURITY_DEPOSIT`, `GUARANTOR`, `INSURANCE_GUARANTEE`,
  `GUARANTEE_LETTER`, `CAPITALIZATION_BONDS`.

## Onde `Details` fica no XML

```xml
<Listing>
  ...  <!-- ver campos-do-anuncio.md -->
  <Details>
    <ListPrice currency="BRL">560000</ListPrice>
    <Iptu currency="BRL" period="Yearly">5000</Iptu>
    <PropertyAdministrationFee currency="BRL">2800</PropertyAdministrationFee>
    <Description><![CDATA[Ótimo apartamento...]]></Description>
    <PropertyType>Residential / Apartment</PropertyType>
    <UsageType>Residential</UsageType>
    <LivingArea unit="square metres">120</LivingArea>
    <Bedrooms>3</Bedrooms>
    <Bathrooms>2</Bathrooms>
    <Suites>1</Suites>
    <Garage>2</Garage>
    <Floors>13</Floors>
    <UnitFloor>3</UnitFloor>
    <YearBuilt>2016</YearBuilt>
    <Features>
      <Feature>Pool</Feature>
      <Feature>Elevator</Feature>
    </Features>
  </Details>
</Listing>
```
