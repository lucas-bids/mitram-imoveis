<!-- Fonte: https://developers.grupozap.com/feeds/vrsync/examples.html | Sincronizado em: 2026-08-24 -->

# Exemplos completos de feed XML (VrSync)

4 exemplos completos da doc oficial, cobrindo venda, aluguel, venda+aluguel
e múltiplos imóveis num único arquivo. Servem de template — use como base
estrutural, não copie campos cegamente sem checar contra
`campos-do-anuncio.md` / `detalhes-precos-caracteristicas.md`.

> **Atenção — esta página de exemplos está desatualizada em relação às
> páginas de referência de campos da própria doc:**
> - Os exemplos usam `<YearlyTax currency="BRL">...</YearlyTax>` para IPTU.
>   A página de referência diz que `YearlyTax` está em desuso e o campo
>   correto é `<Iptu currency="BRL" period="Yearly">...</Iptu>`. **Use
>   `Iptu`.**
> - Os exemplos usam `<Garage type="Parking Space">2</Garage>`. A página de
>   referência não documenta atributo `type` em `Garage`. **Use `<Garage>2</Garage>`
>   sem atributo.**
> - Os exemplos incluem `<DetailViewUrl>...</DetailViewUrl>`, que não
>   consta na página de referência de campos do `Listing` (ver nota em
>   `campos-do-anuncio.md`).
>
> Os trechos abaixo estão **verbatim** da doc (por isso mantêm esses campos
> antigos) — as listas de `<Item medium="image">` foram encurtadas para
> legibilidade (mesmo padrão repetido).

## Exemplo 1 — Venda (`For Sale`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://www.vivareal.com/schemas/1.0/VRSync http://xml.vivareal.com/vrsync.xsd">
  <Header>
    <Provider>Desenvolvedor do Feed</Provider>
    <Email>desenvolvefeed@feed.com.br</Email>
    <ContactName>Nome do Cliente</ContactName>
    <PublishDate>2018-05-29T17:47:57</PublishDate>
    <Telephone>11-3450 4646</Telephone>
  </Header>
  <Listings>
    <Listing>
      <ListingID>Imovel-01</ListingID>
      <Title>Lindo Apartamento a venda em São Paulo</Title>
      <TransactionType>For Sale</TransactionType>
      <PublicationType>STANDARD</PublicationType>
      <DetailViewUrl>http://www.grupozap.com.br/imoveis/1005434</DetailViewUrl>
      <Media>
        <Item medium="video">https://www.youtube.com/watch?v=MukVADdjQD8</Item>
        <Item medium="image" caption="img1" primary="true">http://grupozap.com.br/foto01_152900.jpg</Item>
        <Item medium="image" caption="img02">http://grupozap.com.br/foto02_1529463900.jpg</Item>
        <Item medium="image" caption="img03">http://grupozap.com.br/foto03_1529463900.jpg</Item>
        <!-- ... mais 27 <Item medium="image"> no mesmo padrão (mínimo 5, aqui há 30) ... -->
      </Media>
      <Details>
        <UsageType>Residential</UsageType>
        <PropertyType>Residential / Apartment</PropertyType>
        <Description><![CDATA[O apartamento de 80 metros quadrados no bairro Consolação com 2 quartos e 1 banheiro. A alguns minutos de shoppings, supermercados, escolas, estádios, padarias, estacionamentos, museus, farmácias, hospitais, transporte coletivo, universidades e restaurantes.
O apartamento vai lhe possibilitar curtir os dias mais quentes na piscina. Além disso, sistema de segurança e quadra para prática de diferentes esportes para você e sua família. Elevador que garante o transporte das suas malas e compras. Academia para a prática de exercícios físicos. Encontra-se em um condomínio protegido por muros.]]></Description>
        <ListPrice currency="BRL">860000</ListPrice>
        <LotArea unit="square metres">90</LotArea>
        <LivingArea unit="square metres">80</LivingArea>
        <PropertyAdministrationFee currency="BRL">980</PropertyAdministrationFee>
        <YearlyTax currency="BRL">4500</YearlyTax> <!-- desatualizado: usar <Iptu currency="BRL" period="Yearly">4500</Iptu> -->
        <Bedrooms>2</Bedrooms>
        <Bathrooms>1</Bathrooms>
        <Floors>2</Floors>
        <Buildings>3</Buildings>
        <Suites>1</Suites>
        <Garage type="Parking Space">2</Garage> <!-- desatualizado: usar <Garage>2</Garage> -->
        <Features>
          <Feature>Close to main roads/avenues</Feature>
          <Feature>Close to shopping centers</Feature>
          <Feature>Pool</Feature>
          <Feature>Elevator</Feature>
          <Feature>Gym</Feature>
          <!-- ... demais Features do anúncio, ver lista fechada em detalhes-precos-caracteristicas.md ... -->
        </Features>
      </Details>
      <Location displayAddress="Street">
        <Country abbreviation="BR">Brasil</Country>
        <State abbreviation="SP">Sao Paulo</State>
        <City>São Paulo</City>
        <Zone>Zona Sul</Zone>
        <Neighborhood>Consolação</Neighborhood>
        <Address>Rua Bela Cintra</Address>
        <StreetNumber>539</StreetNumber>
        <Complement>APT 10</Complement>
        <PostalCode>01415-003</PostalCode>
        <Latitude>-23.5531131</Latitude>
        <Longitude>-46.659864</Longitude>
      </Location>
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
    </Listing>
  </Listings>
