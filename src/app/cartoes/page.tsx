import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, UserCircle } from "lucide-react";
import CartoesClient from "./CartoesClient";

export const instant = false;

export default async function CartoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: meus }, { data: recebidos }] = await Promise.all([
    supabase
      .from("cartoes")
      .select("id, nome, empresa, cargo, email, telefone, foto_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("cartoes_recebidos")
      .select("id, nome, empresa, cargo, email, telefone, foto_url, owner_email, owner_nome"),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Image src="/logo.svg" alt="Meus Cartões de Visita" width={140} height={35} />
          <div className="flex items-center gap-1">
            <Link href="/perfil" className="p-2 text-gray-400 hover:text-indigo-600 transition">
              <UserCircle size={22} />
            </Link>
            <form action="/api/auth/signout" method="post">
              <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition py-2 px-1">
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <CartoesClient
          meus={meus ?? []}
          recebidos={recebidos ?? []}
        />
      </main>
    </div>
  );
}
