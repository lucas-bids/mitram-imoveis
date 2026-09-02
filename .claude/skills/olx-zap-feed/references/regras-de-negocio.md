<!-- Fonte: https://developers.grupozap.com/feeds/integration_rules.html | Sincronizado em: 2026-08-24 -->

# Regras de negócio da integração

Regras operacionais/comerciais sobre como o GrupoZap trata anúncios vindos
de XML em relação a anúncios criados manualmente no Canal Pro. Não são
regras de formato do arquivo (isso está em `campos-do-anuncio.md` e
`detalhes-precos-caracteristicas.md`) — são regras de **processo**.

## Anúncio via XML é somente leitura no Canal Pro

> "O anúncio criado via XML não poderá ser editado manualmente."

Um anúncio que entrou pelo feed só pode ser alterado reenviando o XML com o
mesmo `ListingID` atualizado. Editar direto no Canal Pro não é suportado
para esses anúncios.

## Duplicidade entre XML e cadastro manual

Se o mesmo imóvel existir tanto no XML quanto cadastrado manualmente no
Canal Pro:

> "O anúncio que está no XML vai apresentar erro de duplicidade."

O anúncio do XML fica bloqueado com erro até que a versão manual
duplicada seja excluída. Ou seja: em caso de conflito, o manual "vence" e o
XML é rejeitado — não o contrário.

## Desativação por cota excedida

Anúncios são desativados automaticamente quando a quantidade contratada
pelo anunciante é excedida — **independente de terem sido criados via XML
ou manualmente**. Isso normalmente aparece no relatório de importação (ver
`relatorios-e-validacao.md`) como um bloqueio por "plano excedido".

## Limite de volume por arquivo

- O feed suporta **até 50 mil anúncios em um único arquivo XML**.
- Não há, na doc consultada, menção a como o sistema se comporta acima
  desse limite (rejeição total do arquivo vs. truncamento) — se isso for
  crítico, confirmar com o suporte (`chamado.integracao@olxbr.com`, ver
  `relatorios-e-validacao.md`) antes de depender do comportamento.
