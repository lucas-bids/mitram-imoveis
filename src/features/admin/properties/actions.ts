"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logError, logWarn } from "@/lib/logger";
import { getPropertyMediaStoragePaths } from "@/features/admin/properties/queries";
import { PROPERTY_IMAGES_BUCKET } from "@/features/admin/properties/storage";

export async function movePropertyToTrash(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const sb = createClient();
  const { error } = await sb
    .from('properties')
    .update({ status: 'trashed', deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    logError("admin/properties/movePropertyToTrash", error, { id });
    return;
  }
  revalidatePath('/admin/imoveis');
}

export async function restorePropertyFromTrash(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const sb = createClient();
  const { error } = await sb
    .from('properties')
    .update({ status: 'draft', deleted_at: null })
    .eq('id', id);

  if (error) {
    logError("admin/properties/restorePropertyFromTrash", error, { id });
    return;
  }
  revalidatePath('/admin/imoveis/lixeira');
}

export async function deletePropertyPermanently(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const sb = createClient();

  // Exclusão definitiva só vale para imóvel na lixeira — agora ela também
  // apaga as fotos, então um id de imóvel ativo não pode passar daqui.
  const { data: trashed, error: trashedError } = await sb
    .from('properties')
    .select('id')
    .eq('id', id)
    .eq('status', 'trashed')
    .maybeSingle();

  if (trashedError) {
    logError("admin/properties/deletePropertyPermanently:check", trashedError, { id });
    return;
  }
  if (!trashed) return;

  // Os arquivos saem primeiro: o cascade apaga as linhas de property_media
  // junto com o imóvel, e sem elas não há como saber quais arquivos eram dele.
  // Se a remoção falhar, o imóvel fica na lixeira e a exclusão pode ser repetida.
  let storagePaths: string[];
  try {
    storagePaths = await getPropertyMediaStoragePaths(sb, id);
  } catch (pathsError) {
    logError("admin/properties/deletePropertyPermanently:paths", pathsError, { id });
    return;
  }

  if (storagePaths.length > 0) {
    const { data: removed, error: storageError } = await sb.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .remove(storagePaths);

    if (storageError) {
      logError("admin/properties/deletePropertyPermanently:storage", storageError, {
        id,
        count: storagePaths.length,
      });
      return;
    }

    // O Storage não devolve erro quando remove menos do que o pedido (arquivo
    // que já não existia, ou política que bloqueou em silêncio). Não trava a
    // exclusão, mas deixa rastro para a consulta de órfãos.
    if ((removed?.length ?? 0) < storagePaths.length) {
      logWarn("admin/properties/deletePropertyPermanently:storage", "Nem todos os arquivos foram removidos", {
        id,
        requested: storagePaths.length,
        removed: removed?.length ?? 0,
      });
    }
  }

  const { error } = await sb
    .from('properties')
    .delete()
    .eq('id', id)
    .eq('status', 'trashed');

  if (error) {
    logError("admin/properties/deletePropertyPermanently", error, { id });
    return;
  }
  revalidatePath('/admin/imoveis/lixeira');
}
