import { cookies } from "next/headers";
import type { Admin } from "@simone/shared";
import { getMe } from "./api";

export const ACCESS_TOKEN_COOKIE = "access_token";

/** Só funciona em Server Components/Route Handlers — lê o cookie da requisição recebida. */
export async function getCurrentAdmin(): Promise<Admin | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    return await getMe(`${ACCESS_TOKEN_COOKIE}=${token}`);
  } catch {
    return null;
  }
}

/** Repassa todos os cookies da requisição recebida pra uma chamada de API server-side. */
export async function getForwardedCookie(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.toString();
}
