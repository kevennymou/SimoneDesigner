import { backupExportUrl, getWaitlistAdmin } from "@/lib/api";
import { getForwardedCookie } from "@/lib/auth";
import { MenuLink, MenuRow } from "@/components/admin/menu-link";

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
        />
        <MenuLink
          href="/admin/procedimentos"
          title="Procedimentos e preços"
          subtitle="Cadastrar, editar e remover"
        />
        <MenuLink
          href="/admin/lista-espera"
          title="Lista de espera"
          subtitle="Clientes aguardando vaga"
          badge={waitlist.length}
        />
        <MenuLink href="/admin/relatorios" title="Relatórios" subtitle="Faturamento, clientes, faltas" />
        <MenuLink
          href="/admin/galeria"
          title="Galeria"
          subtitle="Fotos do trabalho na home"
          comingSoon
        />
        <a href={backupExportUrl()} target="_blank" rel="noreferrer">
          <MenuRow title="Backup dos agendamentos" subtitle="Exportar cópia de segurança (JSON)" />
        </a>
      </div>
    </div>
  );
}
