import Image from "next/image";
import Link from "next/link";

export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <Image src="/favicon.svg" alt="Meus Cartões de Visita" width={size} height={size} />
  );
}

export function LogoFull({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.svg"
      alt="Meus Cartões de Visita"
      width={200}
      height={50}
      className={className}
    />
  );
}

export function LogoLink({ size = 32 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Image src="/favicon.svg" alt="" width={size} height={size} aria-hidden="true" />
      <span className="font-bold text-gray-900 text-sm leading-tight hidden sm:block">
        Meus Cartões<br />
        <span className="text-indigo-600">de Visita</span>
      </span>
    </Link>
  );
}
