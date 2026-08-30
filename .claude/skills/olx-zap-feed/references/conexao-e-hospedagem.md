<!-- Fonte: https://developers.grupozap.com/feeds/connection_guideline.html | Sincronizado em: 2026-08-24 -->

# Conexão e hospedagem do arquivo XML

O GrupoZap **puxa** (polling) o arquivo XML de uma URL que você hospeda —
não há push do seu lado. As regras abaixo são sobre como essa URL precisa se
comportar para o processamento não falhar.

## Frequência de processamento

- O arquivo é baixado e processado **a cada 12 horas (2x ao dia)**.
- O horário exato pode variar — não é um cron fixo e não é configurável pelo
  cliente.

## Requisitos de conexão

- **User-Agent obrigatório**: o servidor que hospeda o XML precisa permitir
  requisições do user-agent `VivaRealBot/1.0 (+http://www.vivareal.com/bot.html)`.
  Se o firewall/WAF bloquear esse UA, o download falha.
- **Timeout de conexão**: 60 segundos para estabelecer a conexão.
- **Timeout de download**: 20 minutos para baixar o arquivo inteiro.
- Esses timeouts não são negociáveis/configuráveis — se o servidor for lento
  demais para responder dentro deles, o processamento falha.

## TLS / certificado (se servido via HTTPS)

- TLS v1, v1.1 e v1.2 são suportados.
- **Certificados autoassinados são rejeitados.** É obrigatório certificado
  válido emitido por uma CA reconhecida.

## Firewall / whitelist de IP

Se o servidor que hospeda o XML tiver firewall restringindo IPs de origem, é
necessário liberar os IPs de saída do GrupoZap (a doc lista 11 IPs, 4 deles
marcados como "novos" na versão consultada):

```
54.162.151.93
35.170.24.75
35.169.28.85
52.6.165.235
... (mais 7 IPs — conferir a lista atual na doc antes de configurar um
     firewall, pois esses IPs podem mudar)
```

> Antes de usar essa lista em produção, resincronize esta página — é o tipo
> de dado (IPs de infraestrutura de terceiro) que muda sem aviso e não deve
> ser hardcoded a partir de uma cópia antiga.

## URL do feed

- Máximo de **255 caracteres** na URL.
- Redirecionamentos HTTP → HTTPS no mesmo domínio são suportados.
- Máximo de **100 redirecionamentos** no mesmo protocolo são seguidos antes
  de desistir.

Para as regras de encoding de caracteres especiais dentro dessa URL, ver
`references/encoding-e-url.md`.
