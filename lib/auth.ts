// lib/auth.ts
import { cookies } from "next/headers";

export type SessionUser = {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  roles: string[];
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();             // 👈 aquí el await
  const raw = cookieStore.get("session")?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

