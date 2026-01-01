/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRefresh } from "@/lib/useRefresh";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.(com|cl)$/i;
const NOMBRE_REGEX = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]*$/; // Solo letras y espacios

type UsuarioDTO = {
  id: number;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  activo: boolean;
  roles: string[];
};

type CampoEditable = "email" | "telefono";

interface Props {
  usuarios: UsuarioDTO[];
  esJefe?: boolean;
  esAdmin?: boolean;
}

export default function UsuariosClient({ usuarios, esJefe = false, esAdmin = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-refresh cada 10 segundos para ver cambios de otros usuarios
  useRefresh(10);

  // Abrir modal si viene ?crear=true
  useEffect(() => {
    const crear = searchParams?.get("crear");
    if (crear === "true" && (esJefe || esAdmin)) {
      abrirModalCrear();
      router.replace("/usuarios", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // EDITAR
  const [abierto, setAbierto] = useState(false);
  const [campo, setCampo] = useState<CampoEditable>("email");
  const [valor, setValor] = useState("");
  const [usuarioSel, setUsuarioSel] = useState<UsuarioDTO | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargandoActivoId, setCargandoActivoId] = useState<number | null>(null);

  // BUSCAR
  const [search, setSearch] = useState("");

  // CREAR
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoApellido, setNuevoApellido] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");
  const [nuevoRol, setNuevoRol] = useState("");
  const [nuevoActivo, setNuevoActivo] = useState(true);
  const [errorCreacion, setErrorCreacion] = useState<string | null>(null);
  const [guardandoCreacion, setGuardandoCreacion] = useState(false);

  // ELIMINAR
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  // RESET PASSWORD
  const [resetAbierto, setResetAbierto] = useState(false);
  const [usuarioResetSel, setUsuarioResetSel] = useState<UsuarioDTO | null>(null);
  const [guardandoReset, setGuardandoReset] = useState(false);
  const [errorReset, setErrorReset] = useState<string | null>(null);

  // FILTROS
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [filtroRol, setFiltroRol] = useState<string>("");
  const [filtroActivo, setFiltroActivo] = useState<"todos" | "activos" | "inactivos">("todos");

  // ---------- MODAL EDITAR ----------
const abrirModal = (usuario: UsuarioDTO, campo: CampoEditable) => {
  setUsuarioSel(usuario);
  setCampo(campo);

  if (campo === "email") {
    setValor(usuario.email ?? "");
  } else {
    // Teléfono: si viene como 9XXXXXXXX, dejamos solo los 8 dígitos
    const tel = usuario.telefono ?? "";
    if (tel.startsWith("9") && tel.length === 9) {
      setValor(tel.slice(1)); // guardamos solo 8 dígitos en el estado
    } else {
      setValor(tel);
    }
  }

  setError(null);
  setAbierto(true);
};


  const cerrarModal = () => {
    setAbierto(false);
    setUsuarioSel(null);
    setError(null);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!usuarioSel) return;
  

  setGuardando(true);
  setError(null);

  try {
    let body: any;

    if (campo === "email") {
      const emailTrim = valor.trim();

      if (!emailTrim) {
        throw new Error("El correo no puede estar vacío.");
      }

      if (!EMAIL_REGEX.test(emailTrim)) {
        throw new Error("Ingresa un correo válido que termine en .com o .cl.");
      }

      body = { id: usuarioSel.id, email: emailTrim };
    } else {
      // Teléfono
      const tel = valor.trim();

      if (tel === "") {
        // dejamos teléfono en null
        body = { id: usuarioSel.id, telefono: null };
      } else {
        // Solo 8 dígitos
        const soloNumeros = tel.replace(/\D/g, "");
        if (soloNumeros.length !== 8) {
          throw new Error(
            "El teléfono debe tener exactamente 8 dígitos (se guardará como 9XXXXXXXX)."
          );
        }
        body = { id: usuarioSel.id, telefono: `9${soloNumeros}` };
      }
    }

    const res = await fetch("/api/usuarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error || "Error al actualizar usuario");
    }

    cerrarModal();
    router.refresh();
  } catch (err: any) {
    setError(err.message ?? "Error desconocido");
  } finally {
    setGuardando(false);
  }
};


  const toggleActivo = async (u: UsuarioDTO) => {
    setCargandoActivoId(u.id);
    setError(null);
    setErrorGeneral(null);

    try {
      const res = await fetch("/api/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: u.id,
          activo: !u.activo,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al cambiar estado");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Error desconocido");
      setErrorGeneral(err.message ?? "Error desconocido");
    } finally {
      setCargandoActivoId(null);
    }
  };

  // ---------- MODAL CREAR ----------
  const abrirModalCrear = () => {
    setNuevoNombre("");
    setNuevoApellido("");
    setNuevoEmail("");
    setNuevoTelefono("");
    setNuevoRol("");
    setNuevoActivo(true);
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

    const nombreTrim = nuevoNombre.trim();
    const apellidoTrim = nuevoApellido.trim();
    const emailTrim = nuevoEmail.trim();
    const rolTrim = nuevoRol.trim();

    if (!nombreTrim || !apellidoTrim || !emailTrim || !rolTrim) {
      setErrorCreacion(
        "Nombre, apellido, email y rol son obligatorios."
      );
      return;
    }

    if (!NOMBRE_REGEX.test(nombreTrim)) {
      setErrorCreacion("El nombre solo debe contener letras y espacios.");
      return;
    }

    if (!NOMBRE_REGEX.test(apellidoTrim)) {
      setErrorCreacion("El apellido solo debe contener letras y espacios.");
      return;
    }

    if (!EMAIL_REGEX.test(emailTrim)) {
      setErrorCreacion("Ingresa un correo válido que termine en .com o .cl.");
      return;
    }

    if (nuevoTelefono !== "" && nuevoTelefono.length !== 8) {
      setErrorCreacion(
        "El teléfono debe tener exactamente 8 dígitos (se guardará como 9XXXXXXXX)."
      );
      return;
    }

    setGuardandoCreacion(true);
    setErrorCreacion(null);
    setErrorGeneral(null);

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreTrim,
          apellido: apellidoTrim,
          email: emailTrim,
          telefono: nuevoTelefono === "" ? null : `9${nuevoTelefono}`,
          rol: rolTrim,
          activo: nuevoActivo,
          password: null, // Se genera automáticamente en servidor
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al crear usuario");
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

  // ---------- RESET PASSWORD ----------
  const abrirModalReset = (u: UsuarioDTO) => {
    setUsuarioResetSel(u);
    setErrorReset(null);
    setResetAbierto(true);
  };

  const cerrarModalReset = () => {
    setResetAbierto(false);
    setUsuarioResetSel(null);
    setErrorReset(null);
  };

  const handleResetPassword = async () => {
    if (!usuarioResetSel) return;

    const ok = window.confirm(
      `¿Reestablecer contraseña de ${usuarioResetSel.nombre} ${usuarioResetSel.apellido}? Se establecerá la contraseña base y deberá cambiarla en el próximo login.`
    );
    if (!ok) return;

    setGuardandoReset(true);
    setErrorReset(null);

    try {
      const res = await fetch("/api/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: usuarioResetSel.id, action: "reset-password" }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al reestablecer contraseña");
      }

      cerrarModalReset();
      router.refresh();
    } catch (err: any) {
      setErrorReset(err.message ?? "Error desconocido");
    } finally {
      setGuardandoReset(false);
    }
  };

  // ---------- ELIMINAR ----------
  const handleEliminar = async (u: UsuarioDTO) => {
    const ok = window.confirm(
      `¿Eliminar al usuario ${u.nombre} ${u.apellido}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    setEliminandoId(u.id);
    setErrorGeneral(null);

    try {
      const res = await fetch("/api/usuarios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al eliminar usuario");
      }

      router.refresh();
    } catch (err: any) {
      setErrorGeneral(err.message ?? "Error desconocido");
    } finally {
      setEliminandoId(null);
    }
  };

  // ---------- FILTRO EN CLIENTE (search + rol + activo) ----------
  const usuariosFiltrados = usuarios.filter((u) => {
    const t = search.toLowerCase().trim();

    if (t) {
      const coincideTexto =
        u.nombre.toLowerCase().includes(t) ||
        u.apellido.toLowerCase().includes(t) ||
        (u.email ?? "").toLowerCase().includes(t) ||
        (u.telefono ?? "").toLowerCase().includes(t) ||
        u.roles.join(" ").toLowerCase().includes(t);

      if (!coincideTexto) return false;
    }

    if (filtroRol && !u.roles.includes(filtroRol)) {
      return false;
    }

    if (filtroActivo === "activos" && !u.activo) return false;
    if (filtroActivo === "inactivos" && u.activo) return false;

    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <button
          type="button"
          onClick={abrirModalCrear}
          className="w-40 px-4 py-2 rounded bg-blue-600 text-white whitespace-nowrap hover:bg-blue-700"
        >
          Añadir usuario
        </button>

        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded flex-1 min-w-[200px]"
        />

        <button
          type="button"
          onClick={() => setFiltrosAbiertos(true)}
          className="w-32 px-4 py-2 rounded bg-gray-600 text-white whitespace-nowrap hover:bg-gray-700"
        >
          Filtrar
        </button>
      </div>

      {/* Drawer de filtros */}
      {filtrosAbiertos && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
            onClick={() => setFiltrosAbiertos(false)}
          />
          
          <div
            className="fixed top-0 right-0 h-full w-80 z-50 shadow-2xl transform translate-x-0 transition-transform duration-300 ease-out animate-slideInRight"
            style={{ background: 'linear-gradient(135deg, #0024FF 0%, #0017b3 100%)' }}
          >
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-white">Filtros</h2>
                <button onClick={() => setFiltrosAbiertos(false)} className="text-white hover:text-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 text-white font-medium">Rol</label>
                  <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} className="w-full border rounded px-3 py-2 bg-white text-gray-900">
                    <option value="">Todos</option>
                    <option value="Jefe">Jefe</option>
                    <option value="Tecnico">Técnico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-white font-medium">Estado</label>
                  <select value={filtroActivo} onChange={(e) => setFiltroActivo(e.target.value as "todos" | "activos" | "inactivos")} className="w-full border rounded px-3 py-2 bg-white text-gray-900">
                    <option value="todos">Todos</option>
                    <option value="activos">Activos</option>
                    <option value="inactivos">Inactivos</option>
                  </select>
                </div>

                <div className="pt-6 border-t border-white/20 space-y-3">
                  <button type="button" onClick={() => { setFiltroRol(""); setFiltroActivo("todos"); }} className="w-full px-4 py-2 bg-white/20 text-white rounded hover:bg-white/30">
                    Limpiar filtros
                  </button>
                  <button type="button" onClick={() => setFiltrosAbiertos(false)} className="w-full px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100 font-medium">
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {errorGeneral && (
        <p className="text-sm text-red-600 mb-2">{errorGeneral}</p>
      )}

      <h1 className="text-2xl font-semibold mb-4">Usuarios</h1>

      {/* Tabla para escritorio */}
      <div className="overflow-x-auto border rounded hidden md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Teléfono</th>
              <th className="px-4 py-2 text-left">Rol(es)</th>
              <th className="px-4 py-2 text-left">Activo</th>
              {(esJefe || esAdmin) && (
                <th className="px-4 py-2 text-center">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.id}</td>
                <td className="px-4 py-2">
                  {u.nombre} {u.apellido}
                </td>

                {/* EMAIL */}
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span>{u.email ?? "-"}</span>
                    <button
                      type="button"
                      onClick={() => abrirModal(u, "email")}
                      className="p-1 text-yellow-500 hover:text-yellow-600"
                      title="Editar correo"
                    >
                   <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                        <path fillRule="evenodd" d="M4 15a1 1 0 011-1h3l8-8-3-3-8 8v3a1 1 0 01-1 1H4z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </td>

                {/* TELÉFONO */}
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span>{u.telefono ?? "-"}</span>
                    <button
                      type="button"
                      onClick={() => abrirModal(u, "telefono")}
                      className="p-1 text-yellow-500 hover:text-yellow-600"
                      title="Editar teléfono"
                    >
                                          <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                        <path fillRule="evenodd" d="M4 15a1 1 0 011-1h3l8-8-3-3-8 8v3a1 1 0 01-1 1H4z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </td>

                {/* ROLES */}
                <td className="px-4 py-2">
                  {u.roles.length > 0 ? u.roles.join(", ") : "-"}
                </td>

                {/* ACTIVO */}
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => toggleActivo(u)}
                    disabled={cargandoActivoId === u.id}
                    className="text-xl"
                    title={u.activo ? "Desactivar" : "Activar"}
                  >
                    {cargandoActivoId === u.id
                      ? "…"
                      : u.activo
                      ? "✅"
                      : "❌"}
                  </button>
                </td>

                {(esJefe || esAdmin) && (
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => abrirModalReset(u)}
                      title="Reestablecer contraseña"
                      className="text-sm px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-medium mr-2"
                    >
                      Resetear
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(u)}
                      disabled={eliminandoId === u.id}
                      title="Eliminar usuario"
                      className="hover:scale-110 transition cursor-pointer inline-block"
                    >
                      {eliminandoId === u.id ? (
                        "⏳"
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="red"
                          style={{ display: 'inline-block', verticalAlign: 'middle' }}
                        >
                          <path d="M9 3v1H4v2h16V4h-5V3H9zm1 5v10h2V8h-2zm4 0v10h2V8h-2zM5 8v12h14V8H5z" />
                        </svg>
                      )}
                    </button>
                  </td>
                )}

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas para móvil */}
      <div className="mobile-cards md:hidden">
        {usuariosFiltrados.map((u) => (
          <div key={u.id} className="mobile-card">
            <div className="mobile-card-header">
              {u.nombre} {u.apellido}
            </div>
            
            <div className="mobile-card-row">
              <span className="mobile-card-label">ID:</span>
              <span className="mobile-card-value">{u.id}</span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Email:</span>
              <span className="mobile-card-value">
                {u.email ?? "-"}
                <button
                  type="button"
                  onClick={() => abrirModal(u, "email")}
                  className="ml-2 text-yellow-600 hover:text-yellow-700"
                  title="Editar correo"
                >
                  ✏️
                </button>
              </span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Teléfono:</span>
              <span className="mobile-card-value">
                {u.telefono ?? "-"}
                <button
                  type="button"
                  onClick={() => abrirModal(u, "telefono")}
                  className="ml-2 text-yellow-600 hover:text-yellow-700"
                  title="Editar teléfono"
                >
                  ✏️
                </button>
              </span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Roles:</span>
              <span className="mobile-card-value">
                {u.roles.length > 0 ? u.roles.join(", ") : "-"}
              </span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Estado:</span>
              <span className="mobile-card-value">
                <button
                  type="button"
                  onClick={() => toggleActivo(u)}
                  disabled={cargandoActivoId === u.id}
                  className="text-xl"
                  title={u.activo ? "Desactivar" : "Activar"}
                >
                  {cargandoActivoId === u.id ? "…" : u.activo ? "✅" : "❌"}
                </button>
              </span>
            </div>

            {(esJefe || esAdmin) && (
              <div className="mobile-card-actions">
                <button
                  type="button"
                  onClick={() => abrirModalReset(u)}
                  className="px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                >
                  Resetear
                </button>

                <button
                  type="button"
                  onClick={() => handleEliminar(u)}
                  disabled={eliminandoId === u.id}
                  className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {eliminandoId === u.id ? "..." : "Eliminar"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL EDITAR */}
      {abierto && usuarioSel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Editar {campo === "email" ? "correo" : "teléfono"} de{" "}
              {usuarioSel.nombre} {usuarioSel.apellido}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">
                  {campo === "email" ? "Correo electrónico" : "Teléfono"}
                </label>
{campo === "email" ? (
  <input
    type="email"
    value={valor}
    onChange={(e) => setValor(e.target.value)}
    className="w-full border rounded px-3 py-2"
  />
) : (
  <>
    <div className="flex items-center">
      <span className="px-3 py-2 border border-r-0 rounded-l bg-gray-100">
        9
      </span>
      <input
        type="tel"
        inputMode="numeric"
        value={valor}
        onChange={(e) => {
          const soloNumeros = e.target.value.replace(/\D/g, "").slice(0, 8);
          setValor(soloNumeros);
        }}
        className="w-full border border-l-0 rounded-r px-3 py-2"
        placeholder="12345678"
      />
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Solo números, 8 dígitos. Se guardará como 9XXXXXXXX.
    </p>
  </>
)}

              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 border rounded"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR */}
      {crearAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Crear usuario</h2>

            <form onSubmit={handleCrearSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (NOMBRE_REGEX.test(valor) || valor === "") {
                      setNuevoNombre(valor);
                    }
                  }}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Apellido</label>
                <input
                  type="text"
                  value={nuevoApellido}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (NOMBRE_REGEX.test(valor) || valor === "") {
                      setNuevoApellido(valor);
                    }
                  }}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Teléfono (opcional)
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 border border-r-0 rounded-l bg-gray-100">
                    9
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={nuevoTelefono}
                    onChange={(e) => {
                      const soloNumeros = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 8);
                      setNuevoTelefono(soloNumeros);
                    }}
                    className="w-full border border-l-0 rounded-r px-3 py-2"
                    placeholder="12345678"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Solo números, 8 dígitos. Se guardará como 9XXXXXXXX.
                </p>
              </div>

              <div>
                <label className="block text-sm mb-1">Rol</label>
                <select
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Selecciona un rol...</option>
                  <option value="Jefe">Jefe</option>
                  <option value="Tecnico">Tecnico</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="nuevo-activo"
                  type="checkbox"
                  checked={nuevoActivo}
                  onChange={(e) => setNuevoActivo(e.target.checked)}
                />
                <label htmlFor="nuevo-activo" className="text-sm">
                  Usuario activo
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-700">
                  <strong>Contraseña generada automáticamente:</strong> nombre + 12345 (en minúscula).
                </p>
              </div>

              {errorCreacion && (
                <p className="text-sm text-red-600">{errorCreacion}</p>
              )}

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

      {/* MODAL RESET PASSWORD */}
      {resetAbierto && usuarioResetSel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold mb-4">Reestablecer contraseña</h2>
            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de que deseas reestablecer la contraseña de {usuarioResetSel.nombre} {usuarioResetSel.apellido}?
            </p>
            <p className="text-xs text-gray-500 mb-4 bg-yellow-50 p-2 rounded border border-yellow-200">
              La contraseña será restablecida a la contraseña base (nombre + 12345) y <strong>primer_login</strong> se activará. El usuario deberá cambiarla en el próximo login.
            </p>

            {errorReset && (
              <p className="text-sm text-red-600 mb-4">{errorReset}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cerrarModalReset}
                className="px-4 py-2 border rounded"
                disabled={guardandoReset}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                className="px-4 py-2 rounded bg-orange-600 text-white"
                disabled={guardandoReset}
              >
                {guardandoReset ? "Restableciendo..." : "Reestablecer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
