"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, login } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar agora.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-9">
      <label className="text-[11px] tracking-[0.15em] opacity-70 uppercase">Usuária</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="simone"
        autoComplete="username"
        className="border-background/25 bg-background/6 text-background placeholder:text-background/40 mt-1.5 mb-4 w-full rounded-xl border px-4 py-3.5 text-sm"
      />

      <label className="text-[11px] tracking-[0.15em] opacity-70 uppercase">Senha</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••"
        autoComplete="current-password"
        className="border-background/25 bg-background/6 text-background placeholder:text-background/40 mt-1.5 mb-6 w-full rounded-xl border px-4 py-3.5 text-sm"
      />

      {error && (
        <p className="text-destructive mb-4 text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !username || !password}
        className="bg-gold text-foreground w-full rounded-xl py-4 text-sm font-semibold tracking-wide disabled:opacity-50"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
