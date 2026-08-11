"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logError } from "@/lib/logger";

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
  const { error } = await sb.from('properties').delete().eq('id', id);

  if (error) {
    logError("admin/properties/deletePropertyPermanently", error, { id });
    return;
  }
  revalidatePath('/admin/imoveis/lixeira');
}
