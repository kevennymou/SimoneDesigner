import type { NextConfig } from "next";
import path from "node:path";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  // Proxeia /api/* pra API real. Chamadas do navegador passam por aqui (em vez de
  // irem direto pro domínio da API) pra que o cookie de sessão seja tratado como
  // primeira-parte — navegadores modernos descartam cookies de terceiro mesmo com
  // SameSite=None; Secure quando o front e a API estão em domínios diferentes.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;
