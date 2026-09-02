<!-- Fontes: https://developers.grupozap.com/feeds/report_integration_feeds.html , https://developers.grupozap.com/feeds/report_integration_email.html , https://developers.grupozap.com/feeds/report_integration_webhook.html , https://developers.grupozap.com/feeds/report_integration_error_template.html , https://developers.grupozap.com/feeds/xml_validator/ | Sincronizado em: 2026-08-24 -->

# Relatórios de importação e validação

Como saber se o feed foi processado com sucesso e o que fazer quando não
foi. **Importante: a doc do GrupoZap não expõe uma tabela de códigos de
erro numéricos** (tipo `ERR_001`) — o feedback é dado em categorias de
texto e em uma nota de qualidade. Não invente códigos de erro que não
existem nesta doc.

## Três canais de relatório

1. **Email** (diário, para todo anunciante com integração ativa)
2. **Webhook** (endpoint HTTP configurado pelo cliente)
3. **Canal Pro** (dashboard, sob demanda)

### Relatório por email

Enviado diariamente, contém:

- Identificador da carga ("Identificador do ZAP+"), data do último
  reprocessamento e data da próxima execução agendada.
- **Nota de qualidade** (0 a 10), categorizada:
  | Faixa | Categoria |
  |---|---|
  | < 5.0 | Péssimo |
  | 5.0 – 5.9 | Ruim |
  | 6.0 – 7.9 | Regular |
  | 8.0 – 8.9 | Bom |
  | 9.0 – 10.0 | Ótimo |
- Contagem de: anúncios ativos integrados com sucesso, anúncios bloqueados
  por erro, anúncios com aviso (integrados mas com problema de qualidade).
- Alertas de bloqueio: fatura em aberto (bloqueia toda a integração) ou
  quantidade de anúncios acima do plano contratado (bloqueia os excedentes).

### Relatório via webhook

- Requer uma **URL (endpoint) configurada** do lado do cliente/CRM para
  receber as notificações.
- Contém as mesmas métricas do email: uso do plano, completude de grade,
  quantidade de anúncios contratados/enviados/bloqueados por erro.
- A doc-fonte não detalha o schema/payload JSON exato nem autenticação do
  webhook — se isso for necessário para implementar um recebedor, será
  preciso consultar o suporte ou uma página não coberta aqui
  (`/feeds/report_integration_webhook.html` linkava para "Relatório de
  importação via Webhook" com specs adicionais não capturadas nesta
  sincronização).

### Relatório de erro de carga ("Error Load Report")

Disparado como email adicional quando **falhas persistem por mais de 3
dias**. Estrutura do email:

1. **Formato inválido** (se aplicável) — alerta de uso de formato
   descontinuado, pedindo atualização.
2. **Erro de execução** — motivo pelo qual a carga não foi processada
   (texto livre, não código).
3. **Validação XML** — direciona para o validador (ver abaixo) e dá
   instruções de validação manual.
4. **Acesso ao relatório** — botão para acompanhar status/próximas
   execuções.

Contato de suporte para integração: `chamado.integracao@olxbr.com`.

## Validador de XML

- Ferramenta online: upload do arquivo, avalia conformidade com o padrão
  VRSync.
- **Limite: 30MB por arquivo.**
- Só valida o formato **VRSync** (o formato legado não é suportado pelo
  validador).
- Status: **beta** na doc consultada.
- Alternativa: validação local no VSCode, garantindo que o cabeçalho XML
  esteja correto (ver `estrutura-e-header-xml.md` e `encoding-e-url.md`).

## Volume de dados e limite de arquivo

Ver `regras-de-negocio.md` para o limite de 50 mil anúncios por arquivo —
esse limite também é relevante para leitura de relatórios grandes.
