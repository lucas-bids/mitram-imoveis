"use client";

import { useMemo, useState } from "react";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { buttonShapeClasses } from "@/components/ui/buttonStyles";
import { FormField, SELECT_ARROW_STYLE, SELECT_EXTRA, fieldClasses } from "@/components/ui/FormField";
import { PropertyFormValues } from "@/features/admin/properties/schema";
import { FormSection } from "@/features/admin/properties/components/form/FormSection";
import { BRAZILIAN_STATES } from "./states";
import { SearchCreateSelect } from "./SearchCreateSelect";
import { createCity, createNeighborhood } from "./mutations";
import { geocodePropertyAddress } from "./geocode";
import { CityOption, NeighborhoodOption } from "./types";
import { AddressMapPreview } from "./AddressMapPreview";

interface Props {
  form: UseFormReturn<PropertyFormValues>;
  initialCities: CityOption[];
  initialNeighborhoods: NeighborhoodOption[];
}

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function AddressSection(props: Props) {
  return (
    <APIProvider apiKey={MAPS_API_KEY ?? ""} language="pt-BR" region="BR">
      <AddressFields {...props} />
    </APIProvider>
  );
}

function AddressFields({ form, initialCities, initialNeighborhoods }: Props) {
  const { control, register, setValue, getValues, trigger, formState: { errors } } = form;
  const values = useWatch({ control, name: ["state", "city_id", "neighborhood_id", "street", "number", "complement", "postal_code", "latitude", "longitude"] });
  const [state, cityId, neighborhoodId, street, number, , postalCode, latitude, longitude] = values;
  const [cities, setCities] = useState(initialCities);
  const [neighborhoods, setNeighborhoods] = useState(initialNeighborhoods);
  const [confirming, setConfirming] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string | null>(null);
  const [confirmedFingerprint, setConfirmedFingerprint] = useState(() => latitude && longitude ? JSON.stringify(values.slice(0, 7)) : "");
  const geocodingLibrary = useMapsLibrary("geocoding");
  const geocoder = useMemo(() => geocodingLibrary ? new geocodingLibrary.Geocoder() : null, [geocodingLibrary]);

  const stateCities = useMemo(() => cities.filter((city) => city.state === state), [cities, state]);
  const cityNeighborhoods = useMemo(() => neighborhoods.filter((item) => item.city_id === cityId), [neighborhoods, cityId]);
  const city = cities.find((item) => item.id === cityId);
  const neighborhood = neighborhoods.find((item) => item.id === neighborhoodId);
  const fingerprint = JSON.stringify(values.slice(0, 7));
  const confirmed = Boolean(latitude && longitude && confirmedFingerprint === fingerprint);

  const invalidateLocation = () => {
    setValue("latitude", null, { shouldValidate: true });
    setValue("longitude", null, { shouldValidate: true });
    setConfirmedFingerprint("");
    setFormattedAddress(null);
    setGeocodeError(null);
  };

  const confirmAddress = async () => {
    const valid = await trigger(["state", "city_id", "neighborhood_id", "street", "number", "postal_code"]);
    if (!valid || !city || !neighborhood || !geocoder) return;
    setConfirming(true);
    setGeocodeError(null);
    try {
      const result = await geocodePropertyAddress(geocoder, {
        state: getValues("state"), city: city.name, neighborhood: neighborhood.name,
        street: getValues("street"), number: getValues("number"), postalCode: getValues("postal_code"),
      });
      setValue("latitude", result.latitude, { shouldValidate: true, shouldDirty: true });
      setValue("longitude", result.longitude, { shouldValidate: true, shouldDirty: true });
      setFormattedAddress(result.formattedAddress);
      setConfirmedFingerprint(fingerprint);
    } catch (error) {
      setGeocodeError(error instanceof Error ? error.message : "Não foi possível confirmar o endereço.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <FormSection id="endereco" title="Endereço" description="Confirme o endereço no mapa para definir a localização exata do imóvel.">
      <input type="hidden" {...register("city_id")} />
      <input type="hidden" {...register("neighborhood_id")} />
      <input type="hidden" {...register("latitude")} />
      <input type="hidden" {...register("longitude")} />
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
        <FormField label="Estado" error={errors.state?.message} alwaysFloat>
          <select
            {...register("state", { onChange: () => {
              setValue("city_id", "", { shouldValidate: true });
              setValue("neighborhood_id", "", { shouldValidate: true });
              invalidateLocation();
            } })}
            className={fieldClasses(!!errors.state, SELECT_EXTRA)} style={SELECT_ARROW_STYLE}
          >
            <option value="">Selecione...</option>
            {BRAZILIAN_STATES.map(([uf, name]) => <option key={uf} value={uf}>{name} ({uf})</option>)}
          </select>
        </FormField>
        <FormField label="Cidade" error={errors.city_id?.message} className="md:col-span-2" alwaysFloat>
          <SearchCreateSelect
            id="city-search" value={cityId} options={stateCities} disabled={!state}
            placeholder={state ? "Busque ou crie uma cidade" : "Selecione o estado primeiro"} createLabel="Cidade"
            onCreate={(name) => createCity(name, state)}
            onChange={(id, option) => {
              setCities((current) => current.some((item) => item.id === option.id) ? current : [...current, option]);
              setValue("city_id", id, { shouldValidate: true, shouldDirty: true });
              setValue("neighborhood_id", "", { shouldValidate: true, shouldDirty: true });
              invalidateLocation();
            }}
          />
        </FormField>
        <FormField label="Bairro" error={errors.neighborhood_id?.message} className="md:col-span-3" alwaysFloat>
          <SearchCreateSelect
            id="neighborhood-search" value={neighborhoodId} options={cityNeighborhoods} disabled={!cityId}
            placeholder={cityId ? "Busque ou crie um bairro" : "Selecione a cidade primeiro"} createLabel="Bairro"
            onCreate={(name) => createNeighborhood(name, cityId)}
            onChange={(id, option) => {
              setNeighborhoods((current) => current.some((item) => item.id === option.id) ? current : [...current, option]);
              setValue("neighborhood_id", id, { shouldValidate: true, shouldDirty: true });
              invalidateLocation();
            }}
          />
        </FormField>
        <FormField label="Rua" error={errors.street?.message} className="md:col-span-2">
          <input placeholder=" " {...register("street", { onChange: invalidateLocation })} className={fieldClasses(!!errors.street)} />
        </FormField>
        <FormField label="Número" error={errors.number?.message}>
          <input placeholder=" " {...register("number", { onChange: invalidateLocation })} className={fieldClasses(!!errors.number)} />
        </FormField>
        <FormField label="Complemento" error={errors.complement?.message} className="md:col-span-2">
          <input placeholder=" " {...register("complement", { onChange: invalidateLocation })} className={fieldClasses(!!errors.complement)} />
        </FormField>
        <FormField label="CEP" error={errors.postal_code?.message}>
          <input inputMode="numeric" placeholder=" " {...register("postal_code", { onChange: invalidateLocation })} className={fieldClasses(!!errors.postal_code)} />
        </FormField>
      </div>

      <div className="mt-6 space-y-4">
        {MAPS_API_KEY ? (
          <button type="button" disabled={confirming || !geocoder} onClick={() => void confirmAddress()} className={buttonShapeClasses("md", "bg-mitram-dark text-white hover:bg-black disabled:opacity-60")}>
            {confirming || !geocoder ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
            {!geocoder ? "Carregando mapa..." : confirming ? "Localizando..." : confirmed ? "Confirmar endereço novamente" : "Confirmar endereço"}
          </button>
        ) : (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">Google Maps não está configurado.</p>
        )}
        {geocodeError && <p className="text-sm text-red-600">{geocodeError}</p>}
        {confirmed && latitude && longitude && (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm text-green-700"><CheckCircle2 size={17} /> Endereço confirmado{formattedAddress ? `: ${formattedAddress}` : "."}</p>
            <p className="text-xs text-gray-500">Arraste o marcador se precisar ajustar a posição exata.</p>
            <AddressMapPreview latitude={Number(latitude)} longitude={Number(longitude)} onPositionChange={(lat, lng) => {
              setValue("latitude", lat, { shouldValidate: true, shouldDirty: true });
              setValue("longitude", lng, { shouldValidate: true, shouldDirty: true });
            }} />
          </div>
        )}
        {(errors.latitude || errors.longitude) && <p className="text-sm text-red-600">Confirme o endereço no mapa antes de salvar.</p>}
      </div>
    </FormSection>
  );
}
