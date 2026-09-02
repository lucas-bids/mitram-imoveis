import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/layout/CookieBanner";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { IS_PRODUCTION_DEPLOY, SITE, SITE_URL } from "@/lib/site";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mitram Imóveis | Imóveis à venda e para alugar em Curitiba",
    template: "%s | Mitram Imóveis",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  // Sem `alternates.canonical` aqui de propósito: um canonical na raiz é
  // herdado por qualquer página que esqueça de definir o seu, o que é pior do
  // que não ter nenhum. Cada rota declara o seu próprio.
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: "/",
    title: "Mitram Imóveis | Imóveis à venda e para alugar em Curitiba",
    description: SITE.description,
    // Sem `images`: a convenção de arquivo `src/app/opengraph-image.jpg` supre
    // a imagem e é herdada por toda rota que não define a sua.
  },
  twitter: {
    // O X/Twitter usa og:image quando twitter:image não existe, então a
    // convenção de arquivo já cobre o card sem um segundo asset.
    card: "summary_large_image",
  },
  robots: IS_PRODUCTION_DEPLOY
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      }
    : { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={font.className}>
      <body className="flex min-h-screen flex-col bg-white text-mitram-dark">
        <OrganizationJsonLd />
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
