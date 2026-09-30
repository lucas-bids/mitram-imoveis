import { getFeedProperties } from "@/features/feed/queries";
import { buildVrSyncFeed } from "@/features/feed/vrsync";
import { logError, logWarn } from "@/lib/logger";

/**
 * Feed VrSync consumido por OLX, ZAP e VivaReal.
 *
 * O GrupoZap não tem API: o crawler deles baixa esta URL a cada 12 horas. Por
 * isso a rota é revalidada de hora em hora — gerar o XML a cada requisição não
 * traria nada, e o crawler tem timeout de 60s para conectar.
 *
 * O `User-Agent` `VivaRealBot/1.0` precisa estar liberado no WAF/firewall do
 * domínio, senão o download falha silenciosamente do nosso lado.
 *
 * `force-dynamic` de propósito, em vez de `revalidate`: com prerender, um
 * banco indisponível no momento do build assaria um 500 no output e ele seria
 * servido ao crawler até a próxima revalidação. O cache fica por conta do
 * `s-maxage` no header, que o CDN respeita e que nunca guarda uma resposta de
 * erro.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const properties = await getFeedProperties();
    const { xml, included, excluded } = buildVrSyncFeed(properties);

    // Um imóvel publicado que não entrou no arquivo é quase sempre
    // um erro de cadastro (poucas fotos, descrição curta, tipo sem mapeamento).
    // Sem este log a ausência é invisível até o relatório diário do portal.
    if (excluded.length > 0) {
      logWarn("feed/olx", `${excluded.length} imóvel(is) publicado(s) ficaram fora do feed`, {
        included,
        excluded,
      });
    }

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    logError("feed/olx", error);

    // 500 sem corpo XML: é melhor o portal registrar falha de carga do que
    // receber um arquivo vazio, que ele poderia ler como "zero anúncios ativos".
    return new Response("Erro ao gerar o feed.", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}
