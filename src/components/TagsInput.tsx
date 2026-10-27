"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagsInput({ tags, onChange }: Props) {
  const [input, setInput] = useState("");

  function adicionar(val: string) {
    const tag = val.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setInput("");
  }

  function remover(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      adicionar(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      remover(tags[tags.length - 1]);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center min-h-[36px]">
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
          {tag}
          <button type="button" onClick={() => remover(tag)} className="hover:text-indigo-900">
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => adicionar(input)}
        placeholder={tags.length === 0 ? "cliente, fornecedor..." : ""}
        className="flex-1 min-w-[80px] text-sm text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-300"
      />
    </div>
  );
}
