"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Camera, Loader2, CreditCard, Share2, Mail, Lock, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  userId: string;
  email: string;
  nomeInicial: string;
  avatarInicial: string | null;
  provider: string;
  totalCartoes: number;
  compartilhados: number;
}

export default function PerfilClient({ userId, email, nomeInicial, avatarInicial, provider, totalCartoes, compartilhados }: Props) {
  const router = useRouter();
  const [nome, setNome] = useState(nomeInicial);
  const [avatar, setAvatar] = useState<string | null>(avatarInicial);
  const [savingNome, setSavingNome] = useState(false);
  const [nomeSalvo, setNomeSalvo] = useState(false);

  const [novoEmail, setNovoEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");

  const [novaSenha, setNovaSenha] = useState("");
  const [savingSenha, setSavingSenha] = useState(false);
  const [senhaMsg, setSenhaMsg] = useState("");

  async function handleSaveNome() {
    setSavingNome(true);
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { full_name: nome } });
    setSavingNome(false);
    setNomeSalvo(true);
    setTimeout(() => setNomeSalvo(false), 2000);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const supabase = createClient();
    const path = `avatars/${userId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("cartoes-fotos").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("cartoes-fotos").getPublicUrl(path);
      setAvatar(data.publicUrl);
      await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
    }
  }

  async function handleTrocarEmail(e: React.FormEvent) {
    e.preventDefault();
    setSavingEmail(true);
    setEmailMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: novoEmail });
    setSavingEmail(false);
    setEmailMsg(error ? error.message : "Confirmação enviada para o novo e-mail!");
    if (!error) setNovoEmail("");
  }

  async function handleTrocarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha.length < 6) { setSenhaMsg("Mínimo 6 caracteres"); return; }
    setSavingSenha(true);
    setSenhaMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSavingSenha(false);
    setSenhaMsg(error ? error.message : "Senha alterada com sucesso!");
    if (!error) setNovaSenha("");
  }


  const isGoogle = provider === "google";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/cartoes" className="p-1 -ml-1 text-gray-500 hover:text-gray-800">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="font-bold text-gray-900">Meu perfil</h1>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-5">

        {/* Avatar + Nome */}
        <div className="bg-white rounded-2xl border p-5 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
              {avatar ? (
                <Image src={avatar} alt="Avatar" width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <span className="text-3xl font-bold text-indigo-600">
                  {(nome || email)[0].toUpperCase()}
                </span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-indigo-700 transition">
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          <div className="w-full flex gap-2">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              className="flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={handleSaveNome}
              disabled={savingNome || nome === nomeInicial}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 disabled:opacity-40 hover:bg-indigo-700 transition"
            >
              {savingNome ? <Loader2 size={15} className="animate-spin" /> : nomeSalvo ? <Check size={15} /> : "Salvar"}
            </button>
          </div>

          <p className="text-sm text-gray-400">{email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border p-4 flex flex-col items-center gap-1">
            <CreditCard size={22} className="text-indigo-500" />
            <p className="text-2xl font-bold text-gray-900">{totalCartoes}</p>
            <p className="text-xs text-gray-400">Meus cartões</p>
          </div>
          <div className="bg-white rounded-2xl border p-4 flex flex-col items-center gap-1">
            <Share2 size={22} className="text-indigo-500" />
            <p className="text-2xl font-bold text-gray-900">{compartilhados}</p>
            <p className="text-xs text-gray-400">Compartilhados</p>
          </div>
        </div>

        {/* Trocar email (só para login por email) */}
        {!isGoogle && (
          <div className="bg-white rounded-2xl border p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <Mail size={16} className="text-indigo-500" />
              Trocar e-mail
            </div>
            <form onSubmit={handleTrocarEmail} className="flex gap-2">
              <input
                type="email"
                placeholder="Novo e-mail"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                required
                className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                disabled={savingEmail || !novoEmail}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-indigo-700 transition"
              >
                {savingEmail ? <Loader2 size={15} className="animate-spin" /> : "Enviar"}
              </button>
            </form>
            {emailMsg && <p className="text-xs text-indigo-600">{emailMsg}</p>}
          </div>
        )}

        {/* Trocar senha (só para login por email) */}
        {!isGoogle && (
          <div className="bg-white rounded-2xl border p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <Lock size={16} className="text-indigo-500" />
              Trocar senha
            </div>
            <form onSubmit={handleTrocarSenha} className="flex gap-2">
              <input
                type="password"
                placeholder="Nova senha (mín. 6 caracteres)"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                disabled={savingSenha || !novaSenha}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-indigo-700 transition"
              >
                {savingSenha ? <Loader2 size={15} className="animate-spin" /> : "Salvar"}
              </button>
            </form>
            {senhaMsg && <p className="text-xs text-indigo-600">{senhaMsg}</p>}
          </div>
        )}

      </div>
    </div>
  );
}
