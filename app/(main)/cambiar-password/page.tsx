// app/(main)/cambiar-password/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ChangePasswordClient from "./ChangePasswordClient";

export default async function ChangePasswordPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <ChangePasswordClient 
      nombreUsuario={`${session.nombre} ${session.apellido}`}
    />
  );
}
