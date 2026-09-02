import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SITE } from "@/lib/site";

const TITLE = "Política de Privacidade";
const DESCRIPTION =
  "Como a Mitram Imóveis coleta, usa e protege os dados pessoais enviados pelos formulários do site, e como exercer seus direitos previstos na LGPD.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/politica-de-privacidade" },
  openGraph: { url: "/politica-de-privacidade", title: TITLE, description: DESCRIPTION },
};

const LAST_UPDATED = "2 de setembro de 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <Heading as="h2" variant="h4">{title}</Heading>
      <div className="space-y-3 text-[15px] leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}

/**
 * Texto revisado e aprovado pelo negócio. Os dados do controlador vêm de
 * `SITE` para não divergirem do rodapé, da página de contato e do JSON-LD.
 *
 * Três mudanças no site obrigam a revisar esta página e a data em
 * `LAST_UPDATED` — nenhuma delas deve ir ao ar antes disso:
 * - adotar qualquer ferramenta de análise, pixel ou cookie não essencial
 *   (§12 afirma que não existe nenhum);
 * - preencher `virtual_tour_url` em algum imóvel, o que passa a enviar dados
 *   do visitante a um provedor externo que precisa ser nomeado em §10;
 * - passar a enviar comunicação promocional, o que muda §5 e §6 e exige
 *   consentimento específico no formulário.
 */
