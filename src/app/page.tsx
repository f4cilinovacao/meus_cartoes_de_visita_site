import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Meus Cartões de Visita
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Digitalize e organize os cartões de visita que você recebe. Tire uma
          foto e tenha tudo à mão, sempre que precisar.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/cadastro"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
          >
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}
