"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cartao_dark") === "1";
      setDark(saved);
      document.documentElement.setAttribute("data-dark", saved ? "1" : "0");
    } catch { /* */ }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem("cartao_dark", next ? "1" : "0"); } catch { /* */ }
    document.documentElement.setAttribute("data-dark", next ? "1" : "0");
  }

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center text-gray-600 hover:text-indigo-600 transition"
      title={dark ? "Modo claro" : "Modo escuro"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