</ListingDataFeed>
```

## Exemplo 2 — Aluguel (`For Rent`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://www.vivareal.com/schemas/1.0/VRSync http://xml.vivareal.com/vrsync.xsd">
  <Header>
    <Provider>Desenvolvedor do Feed</Provider>
    <Email>desenvolvefeed@feed.com.br</Email>
    <ContactName>Nome do Cliente</ContactName>
    <PublishDate>2018-05-29T17:47:57</PublishDate>
    <Telephone>11-3450 4646</Telephone>
  </Header>
  <Listings>
    <Listing>
      <ListingID>Imovel-02</ListingID>
      <Title>Sala Comercial para aluguel possui 35 metros quadrados em Rio Pequeno - São Paulo - SP.</Title>
      <TransactionType>For Rent</TransactionType>
      <PublicationType>STANDARD</PublicationType>
      <DetailViewUrl>http://www.grupozap.com.br/imoveis/Imovel-02</DetailViewUrl>
      <Media>
        <Item medium="video">https://www.youtube.com/watch?v=MukVADdjQD8</Item>
        <Item medium="image" caption="img1" primary="true">http://grupozap.com.br/foto01_152900.jpg</Item>
        <Item medium="image" caption="img02">http://grupozap.com.br/foto02_1529463900.jpg</Item>
        <Item medium="image" caption="img03">http://grupozap.com.br/foto03_1529463900.jpg</Item>
        <!-- ... mais 21 <Item medium="image"> no mesmo padrão ... -->
      </Media>
      <Details>
        <UsageType>Commercial</UsageType>
        <PropertyType>Commercial / Office</PropertyType>
        <Description><![CDATA[A sala comercial de 35 metros quadrados no bairro Rio Pequeno e 1 banheiro. A alguns minutos de universidades, estacionamentos, shoppings, transporte coletivo, restaurantes, padarias, farmácias, escolas, hospitais.
Além disso, segurança garantida 24 horas por dia e alarme de segurança para você e sua empresa.
Elevador para mais praticidade no dia-a-dia.
Está em um condomínio protegido por grades.]]></Description>
        <RentalPrice currency="BRL" period="Monthly">2500</RentalPrice>
        <LotArea unit="square metres">35</LotArea>
        <LivingArea unit="square metres">35</LivingArea>
        <PropertyAdministrationFee currency="BRL">680</PropertyAdministrationFee>
        <YearlyTax currency="BRL">4500</YearlyTax> <!-- desatualizado: usar <Iptu> -->
        <Bathrooms>1</Bathrooms>
        <Floors>2</Floors>
        <Buildings>3</Buildings>
        <Garage type="Parking Space">2</Garage> <!-- desatualizado: usar <Garage>2</Garage> -->
        <Features>
          <Feature>Close to main roads/avenues</Feature>
          <Feature>Close to schools</Feature>
          <Feature>Close to hospitals</Feature>
          <Feature>Internet Connection</Feature>
          <Feature>Elevator</Feature>
        </Features>
        <Warranties>
          <Warranty>SECURITY_DEPOSIT</Warranty>
          <Warranty>GUARANTOR</Warranty>
          <Warranty>INSURANCE_GUARANTEE</Warranty>
          <Warranty>GUARANTEE_LETTER</Warranty>
          <Warranty>CAPITALIZATION_BONDS</Warranty>
        </Warranties>
      </Details>
      <Location displayAddress="Street">
        <Country abbreviation="BR">Brasil</Country>
        <State abbreviation="SP">Sao Paulo</State>
        <City>São Paulo</City>
        <Neighborhood>Rio Pequeno</Neighborhood>
        <Address>Rua João da Silva Sauro</Address>
        <StreetNumber>98</StreetNumber>
        <Complement>APT 9</Complement>
        <PostalCode>05863-024</PostalCode>
        <Latitude>-23.5531131</Latitude>
        <Longitude>-46.659864</Longitude>
      </Location>
      <ContactInfo>
        <Name>Imobiliaria Feliz</Name>
        <Email>contato@imobiliariafeliz.com.br</Email>
        <Website>http://www.imobiliariafeliz.com.br</Website>
        <Telephone>(11) 3150-4646</Telephone>
      </ContactInfo>
    </Listing>
  </Listings>
</ListingDataFeed>
```

