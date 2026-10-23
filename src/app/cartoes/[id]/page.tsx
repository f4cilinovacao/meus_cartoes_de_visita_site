import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import EditCartaoForm from "./EditCartaoForm";

export const instant = false;

export default async function CartaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: cartao } = await supabase
    .from("cartoes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!cartao) notFound();

  return <EditCartaoForm cartao={cartao} />;
}
