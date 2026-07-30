import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin/dashboard");

  return (
    <div className="bg-foreground text-background flex min-h-svh flex-col justify-center px-8 py-14">
      <div className="mx-auto w-full max-w-sm">
        <div className="font-heading text-gold text-5xl italic">Sm</div>
        <h1 className="font-heading mt-1.5 text-3xl">Painel da Simone</h1>
        <p className="mt-1 text-sm opacity-70">Área restrita · acesso da profissional</p>
        <LoginForm />
      </div>
    </div>
  );
}
