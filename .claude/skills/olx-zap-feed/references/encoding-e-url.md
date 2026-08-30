<!-- Fontes: https://developers.grupozap.com/feeds/url_encoding.html , https://developers.grupozap.com/feeds/encoding.html | Sincronizado em: 2026-08-24 -->

# Encoding: URL do feed e charset do XML

Dois assuntos distintos que a doc trata em páginas separadas mas que são a
mesma categoria de problema ("encoding correto ou o processamento falha").

## Encoding da URL do feed

- A URL precisa ser **ASCII válido**, seguindo RFC 3986.
- Caracteres ASCII "inseguros" devem ser percent-encoded (`%` + 2 dígitos
  hexadecimais).
- Espaço não pode aparecer literal na URL — usar `+` ou `%20`.

Exemplos de encoding correto:

| Caractere | Encoded |
|---|---|
| `\|` (pipe) | `%7C` |
| `$` | `%24` |
| `#` | `%23` |
| `&` | `%26` |

```
✅ http://www.example.com/new%7Cgrupozap.xml
✅ http://www.example.com/new%24grupozap.xml
✅ http://www.example.com/new%23grupozap.xml
✅ http://www.example.com/new%26grupozap.xml
❌ http://www.example.com/new|grupozap.xml   (pipe literal — inválido)
```

## Encoding do arquivo XML

- Apenas **dois** charsets são aceitos: `ISO8859-1` ou `UTF-8`. Nenhum
  outro é suportado.
- O arquivo **precisa declarar o encoding na primeira linha**, conforme
  especificação W3C para XML:

```xml
<?xml version="1.0" encoding="ISO8859-1"?>
```

ou

```xml
<?xml version="1.0" encoding="UTF-8"?>
```

- A doc não detalha regras de escaping de caracteres especiais além do que
  o padrão W3C XML já exige (ex: `&amp;`, `&lt;`, `&gt;`, ou envolver o
  conteúdo em `CDATA`). Ver `references/campos-do-anuncio.md` e
  `references/detalhes-precos-caracteristicas.md` para onde `CDATA` é
  recomendado nos campos específicos (Title, Description, endereço com
  acentuação).