export default function PrivacyPolicyPage() {
  return (
    <Container className="py-8 md:py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <Breadcrumbs
          items={[
            { name: "Início", href: "/" },
            { name: TITLE, href: "/politica-de-privacidade" },
          ]}
        />

        <div className="space-y-2">
          <Heading variant="h1">{TITLE}</Heading>
          <Text variant="caption">Última atualização: {LAST_UPDATED}</Text>
        </div>

        <Text variant="body">
          Esta política descreve como a {SITE.name} trata os dados pessoais enviados através
          deste site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          Ela reflete o funcionamento real do site: quais formulários existem, o que cada um
          envia e quais serviços de terceiros participam do processo.
        </Text>

        <Section title="1. Quem é o controlador">
          <p>
            {SITE.legalName}, inscrita no CNPJ sob o nº {SITE.cnpj}, corretora de imóveis
            registrada sob o CRECI {SITE.creci}, atuando comercialmente como {SITE.name}.
          </p>
          <p>
            Endereço: {SITE.address.street} — {SITE.address.locality}/{SITE.address.region}.
          </p>
        </Section>

        <Section title="2. Contato para assuntos de privacidade">
          <p>
            Pedidos relacionados a dados pessoais podem ser enviados para{" "}
            <a href={`mailto:${SITE.email}`} className="text-mitram-gold underline">
              {SITE.email}
            </a>{" "}
            ou pelo telefone{" "}
            <a href={`tel:${SITE.phone.e164}`} className="text-mitram-gold underline">
              {SITE.phone.display}
            </a>
            . Atendimento {SITE.openingHours.display.toLowerCase()}.
          </p>
        </Section>

        <Section title="3. Quais dados são coletados">
          <p>O site tem três formulários. Cada um envia apenas os campos abaixo:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Formulário de contato</strong> (página Contato): nome, e-mail, telefone,
              mensagem e o aceite da política.
            </li>
            <li>
              <strong>Pedido de retorno sobre um imóvel</strong> (página do imóvel): nome,
              telefone, preferência de contato (WhatsApp ou e-mail), título e endereço do imóvel
              de interesse, e o aceite da política. O e-mail só é pedido — e só é enviado — se
              essa for a preferência escolhida.
            </li>
            <li>
              <strong>Pedido de avaliação de terreno</strong> (página inicial): nome, telefone,
              preferência de contato, o e-mail quando essa for a preferência escolhida, e o
              aceite da política.
            </li>
          </ul>
          <p>
            Os formulários também contêm um campo oculto anti-spam (<em>honeypot</em>), que só é
            preenchido por robôs e cujo conteúdo é descartado. Como todo site, o servidor registra
            o endereço IP e o navegador de quem acessa, para operação e segurança.
          </p>
          <p>
            <strong>O site não guarda esses dados em banco próprio.</strong> As mensagens ficam
            apenas no painel de formulários da Netlify, de onde a equipe as consulta.
          </p>
        </Section>

        <Section title="4. Interesse em imóveis e preferência de contato">
          <p>
            Quando o pedido parte da página de um imóvel, registramos qual imóvel gerou o contato e
            por qual canal a pessoa prefere ser respondida. Isso existe para que o retorno seja
            sobre o imóvel certo, pelo meio escolhido — não para construir perfil de navegação.
          </p>
        </Section>

        <Section title="5. Para que os dados são usados">
          <ul className="list-disc space-y-2 pl-5">
            <li>Responder à mensagem ou ao pedido de contato enviado.</li>
            <li>Dar seguimento à negociação do imóvel de interesse.</li>
            <li>Prevenir spam e uso abusivo dos formulários.</li>
          </ul>
          <p>
            O retorno é feito pelo canal que você escolher no formulário: WhatsApp ou e-mail.{" "}
            <strong>Não enviamos newsletter, mala direta nem qualquer comunicação
            promocional</strong>, e o seu contato não entra em lista de disparo.
          </p>
        </Section>

        <Section title="6. Bases legais">
          <p>
            O envio de qualquer um dos formulários depende do aceite explícito desta política. O
            tratamento seguinte — responder ao contato e dar seguimento a uma eventual negociação —
            apoia-se no atendimento a pedido da própria pessoa e nas providências preliminares
            relacionadas a um possível contrato de compra, venda ou locação.
          </p>
          <p>
            Não há tratamento com finalidade promocional, de perfilamento ou de publicidade
            direcionada, e os dados não são vendidos nem cedidos a terceiros para esses fins.
          </p>
        </Section>

        <Section title="7. Por quanto tempo guardamos">
          <p>
            As mensagens enviadas pelos formulários são mantidas por{" "}
            <strong>até 12 meses contados a partir do último contato</strong>, e depois excluídas
            do painel de formulários. Você pode pedir a exclusão antes desse prazo pelo contato da
            seção 2.
          </p>
          <p>
            Dados que precisem ser preservados para cumprimento de obrigação legal ou regulatória,
            ou para o exercício de direitos em processo, podem ser mantidos por período maior, nos
            termos do art. 16 da LGPD.
          </p>
        </Section>

        <Section title="8. Seus direitos">
          <p>
            A LGPD (art. 18) garante a confirmação da existência de tratamento, o acesso, a
            correção, a anonimização ou eliminação de dados desnecessários, a portabilidade, a
            informação sobre com quem os dados foram compartilhados, e a revogação do
            consentimento. Para exercer qualquer um deles, use o contato da seção 2.
          </p>
        </Section>

        <Section title="9. Segurança">
          <p>
            O site é servido exclusivamente por HTTPS. Os formulários passam por filtro de spam e
            campo anti-robô. O painel administrativo exige autenticação, e o banco de dados aplica
            políticas de acesso por linha, de modo que o conteúdo em rascunho nunca fica visível
            publicamente.
          </p>
        </Section>

        <Section title="10. Serviços de terceiros">
          <p>Estes serviços participam do funcionamento do site e do atendimento:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Netlify</strong> — hospedagem e recebimento dos formulários. Recebe todas as
              requisições ao site (incluindo IP e navegador) e o conteúdo das mensagens enviadas.
            </li>
            <li>
              <strong>Supabase</strong> — banco de dados dos imóveis e autenticação da equipe. Não
              recebe dados de visitantes.
            </li>
            <li>
              <strong>Google Maps</strong> — mapa exibido nas páginas de imóvel e na visualização em
              mapa da listagem. O mapa é carregado pelo navegador, então o Google recebe o endereço
              IP e a página visitada.
            </li>
            <li>
              <strong>YouTube</strong> — vídeos de alguns imóveis. O vídeo só é carregado depois de
              um clique, e usa o domínio de privacidade reforçada
              (<code>youtube-nocookie.com</code>). A miniatura exibida antes do clique é buscada
              pelo nosso servidor, não pelo navegador de quem visita.
            </li>
            <li>
              <strong>WhatsApp e Instagram (Meta)</strong> — links de contato e de perfil. Só
              recebem dados se a pessoa clicar.
            </li>
          </ul>
        </Section>

        <Section title="11. Transferência internacional">
          <p>
            Netlify, Google e Supabase operam servidores fora do Brasil, de modo que parte do
            tratamento ocorre no exterior, nos termos do art. 33 da LGPD.
          </p>
        </Section>

        <Section title="12. Cookies">
          <p>
            Este site usa <strong>apenas cookies e armazenamento local essenciais</strong>. Não há
            ferramenta de análise de audiência nem cookies de publicidade.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <code>mitram_cookie_consent</code> — guarda no seu navegador o fato de você já ter
              visto o aviso de cookies, para que ele não reapareça.
            </li>
            <li>
              Cookies de autenticação, criados <strong>somente</strong> quando alguém da equipe
              entra no painel administrativo. Visitantes do site público não recebem esses cookies.
            </li>
          </ul>
          <p>
            Para apagá-los, basta limpar os dados do site no seu navegador. Caso alguma ferramenta
            opcional venha a ser adotada, ela só será carregada mediante consentimento e esta
            política será atualizada antes.
          </p>
        </Section>

        <Section title="13. Alterações desta política">
          <p>
            Mudanças relevantes serão publicadas nesta página, com atualização da data no topo.
            A versão vigente é sempre a que estiver aqui.
          </p>
          <p>
            <Link href="/contato" className="text-mitram-gold underline">
              Fale com a gente
            </Link>{" "}
            se alguma parte deste texto não estiver clara.
          </p>
        </Section>
      </div>
    </Container>
  );
}
