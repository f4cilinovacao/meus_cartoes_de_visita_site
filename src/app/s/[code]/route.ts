import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

export const instant = false;

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("perfis_publicos")
    .select("username")
    .eq("short_code", code)
    .eq("ativo", true)
    .maybeSingle();

  if (!data) notFound();

  redirect(`/u/${data.username}`);
}