## Exemplo 3 — Venda e Aluguel (`Sale/Rent`)

Mesma estrutura do exemplo 2, mudando apenas `TransactionType` para
`Sale/Rent` e incluindo tanto `RentalPrice` (obrigatório para
`For Rent`/`Sale/Rent`) quanto, quando aplicável, `ListPrice`. No exemplo
oficial da doc, o `Sale/Rent` só traz `RentalPrice` preenchido (sem
`ListPrice`) — o que é uma inconsistência do próprio exemplo, já que
`campos-do-anuncio.md`/`detalhes-precos-caracteristicas.md` diz que
`ListPrice` é obrigatório quando `TransactionType` é `Sale/Rent`. **Ao gerar
um feed real com `Sale/Rent`, inclua os dois preços.**

```xml
<Listing>
  <ListingID>Imovel-03</ListingID>
  <Title>Lindo Apartamento a venda em São Paulo</Title>
  <TransactionType>Sale/Rent</TransactionType>
  <PublicationType>STANDARD</PublicationType>
  <DetailViewUrl>http://www.grupozap.com.br/imoveis/Imovel-03</DetailViewUrl>
  <Media>
    <Item medium="video">https://www.youtube.com/watch?v=MukVADdjQD8</Item>
    <Item medium="image" caption="img1" primary="true">http://grupozap.com.br/foto01_152900.jpg</Item>
    <!-- ... mais imagens (25 no total no exemplo oficial) ... -->
  </Media>
  <Details>
    <UsageType>Residential</UsageType>
    <PropertyType>Residential / Apartment</PropertyType>
    <Description><![CDATA[O apartamento de 80 metros quadrados no bairro Consolação com 2 quartos e 1 banheiro...]]></Description>
    <RentalPrice currency="BRL" period="Monthly">2500</RentalPrice>
    <!-- ListPrice ausente no exemplo oficial — inclua-o em um feed real de Sale/Rent -->
    <LotArea unit="square metres">35</LotArea>
    <LivingArea unit="square metres">35</LivingArea>
    <PropertyAdministrationFee currency="BRL">680</PropertyAdministrationFee>
    <YearlyTax currency="BRL">4500</YearlyTax> <!-- desatualizado: usar <Iptu> -->
    <Bathrooms>1</Bathrooms>
    <Floors>2</Floors>
    <Buildings>3</Buildings>
    <Garage type="Parking Space">2</Garage> <!-- desatualizado: usar <Garage>2</Garage> -->
    <Features>
      <Feature>Close to main roads/avenues</Feature>
      <Feature>Controlled Access</Feature>
      <Feature>Elevator</Feature>
      <Feature>Internet Connection</Feature>
    </Features>
    <Warranties>
      <Warranty>INSURANCE_GUARANTEE</Warranty>
      <Warranty>GUARANTOR</Warranty>
    </Warranties>
  </Details>
  <Location displayAddress="Street">
    <Country abbreviation="BR">Brasil</Country>
    <State abbreviation="SP">Sao Paulo</State>
    <City>São Paulo</City>
    <Neighborhood>Rio Pequeno</Neighborhood>
    <Address>Rua João da Silva Sauro</Address>
    <StreetNumber>98</StreetNumber>
    <Complement>APT 19</Complement>
    <PostalCode>05863-024</PostalCode>
    <Latitude>-23.5531131</Latitude>
    <Longitude>-46.659864</Longitude>
  </Location>
  <ContactInfo>
    <Name>Imobiliaria Feliz</Name>
    <Email>contato@imobiliariafeliz.com.br</Email>
    <Website>http://www.imobiliariafeliz.com.br</Website>
    <Telephone>(11) 3150-4646</Telephone>
  </ContactInfo>
</Listing>
```

