import Link from "next/link";
import { getWaitlistAdmin } from "@/lib/api";
import { getForwardedCookie } from "@/lib/auth";

export default async function MaisPage() {
  const cookie = await getForwardedCookie();
  const waitlist = await getWaitlistAdmin(cookie);

  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <h1 className="font-heading mb-4.5 text-2xl text-foreground">Gerenciar</h1>
      <div className="flex flex-col gap-2.5 lg:max-w-lg">
        <MenuLink
          href="/admin/disponibilidade"
          title="Disponibilidade"
          subtitle="Dias, horários, folgas e bloqueios"
          comingSoon
        />
        <MenuLink
          href="/admin/procedimentos"
          title="Procedimentos e preços"
          subtitle="Cadastrar, editar e remover"
          comingSoon
        />
        <MenuLink
          href="/admin/lista-espera"
          title="Lista de espera"
          subtitle="Clientes aguardando vaga"
          badge={waitlist.length}
        />
        <MenuLink
          href="/admin/relatorios"
          title="Relatórios"
          subtitle="Faturamento, clientes, faltas"
          comingSoon
        />
        <MenuLink
          href="/admin/galeria"
          title="Galeria"
          subtitle="Fotos do trabalho na home"
          comingSoon
        />
      </div>
    </div>
  );
}

function MenuLink({
  href,
  title,
  subtitle,
  badge,
  comingSoon,
}: {
  href: string;
  title: string;
  subtitle: string;
  badge?: number;
  comingSoon?: boolean;
}) {
  const content = (
    <div
      className={`border-border bg-background flex items-center justify-between rounded-2xl border px-5 py-4 ${comingSoon ? "opacity-50" : ""}`}
    >
      <div>
        <div className="flex items-center gap-2 text-sm text-foreground">
          {title}
          {badge !== undefined && badge > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[10px]">
              {badge}
            </span>
          )}
          {comingSoon && (
            <span className="bg-secondary text-muted-foreground rounded-full px-2 py-0.5 text-[10px]">
              em breve
            </span>
          )}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>
      </div>
      {!comingSoon && <span className="text-lg text-border">›</span>}
    </div>
  );

  if (comingSoon) return content;
  return <Link href={href}>{content}</Link>;
}
