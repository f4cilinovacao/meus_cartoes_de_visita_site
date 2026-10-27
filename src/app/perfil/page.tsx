import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PerfilClient from "./PerfilClient";

export const instant = false;

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: meusCartoes }, { data: meusCompartilhados, error: errComp }] = await Promise.all([
    supabase.from("cartoes").select("id").eq("user_id", user.id),
    supabase.from("cartoes_compartilhados").select("cartao_id").eq("owner_id", user.id),
  ]);
  if (errComp) console.error("[perfil] compartilhados error:", errComp.message);
  const totalCartoes = meusCartoes?.length ?? 0;
  // Conta cartões únicos compartilhados (um cartão pode ter vários destinatários)
  const compartilhados = new Set(meusCompartilhados?.map((r) => r.cartao_id) ?? []).size;

  return (
    <PerfilClient
      userId={user.id}
      email={user.email ?? ""}
      nomeInicial={user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""}
      avatarInicial={user.user_metadata?.avatar_url ?? null}
      provider={user.app_metadata?.provider ?? "email"}
      totalCartoes={totalCartoes ?? 0}
      compartilhados={compartilhados ?? 0}
    />
  );
}