## Exemplo 4 — Múltiplos imóveis num único arquivo

Mostra a estrutura de `<Listings>` com vários `<Listing>` no mesmo feed
(venda, aluguel e venda+aluguel juntos) — é assim que um feed real com
catálogo completo se parece, em vez de um arquivo por imóvel:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://www.vivareal.com/schemas/1.0/VRSync http://xml.vivareal.com/vrsync.xsd">
  <Header>
    <Provider>Desenvolvedor do Feed</Provider>
    <Email>desenvolvefeed@feed.com.br</Email>
    <ContactName>Nome do Cliente</ContactName>
    <PublishDate>2018-05-29T17:47:57</PublishDate>
    <Telephone>11-3450 4646</Telephone>
  </Header>
  <Listings>
    <!-- Imóvel 1: apartamento à venda -->
    <Listing>
      <ListingID>AP001</ListingID>
      <Title>Lindo Apartamento a venda em São Paulo</Title>
      <TransactionType>For Sale</TransactionType>
      <PublicationType>STANDARD</PublicationType>
      <Media>
        <Item medium="image" caption="img1" primary="true">http://grupozap.com.br/foto01_152900.jpg</Item>
        <!-- ... 17 imagens no total no exemplo oficial ... -->
      </Media>
      <Details>
        <UsageType>Residential</UsageType>
        <PropertyType>Residential / Apartment</PropertyType>
        <Description><![CDATA[O apartamento de 80 metros quadrados no bairro Consolação com 2 quartos...]]></Description>
        <ListPrice currency="BRL">860000</ListPrice>
        <LivingArea unit="square metres">80</LivingArea>
        <Bedrooms>2</Bedrooms>
        <Bathrooms>1</Bathrooms>
        <Suites>1</Suites>
        <Garage type="Parking Space">2</Garage> <!-- desatualizado: usar <Garage>2</Garage> -->
        <Features>
          <Feature>Furnished</Feature>
          <Feature>Elevator</Feature>
          <Feature>Pool</Feature>
        </Features>
        <Warranties>
          <Warranty>INSURANCE_GUARANTEE</Warranty>
          <Warranty>GUARANTEE_LETTER</Warranty>
          <Warranty>CAPITALIZATION_BONDS</Warranty>
        </Warranties>
      </Details>
      <Location displayAddress="All">
        <Country abbreviation="BR">Brasil</Country>
        <State abbreviation="SP">Sao Paulo</State>
        <City>São Paulo</City>
        <Neighborhood>Consolação</Neighborhood>
        <Address>Rua Bela Cintra</Address>
        <StreetNumber>539</StreetNumber>
        <PostalCode>01415-003</PostalCode>
      </Location>
      <ContactInfo>
        <Name>Imobiliaria Feliz</Name>
        <Email>contato@imobiliariafeliz.com.br</Email>
      </ContactInfo>
    </Listing>
    <!-- Imóvel 2: sala comercial para aluguel -->
    <Listing>
      <ListingID>SL001</ListingID>
      <Title>Sala Comercial para aluguel possui 35 metros quadrados em Rio Pequeno - São Paulo - SP.</Title>
      <TransactionType>For Rent</TransactionType>
      <PublicationType>STANDARD</PublicationType>
      <Media>
        <Item medium="image" caption="img1" primary="true">http://grupozap.com.br/foto01_152900.jpg</Item>
        <!-- ... 25 imagens no total no exemplo oficial ... -->
      </Media>
      <Details>
        <UsageType>Commercial</UsageType>
        <PropertyType>Commercial / Office</PropertyType>
        <Description><![CDATA[A sala comercial de 35 metros quadrados no bairro Rio Pequeno...]]></Description>
        <RentalPrice currency="BRL" period="Monthly">2500</RentalPrice>
        <LivingArea unit="square metres">35</LivingArea>
        <Bathrooms>1</Bathrooms>
        <Garage type="Parking Space">2</Garage> <!-- desatualizado: usar <Garage>2</Garage> -->
        <Features>
          <Feature>Internet Connection</Feature>
          <Feature>Elevator</Feature>
        </Features>
        <Warranties>
          <Warranty>SECURITY_DEPOSIT</Warranty>
          <Warranty>GUARANTOR</Warranty>
          <Warranty>INSURANCE_GUARANTEE</Warranty>
        </Warranties>
      </Details>
      <Location displayAddress="Street">
        <Country abbreviation="BR">Brasil</Country>
        <State abbreviation="SP">Sao Paulo</State>
        <City>São Paulo</City>
        <Neighborhood>Rio Pequeno</Neighborhood>
        <Address>Rua João da Silva Sauro</Address>
        <StreetNumber>98</StreetNumber>
        <PostalCode>05863-024</PostalCode>
      </Location>
      <ContactInfo>
        <Name>Imobiliaria Feliz</Name>
        <Email>contato@imobiliariafeliz.com.br</Email>
      </ContactInfo>
    </Listing>
    <!-- Imóvel 3: apartamento venda e aluguel, destaque PREMIUM -->
    <Listing>
      <ListingID>AP002</ListingID>
      <Title>Apartamento para aluguel e venda tem 80 metros quadrados e 3 quartos em São Paulo - SP.</Title>
      <TransactionType>Sale/Rent</TransactionType>
      <PublicationType>PREMIUM</PublicationType>
      <Media>
        <Item medium="image" caption="img1" primary="true">http://grupozap.com.br/foto01_152900.jpg</Item>
        <!-- ... 18 imagens no total no exemplo oficial ... -->
      </Media>
      <Details>
        <UsageType>Residential</UsageType>
        <PropertyType>Residential / Apartment</PropertyType>
        <Description><![CDATA[O apartamento de 80 metros quadrados no bairro Rio Pequeno com 3 quartos sendo 2 suítes e 3 banheiros...]]></Description>
        <ListPrice currency="BRL">780000</ListPrice>
        <RentalPrice currency="BRL" period="Monthly">2750</RentalPrice>
        <LivingArea unit="square metres">80</LivingArea>
        <LotArea unit="square metres">95</LotArea>
        <Bedrooms>3</Bedrooms>
        <Bathrooms>3</Bathrooms>
        <Suites>2</Suites>
        <Garage type="Parking Space">2</Garage> <!-- desatualizado: usar <Garage>2</Garage> -->
        <Features>
          <Feature>Furnished</Feature>
          <Feature>Elevator</Feature>
          <Feature>BBQ</Feature>
          <Feature>Playground</Feature>
          <Feature>Pool</Feature>
        </Features>
        <Warranties>
          <Warranty>SECURITY_DEPOSIT</Warranty>
          <Warranty>GUARANTOR</Warranty>
          <Warranty>INSURANCE_GUARANTEE</Warranty>
          <Warranty>GUARANTEE_LETTER</Warranty>
          <Warranty>CAPITALIZATION_BONDS</Warranty>
        </Warranties>
      </Details>
      <Location displayAddress="Neighborhood">
        <Country abbreviation="BR">Brasil</Country>
        <State abbreviation="SP">Sao Paulo</State>
        <City>São Paulo</City>
        <Neighborhood>Rio Pequeno</Neighborhood>
        <Address>Avenida Escola Politécnica</Address>
        <StreetNumber>980</StreetNumber>
        <PostalCode>05350-090</PostalCode>
      </Location>
      <ContactInfo>
        <Name>Imobiliaria Feliz</Name>
        <Email>contato@imobiliariafeliz.com.br</Email>
      </ContactInfo>
    </Listing>
  </Listings>
</ListingDataFeed>
```
