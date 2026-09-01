import { PropertyDetail } from "@/features/properties/types";
import { formatPrice } from "@/features/properties/format";
import { cardClasses } from "@/components/ui/cardStyles";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { ContactPreferenceForm } from "@/features/contact/components/ContactPreferenceForm";
import { NETLIFY_FORMS } from "@/features/contact/netlify";

/** Valores e captura de lead em um cartão só — é a única chamada para ação da barra lateral. */
export function PropertyCtaCard({ property, propertyUrl }: { property: PropertyDetail; propertyUrl: string }) {
  const priceLabel = property.purpose === "rent" ? "Aluguel mensal" : "Preço total";
  const recurringCosts = [
    { label: "Condomínio", value: property.condominium_fee },
    { label: "IPTU", value: property.iptu },
  ].filter((cost) => cost.value != null);

  return (
    <div className={cardClasses("overflow-hidden rounded-xl bg-white")}>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 p-4 md:p-6">
        <div>
          <Text variant="bodySm">{priceLabel}</Text>
          <p className="text-3xl font-bold text-mitram-dark">{formatPrice(property.price)}</p>
        </div>

        {recurringCosts.length > 0 && (
          <dl className="space-y-1">
            {recurringCosts.map((cost) => (
              <div key={cost.label} className="flex items-baseline justify-end gap-2">
                <Text as="dt" variant="caption">{cost.label}</Text>
                {/* Sem <Text>: bodySm fixa text-gray-500, que colidiria com o tom escuro do valor. */}
                <dd className="text-sm font-semibold text-mitram-dark">{formatPrice(cost.value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 p-4 md:p-6">
        <Heading as="h2" variant="h4" className="mb-1">
          Deixa que nós entramos em contato com você
        </Heading>
        <Text variant="bodySm" className="mb-4">
          É rápido: deixe seu nome e telefone que um consultor da Mitram procura você.
        </Text>
        <ContactPreferenceForm
          formName={NETLIFY_FORMS.callback}
          submitLabel="Quero ser contatado"
          hiddenFields={{ propertyTitle: property.title, propertyUrl }}
        />
      </div>
    </div>
  );
}
