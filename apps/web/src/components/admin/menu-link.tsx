import Link from "next/link";

interface MenuRowProps {
  title: string;
  subtitle: string;
  badge?: number;
  comingSoon?: boolean;
}

export function MenuRow({ title, subtitle, badge, comingSoon }: MenuRowProps) {
  return (
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
}

interface MenuLinkProps extends MenuRowProps {
  href: string;
}

export function MenuLink({ href, comingSoon, ...rest }: MenuLinkProps) {
  if (comingSoon) return <MenuRow comingSoon {...rest} />;
  return (
    <Link href={href}>
      <MenuRow {...rest} />
    </Link>
  );
}
