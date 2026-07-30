"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Admin } from "@simone/shared";
import { logout } from "@/lib/api";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Painel", icon: "◇" },
  { href: "/admin/agenda", label: "Agenda", icon: "▤" },
  { href: "/admin/clientes", label: "Clientes", icon: "♥" },
  { href: "/admin/mais", label: "Mais", icon: "≡" },
];

const MAIS_SUBPATHS = [
  "/admin/disponibilidade",
  "/admin/procedimentos",
  "/admin/lista-espera",
  "/admin/relatorios",
  "/admin/galeria",
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin/mais") {
    return pathname.startsWith(href) || MAIS_SUBPATHS.some((p) => pathname.startsWith(p));
  }
  return pathname.startsWith(href);
}

export function AdminNav({ admin }: { admin: Admin }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <aside className="border-border bg-secondary hidden w-60 shrink-0 flex-col border-r px-5 py-8 lg:flex">
        <div className="font-heading text-primary text-3xl italic">Sm</div>
        <div className="mt-1 text-xs text-muted-foreground">{admin.username}</div>
        <nav className="mt-10 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-3 text-sm ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-background"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto text-left text-xs tracking-wide text-muted-foreground"
        >
          Sair
        </button>
      </aside>

      <nav className="border-border bg-background fixed inset-x-0 bottom-0 z-20 flex border-t px-1 pt-2 pb-3.5 lg:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
