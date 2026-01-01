/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRefresh } from "@/lib/useRefresh";

type ClienteDTO = {
  id: number;
  razonSocial: string;
  rut: string;
  telefono: string | null;
  email: string | null;
  direccion: string; // 👈 ya no null
};

interface Props {
  clientes: ClienteDTO[];
}


function validarFormatoRut(rut: string): boolean {
  rut = rut.trim().toUpperCase();
  // 7 u 8 números, guion, dígito 0–9 o K
  return /^\d{7,8}-[\dK]$/.test(rut);
}


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.(com|cl)$/i;

export default function ClientesClient({ clientes }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-refresh cada 10 segundos para ver cambios de otros usuarios
  useRefresh(10);

  const [search, setSearch] = useState("");

  // Abrir modal si viene ?crear=true
  useEffect(() => {
    const crear = searchParams?.get("crear");
    if (crear === "true") {
      abrirModalCrear();
      router.replace("/clientes", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Crear
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [nuevoRazonSocial, setNuevoRazonSocial] = useState("");
  const [nuevoRut, setNuevoRut] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoDireccion, setNuevoDireccion] = useState("");
  const [guardandoCreacion, setGuardandoCreacion] = useState(false);
  const [errorCreacion, setErrorCreacion] = useState<string | null>(null);

  // Editar
  const [editarAbierto, setEditarAbierto] = useState(false);
  const [clienteSel, setClienteSel] = useState<ClienteDTO | null>(null);
  const [editRazonSocial, setEditRazonSocial] = useState("");
  const [editRut, setEditRut] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDireccion, setEditDireccion] = useState("");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);

  // Eliminar
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  // -------- FILTRO BÁSICO ----------
  const clientesFiltrados = clientes.filter((c) => {
    const t = search.toLowerCase().trim();
    if (!t) return true;

    return (
      c.razonSocial.toLowerCase().includes(t) ||
      c.rut.toLowerCase().includes(t) ||
      (c.telefono ?? "").toLowerCase().includes(t) ||
      (c.email ?? "").toLowerCase().includes(t) ||
      (c.direccion ?? "").toLowerCase().includes(t)
    );
  });

  // -------- CREAR ----------
  const abrirModalCrear = () => {
    setNuevoRazonSocial("");
    setNuevoRut("");
    setNuevoTelefono("");
    setNuevoEmail("");
    setNuevoDireccion("");
    setErrorCreacion(null);
    setErrorGeneral(null);
    setCrearAbierto(true);
  };

  const cerrarModalCrear = () => {
    setCrearAbierto(false);
    setErrorCreacion(null);
  };

const handleCrearSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const razonTrim = nuevoRazonSocial.trim();
  const rutTrim = nuevoRut.trim();
  const emailTrim = nuevoEmail.trim();
  const telTrim = nuevoTelefono.trim();
  const dirTrim = nuevoDireccion.trim();

  if (!razonTrim || !rutTrim || !dirTrim) {
    setErrorCreacion("Nombre de empresa, RUT y dirección son obligatorios.");
    return;
  }
    if (dirTrim.length < 5) {
    setErrorCreacion("La dirección debe tener al menos 5 caracteres.");
    return;
    }

    if (dirTrim.length > 50) {
    setErrorCreacion("La dirección no puede superar los 50 caracteres.");
    return;
    }


  // Validación básica de formato de RUT: 7-8 dígitos + guion + dígito o K
  const rutVal = rutTrim.toUpperCase();

  if (!validarFormatoRut(rutVal)) {
    setErrorCreacion("RUT inválido. Formato válido: 12345678-5");
    return;
  }


  // Email opcional, pero si lo ponen, que sea válido .com / .cl
  if (emailTrim && !EMAIL_REGEX.test(emailTrim)) {
    setErrorCreacion("Ingresa un correo válido que termine en .com o .cl.");
    return;
  }

  // Tel opcional, pero si lo ponen, entre 8 y 10 dígitos
  if (telTrim && (telTrim.length < 8 || telTrim.length > 10)) {
    setErrorCreacion(
      "El teléfono debe tener entre 8 y 10 dígitos (solo números)."
    );
    return;
  }

  setGuardandoCreacion(true);
  setErrorCreacion(null);
  setErrorGeneral(null);

  try {
    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razonSocial: razonTrim,
        rut: rutVal,                 // ya normalizado
        telefono: telTrim === "" ? null : telTrim,
        email: emailTrim === "" ? null : emailTrim,
        direccion: dirTrim,          // OBLIGATORIA
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error || "Error al crear cliente");
    }

    cerrarModalCrear();
    router.refresh();
  } catch (err: any) {
    setErrorCreacion(err.message ?? "Error desconocido");
    setErrorGeneral(err.message ?? "Error desconocido");
  } finally {
    setGuardandoCreacion(false);
  }
};


  // -------- EDITAR ----------
  const abrirModalEditar = (c: ClienteDTO) => {
    setClienteSel(c);
    setEditRazonSocial(c.razonSocial);
    setEditRut(c.rut);
    setEditTelefono(c.telefono ?? "");
    setEditEmail(c.email ?? "");
    setEditDireccion(c.direccion ?? "");
    setErrorEdicion(null);
    setErrorGeneral(null);
    setEditarAbierto(true);
  };

  const cerrarModalEditar = () => {
    setEditarAbierto(false);
    setClienteSel(null);
    setErrorEdicion(null);
  };

const handleEditarSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!clienteSel) return;

  const razonTrim = editRazonSocial.trim();
  const rutTrim = editRut.trim();
  const emailTrim = editEmail.trim();
  const telTrim = editTelefono.trim();
  const dirTrim = editDireccion.trim();

  if (!razonTrim || !rutTrim || !dirTrim) {
    setErrorEdicion("Nombre de empresa, RUT y dirección son obligatorios.");
    return;
  }

  if (dirTrim.length < 5) {
  setErrorEdicion("La dirección debe tener al menos 5 caracteres.");
  return;
}

if (dirTrim.length > 50) {
  setErrorEdicion("La dirección no puede superar los 50 caracteres.");
  return;
}


  const rutVal = rutTrim.toUpperCase();

  if (!validarFormatoRut(rutVal)) {
    setErrorEdicion("RUT inválido. Formato válido: 12345678-5");
    return;
  }


  if (emailTrim && !EMAIL_REGEX.test(emailTrim)) {
    setErrorEdicion("Ingresa un correo válido que termine en .com o .cl.");
    return;
  }

  if (telTrim && (telTrim.length < 8 || telTrim.length > 10)) {
    setErrorEdicion(
      "El teléfono debe tener entre 8 y 10 dígitos (solo números)."
    );
    return;
  }

  setGuardandoEdicion(true);
  setErrorEdicion(null);
  setErrorGeneral(null);

  try {
    const res = await fetch("/api/clientes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: clienteSel.id,
        razonSocial: razonTrim,
        rut: rutVal,
        telefono: telTrim === "" ? null : telTrim,
        email: emailTrim === "" ? null : emailTrim,
        direccion: dirTrim,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error || "Error al actualizar cliente");
    }

    cerrarModalEditar();
    router.refresh();
  } catch (err: any) {
    setErrorEdicion(err.message ?? "Error desconocido");
    setErrorGeneral(err.message ?? "Error desconocido");
  } finally {
    setGuardandoEdicion(false);
  }
};


  // -------- ELIMINAR ----------
  const handleEliminar = async (c: ClienteDTO) => {
    const ok = window.confirm(
      `¿Eliminar al cliente "${c.razonSocial}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    setEliminandoId(c.id);
    setErrorGeneral(null);

    try {
      const res = await fetch("/api/clientes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al eliminar cliente");
      }

      router.refresh();
    } catch (err: any) {
      setErrorGeneral(err.message ?? "Error desconocido");
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div className="p-6">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <button
          type="button"
          onClick={abrirModalCrear}
          className="w-40 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap"
        >
          Crear cliente
        </button>

        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded flex-1 min-w-[200px]"
        />
      </div>

      {errorGeneral && (
        <p className="text-sm text-red-600 mb-2">{errorGeneral}</p>
      )}

      <h1 className="text-2xl font-semibold mb-4">Clientes</h1>

      {/* Tabla para escritorio */}
      <div className="overflow-x-auto border rounded hidden md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Razón social</th>
              <th className="px-4 py-2 text-left">RUT</th>
              <th className="px-4 py-2 text-left">Teléfono</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Dirección</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2">{c.id}</td>
                <td className="px-4 py-2">{c.razonSocial}</td>
                <td className="px-4 py-2">{c.rut}</td>
                <td className="px-4 py-2">{c.telefono ?? "-"}</td>
                <td className="px-4 py-2">{c.email ?? "-"}</td>
                <td className="px-4 py-2">{c.direccion ?? "-"}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => abrirModalEditar(c)}
                    className="p-1 text-yellow-500 hover:text-yellow-600 inline-block mr-2"
                    title="Editar cliente"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                      style={{ display: 'inline-block', verticalAlign: 'middle' }}
                    >
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                      <path fillRule="evenodd" d="M4 15a1 1 0 011-1h3l8-8-3-3-8 8v3a1 1 0 01-1 1H4z" clipRule="evenodd"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminar(c)}
                    disabled={eliminandoId === c.id}
                    title="Eliminar cliente"
                    className="text-red-600 hover:scale-110 transition inline-block"
                  >
                    {eliminandoId === c.id ? (
                      "⏳"
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="red"
                        style={{ display: 'inline-block', verticalAlign: 'middle' }}
                      >
                        <path d="M9 3v1H4v2h16V4h-5V3H9zm1 5v10h2V8h-2zm4 0v10h2V8h-2zM5 8v12h14V8H5z" />
                      </svg>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas para móvil */}
      <div className="mobile-cards md:hidden">
        {clientesFiltrados.map((c) => (
          <div key={c.id} className="mobile-card">
            <div className="mobile-card-header">
              {c.razonSocial}
            </div>
            
            <div className="mobile-card-row">
              <span className="mobile-card-label">ID:</span>
              <span className="mobile-card-value">{c.id}</span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">RUT:</span>
              <span className="mobile-card-value">{c.rut}</span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Teléfono:</span>
              <span className="mobile-card-value">{c.telefono ?? "-"}</span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Email:</span>
              <span className="mobile-card-value">{c.email ?? "-"}</span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Dirección:</span>
              <span className="mobile-card-value">{c.direccion ?? "-"}</span>
            </div>

            <div className="mobile-card-actions">
              <button
                type="button"
                onClick={() => abrirModalEditar(c)}
                className="px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                Editar
              </button>

              <button
                type="button"
                onClick={() => handleEliminar(c)}
                disabled={eliminandoId === c.id}
                className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {eliminandoId === c.id ? "..." : "Eliminar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREAR */}
      {crearAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Crear cliente</h2>

            <form onSubmit={handleCrearSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Razón social</label>
                <input
                  type="text"
                  value={nuevoRazonSocial}
                  onChange={(e) => setNuevoRazonSocial(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">RUT</label>
                  <input
                    type="text"
                    value={nuevoRut}
                    onChange={(e) => {
                      let v = e.target.value
                        .replace(/\./g, "")           // quitar puntos
                        .replace(/[^0-9kK-]/g, "");   // solo números, K/k y guion

                      const partes = v.split("-");

                      // máximo 2 partes (cuerpo-DV)
                      if (partes.length > 2) {
                        v = partes[0] + "-" + partes[1];
                      }

                      // limitar cuerpo a máximo 8 dígitos
                      if (partes[0].length > 8) {
                        partes[0] = partes[0].slice(0, 8);
                        v = partes.join("-");
                      }

                      // limitar DV a 1 carácter
                      if (partes[1] && partes[1].length > 1) {
                        partes[1] = partes[1].slice(0, 1);
                        v = partes.join("-");
                      }

                      setNuevoRut(v);
                    }}
                    className="w-full border rounded px-3 py-2"
                    placeholder="12345678-5"
                  />
              </div>

              <div>
                <label className="block text-sm mb-1">Teléfono (opcional)</label>
                    <input
                    type="text"
                    value={nuevoTelefono}
                    onChange={(e) => {
                        const soloNumeros = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setNuevoTelefono(soloNumeros);
                    }}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Ej: 987654321 o 712345678"
                    />
              </div>

              <div>
                <label className="block text-sm mb-1">Email (opcional)</label>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Dirección</label>
                <input
                  type="text"
                  value={nuevoDireccion}
                  onChange={(e) => setNuevoDireccion(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cerrarModalCrear}
                  className="px-4 py-2 border rounded"
                  disabled={guardandoCreacion}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                  disabled={guardandoCreacion}
                >
                  {guardandoCreacion ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {editarAbierto && clienteSel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Editar cliente {clienteSel.razonSocial}
            </h2>

            <form onSubmit={handleEditarSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Razón social</label>
                <input
                  type="text"
                  value={editRazonSocial}
                  onChange={(e) => setEditRazonSocial(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">RUT</label>
                  <input
                    type="text"
                    value={editRut}
                    onChange={(e) => {
                      let v = e.target.value
                        .replace(/\./g, "")
                        .replace(/[^0-9kK-]/g, "");

                      const partes = v.split("-");

                      if (partes.length > 2) {
                        v = partes[0] + "-" + partes[1];
                      }

                      if (partes[0].length > 8) {
                        partes[0] = partes[0].slice(0, 8);
                        v = partes.join("-");
                      }

                      if (partes[1] && partes[1].length > 1) {
                        partes[1] = partes[1].slice(0, 1);
                        v = partes.join("-");
                      }

                      setEditRut(v);
                    }}
                    className="w-full border rounded px-3 py-2"
                    placeholder="12345678-5"
                  />
              </div>

              <div>
                <label className="block text-sm mb-1">Teléfono (opcional)</label>
                    <input
                    type="text"
                    value={editTelefono}
                    onChange={(e) => {
                        const soloNumeros = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setEditTelefono(soloNumeros);
                    }}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Ej: 987654321 o 712345678"
                    />
              </div>

              <div>
                <label className="block text-sm mb-1">Email (opcional)</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={editDireccion}
                  onChange={(e) => setEditDireccion(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {errorEdicion && (
                <p className="text-sm text-red-600">{errorEdicion}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cerrarModalEditar}
                  className="px-4 py-2 border rounded"
                  disabled={guardandoEdicion}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                  disabled={guardandoEdicion}
                >
                  {guardandoEdicion ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
