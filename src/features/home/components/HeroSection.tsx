import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export function HeroSection() {
  return (
    <section className="relative px-0 pt-0 -mt-[100px] md:mt-0 md:px-4 md:pt-8">
      <Container padding="none" className="md:px-4">
        <div className="relative h-[650px] md:h-[650px] w-full rounded-none md:rounded-[2.5rem] overflow-hidden">
          <Image
            src="/images/hero-image.jpg"
            alt="Imóveis Modernos Mitram"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-mitram-dark/80 via-mitram-dark/50 to-transparent z-10" />

          <div className="absolute inset-0 z-20 flex flex-col justify-center px-4 pb-12 md:px-16 md:pb-0 lg:px-24">
            <div className="max-w-2xl space-y-6">
              <span className="inline-block py-1.5 px-4 rounded-full bg-mitram-gold/20 text-mitram-goldLight text-sm font-semibold backdrop-blur-md border border-mitram-gold/30">
                ✨ Encontre seu novo lar
              </span>
              <Heading variant="display" tone="light">
                <span className="text-mitram-goldLight">Viver bem</span> começa com uma escolha segura.
              </Heading>
              <Text variant="lead" tone="light" className="max-w-xl">
                Encontre imóveis de qualidade, escolhidos para combinar com o momento da sua família e seus planos com orientação segura em cada etapa.
              </Text>
            </div>
          </div>

          {/* Trusted Badge (Floating) */}
          <div className="absolute top-8 right-8 z-20 hidden lg:flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                <Image src="https://i.pravatar.cc/100?img=1" alt="User" width={32} height={32} className="object-cover" />
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                <Image src="https://i.pravatar.cc/100?img=2" alt="User" width={32} height={32} className="object-cover" />
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                <Image src="https://i.pravatar.cc/100?img=3" alt="User" width={32} height={32} className="object-cover" />
              </div>
            </div>
            <Text as="span" variant="label">Mais de 100+ clientes satisfeitos</Text>
          </div>
        </div>
      </Container>
    </section>
  );
}
