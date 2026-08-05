"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function movePropertyToTrash(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const sb = createClient();
  await sb.from('properties').update({ status: 'trashed', deleted_at: new Date().toISOString() }).eq('id', id);
  revalidatePath('/admin/imoveis');
}

export async function restorePropertyFromTrash(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const sb = createClient();
  await sb.from('properties').update({ status: 'draft', deleted_at: null }).eq('id', id);
  revalidatePath('/admin/imoveis/lixeira');
}

export async function deletePropertyPermanently(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const sb = createClient();
  await sb.from('properties').delete().eq('id', id);
  revalidatePath('/admin/imoveis/lixeira');
}
