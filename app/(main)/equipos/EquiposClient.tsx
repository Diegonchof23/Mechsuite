/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRefresh } from "@/lib/useRefresh";

type ClienteDTO = {
  id: number;
  razonSocial: string;
};

type EvidenciaDTO = {
  id: number;
  tipo: string;
  urlArchivo: string;
  descripcion: string | null;
  fechaHora: string;
};

type OrdenTrabajoDTO = {
  id: number;
  tipoOt: string;
  estado: string;
  descripcionSintoma: string | null;
  trabajoRealizado: string | null;
  fechaCreacion: string;
  fechaCierre: string | null;
  tecnicoNombre: string | null;
  evidencias: EvidenciaDTO[];
};

type EquipoDTO = {
  id: number;
  idCliente: number;
  modelo: string;
  lineaProceso: string;
  estadoOperativo: boolean;
  fechaInstalacion: string | null;
  proximaMantencion: string | null;
  clienteNombre?: string;
  ordenesMantenimiento?: OrdenTrabajoDTO[];
};

// Helper para manejar fechas sin offset de zona horaria
const parseFechaISO = (isoStr: string | null): string => {
  if (!isoStr) return "";
  // isoStr es "YYYY-MM-DD", lo usamos directo
  return isoStr;
};

// Helper para formatear fecha YYYY-MM-DD a formato local sin problemas de zona horaria
const formatearFecha = (fechaStr: string | null): string => {
  if (!fechaStr) return "-";
  // fechaStr viene como "YYYY-MM-DD"
  const [year, month, day] = fechaStr.split('-');
  return `${day}-${month}-${year}`;
};

interface Props {
  equipos: EquipoDTO[];
  clientes: ClienteDTO[];
  esJefe?: boolean;
  esAdmin?: boolean;
}

export default function EquiposClient({ equipos, clientes, esJefe = false, esAdmin = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-refresh cada 10 segundos para ver cambios de otros usuarios
  useRefresh(10);

  // BÚSQUEDA - Inicializar desde URL si existe
  const [search, setSearch] = useState(searchParams.get('search') || "");

  // CREAR
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [nuevoIdCliente, setNuevoIdCliente] = useState("");
  const [nuevoModelo, setNuevoModelo] = useState("");
  const [nuevoLineaProceso, setNuevoLineaProceso] = useState("");
  const [nuevoEstadoOperativo, setNuevoEstadoOperativo] = useState(true);
  const [nuevoFechaInstalacion, setNuevoFechaInstalacion] = useState("");
  const [nuevoProximaMantencion, setNuevoProximaMantencion] = useState("");
  const [guardandoCreacion, setGuardandoCreacion] = useState(false);
  const [errorCreacion, setErrorCreacion] = useState<string | null>(null);

  // EDITAR
  const [editarAbierto, setEditarAbierto] = useState(false);
  const [equipoSel, setEquipoSel] = useState<EquipoDTO | null>(null);
  const [editModelo, setEditModelo] = useState("");
  const [editLineaProceso, setEditLineaProceso] = useState("");
  const [editEstadoOperativo, setEditEstadoOperativo] = useState(true);
  const [editFechaInstalacion, setEditFechaInstalacion] = useState("");
  const [editProximaMantencion, setEditProximaMantencion] = useState("");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);

  // ELIMINAR
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  // HISTORIAL
  const [historialesAbierto, setHistorialesAbierto] = useState(false);
  const [historialEquipo, setHistorialEquipo] = useState<EquipoDTO | null>(null);

  // QR
  const [qrAbierto, setQrAbierto] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [qrEquipo, setQrEquipo] = useState<EquipoDTO | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrGenerating, setQrGenerating] = useState(false);

  // FILTROS
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "operativos" | "no-operativos">("todos");

  // ---------- FILTRADO ----------
  const equiposFiltrados = equipos.filter((e) => {
    const t = search.toLowerCase().trim();

    if (t) {
      // Crear texto combinado del equipo para buscar
      const textoCombinado = [
        e.modelo,
        e.lineaProceso,
        e.clienteNombre ?? ""
      ].join(' ').toLowerCase();

      // Dividir búsqueda en palabras y verificar que todas coincidan
      const palabras = t.split(/\s+/).filter(p => p.length > 0);
      const todasCoinciden = palabras.every(palabra => 
        textoCombinado.includes(palabra)
      );

      if (!todasCoinciden) return false;
    }

    if (filtroCliente && e.idCliente !== Number(filtroCliente)) {
      return false;
    }

    if (filtroEstado === "operativos" && !e.estadoOperativo) return false;
    if (filtroEstado === "no-operativos" && e.estadoOperativo) return false;

    return true;
  });

  // Initialize search from query param (so QR links with ?search=<id> will prefilter)
  useEffect(() => {
    try {
      const s = searchParams?.get("search") ?? "";
      // Actualizar búsqueda desde URL o limpiar si no hay parámetro
      setSearch(s);

      const open = searchParams?.get("openHistorial");
      if (open) {
        const idNum = Number(open);
        if (!Number.isNaN(idNum)) {
          const equipo = equipos.find((it) => it.id === idNum) ?? null;
          if (equipo) {
            // open modal with that equipo
            abrirModalHistorial(equipo);
            // Limpiar query param después de abrir
            router.replace("/equipos", { scroll: false });
          }
        }
      }

      // Abrir modal de creación si viene ?crear=true
      const crear = searchParams?.get("crear");
      if (crear === "true") {
        abrirModalCrear();
        // Limpiar query param después de abrir
        router.replace("/equipos", { scroll: false });
      }
    } catch (err) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Generate QR data URL client-side using dynamic import of `qrcode` when qrUrl changes
  useEffect(() => {
    let mounted = true;
    if (!qrUrl) {
      setQrDataUrl("");
      setQrGenerating(false);
      return;
    }

    setQrGenerating(true);

    (async () => {
      try {
        const QR = await import('qrcode');
        const dataUrl: string = await QR.toDataURL(qrUrl, { width: 300 });
        if (mounted) setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Error generando QR en cliente', err);
        if (mounted) setQrDataUrl("");
      } finally {
        if (mounted) setQrGenerating(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [qrUrl]);

  // ---------- CREAR ----------
  const abrirModalCrear = () => {
    if (!esJefe && !esAdmin) {
      alert("No tienes permiso para crear equipos");
      return;
    }
    setNuevoIdCliente("");
    setNuevoModelo("");
    setNuevoLineaProceso("");
    setNuevoEstadoOperativo(true);
    setNuevoFechaInstalacion("");
    setNuevoProximaMantencion("");
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

    const idClienteTrim = nuevoIdCliente.trim();
    const modeloTrim = nuevoModelo.trim();
    const lineaTrim = nuevoLineaProceso.trim();

    if (!idClienteTrim || !modeloTrim || !lineaTrim) {
      setErrorCreacion("Cliente, modelo y línea de proceso son obligatorios.");
      return;
    }

    setGuardandoCreacion(true);
    setErrorCreacion(null);
    setErrorGeneral(null);

    try {
      const res = await fetch("/api/equipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idCliente: Number(idClienteTrim),
          modelo: modeloTrim,
          lineaProceso: lineaTrim,
          estadoOperativo: nuevoEstadoOperativo,
          fechaInstalacion: nuevoFechaInstalacion || null,
          proximaMantencion: nuevoProximaMantencion || null,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al crear equipo");
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

  // ---------- EDITAR ----------
  const abrirModalEditar = (e: EquipoDTO) => {
    setEquipoSel(e);
    setEditModelo(e.modelo);
    setEditLineaProceso(e.lineaProceso);
    setEditEstadoOperativo(e.estadoOperativo);
    setEditFechaInstalacion(parseFechaISO(e.fechaInstalacion));
    setEditProximaMantencion(parseFechaISO(e.proximaMantencion));
    setErrorEdicion(null);
    setErrorGeneral(null);
    setEditarAbierto(true);
  };

  const cerrarModalEditar = () => {
    setEditarAbierto(false);
    setEquipoSel(null);
    setErrorEdicion(null);
  };

  const handleEditarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipoSel) return;

    const modeloTrim = editModelo.trim();
    const lineaTrim = editLineaProceso.trim();

    if (!modeloTrim || !lineaTrim) {
      setErrorEdicion("Modelo y línea de proceso son obligatorios.");
      return;
    }

    setGuardandoEdicion(true);
    setErrorEdicion(null);
    setErrorGeneral(null);

    try {
      const res = await fetch("/api/equipos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: equipoSel.id,
          modelo: modeloTrim,
          lineaProceso: lineaTrim,
          estadoOperativo: editEstadoOperativo,
          fechaInstalacion: editFechaInstalacion || null,
          proximaMantencion: editProximaMantencion || null,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al actualizar equipo");
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

  // ---------- ELIMINAR ----------
  const handleEliminar = async (e: EquipoDTO) => {
    const ok = window.confirm(
      `¿Eliminar equipo "${e.modelo}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    setEliminandoId(e.id);
    setErrorGeneral(null);

    try {
      const res = await fetch("/api/equipos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: e.id }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al eliminar equipo");
      }

      router.refresh();
    } catch (err: any) {
      setErrorGeneral(err.message ?? "Error desconocido");
    } finally {
      setEliminandoId(null);
    }
  };

  // ---------- HISTORIAL ----------
  const abrirModalHistorial = (e: EquipoDTO) => {
    setHistorialEquipo(e);
    setHistorialesAbierto(true);
  };

  const cerrarModalHistorial = () => {
    setHistorialesAbierto(false);
    setHistorialEquipo(null);
  };

  // Simulamos historial de mantenciones (en futuro vendrá de OrdenesTrabajo)
  const generarHistorialMock = (equipoId: number) => {
    // Buscamos el equipo en la lista
    const equipo = equipos.find((e) => e.id === equipoId);
    if (!equipo || !equipo.ordenesMantenimiento) {
      return [];
    }

    // Mostramos todas las OT asociadas (sin filtrar por tipo), ordenadas por fecha
    return equipo.ordenesMantenimiento
      .map((o) => ({
        id: o.id,
        fecha: o.fechaCreacion.split("T")[0],
        tipo: o.tipoOt,
        descripcion: o.trabajoRealizado || o.descripcionSintoma || "Sin descripción",
        técnico: o.tecnicoNombre || "Técnico no asignado",
        evidencias: o.evidencias,
      }))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  };

  return (
    <div className="p-6">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        {(esJefe || esAdmin) && (
          <button
            type="button"
            onClick={abrirModalCrear}
            className="w-40 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap"
          >
            Añadir equipo
          </button>
        )}

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
          className="w-32 px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
        >
          Filtrar
        </button>
      </div>

      {/* Drawer de filtros (derecha a izquierda) */}
      {filtrosAbiertos && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
            onClick={() => setFiltrosAbiertos(false)}
          />
          
          {/* Drawer */}
          <div
            className="fixed top-0 right-0 h-full w-80 z-50 shadow-2xl transform translate-x-0 transition-transform duration-300 ease-out animate-slideInRight"
            style={{
              background: 'linear-gradient(135deg, #0024FF 0%, #0017b3 100%)',
            }}
          >
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-white">Filtros</h2>
                <button
                  onClick={() => setFiltrosAbiertos(false)}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 text-white font-medium">Cliente</label>
                  <select
                    value={filtroCliente}
                    onChange={(e) => setFiltroCliente(e.target.value)}
                    className="w-full border rounded px-3 py-2 bg-white text-gray-900"
                  >
                    <option value="">Todos</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.razonSocial}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-white font-medium">Estado</label>
                  <select
                    value={filtroEstado}
                    onChange={(e) =>
                      setFiltroEstado(e.target.value as "todos" | "operativos" | "no-operativos")
                    }
                    className="w-full border rounded px-3 py-2 bg-white text-gray-900"
                  >
                    <option value="todos">Todos</option>
                    <option value="operativos">Operativos</option>
                    <option value="no-operativos">No operativos</option>
                  </select>
                </div>

                <div className="pt-6 border-t border-white/20 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroCliente("");
                      setFiltroEstado("todos");
                    }}
                    className="w-full px-4 py-2 bg-white/20 text-white rounded hover:bg-white/30 transition-colors"
                  >
                    Limpiar filtros
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltrosAbiertos(false)}
                    className="w-full px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100 transition-colors font-medium"
                  >
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

      <h1 className="text-2xl font-semibold mb-4">Equipos</h1>

      {/* Tabla para escritorio */}
      <div className="overflow-x-auto border rounded hidden md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Modelo</th>
              <th className="px-4 py-2 text-left">Línea de proceso</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Instalación</th>
              <th className="px-4 py-2 text-left">Próxima mantención</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {equiposFiltrados.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="px-4 py-2">{e.id}</td>
                <td className="px-4 py-2">{e.clienteNombre ?? "-"}</td>
                <td className="px-4 py-2">{e.modelo}</td>
                <td className="px-4 py-2">{e.lineaProceso}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    e.estadoOperativo
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {e.estadoOperativo ? "Operativo" : "No operativo"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {formatearFecha(e.fechaInstalacion)}
                </td>
                <td className="px-4 py-2">
                  {formatearFecha(e.proximaMantencion)}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // prepare QR pointing to the equipos listing but opening the historial modal
                      const origin = typeof window !== "undefined" ? window.location.origin : "";
                      const url = `${origin}/equipos?openHistorial=${e.id}`;
                      setQrUrl(url);
                      setQrEquipo(e);
                      setQrAbierto(true);
                    }}
                    title="Generar QR"
                    className="p-1 text-green-600 hover:text-green-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M3 3h6v6H3zM5 5v2h2V5H5z" />
                      <path d="M15 3h6v6h-6zM17 5v2h2V5h-2z" />
                      <path d="M3 15h6v6H3zM5 17v2h2v-2H5z" />
                      <path d="M13 13h8v8h-8zM15 15v4h4v-4h-4z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => abrirModalHistorial(e)}
                    className="p-1 text-blue-500 hover:text-blue-600"
                    title="Ver historial"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {(esJefe || esAdmin) && (
                    <button
                      type="button"
                      onClick={() => abrirModalEditar(e)}
                      className="p-1 text-yellow-500 hover:text-yellow-600"
                      title="Editar equipo"
                    >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path
                        fillRule="evenodd"
                        d="M4 15a1 1 0 011-1h3l8-8-3-3-8 8v3a1 1 0 01-1 1H4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    </button>
                  )}

                  {(esJefe || esAdmin) && (
                    <button
                      type="button"
                      onClick={() => handleEliminar(e)}
                      disabled={eliminandoId === e.id}
                      title="Eliminar equipo"
                      className="text-red-600 hover:scale-110 transition"
                    >
                    {eliminandoId === e.id ? (
                      "⏳"
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="red"
                      >
                        <path d="M9 3v1H4v2h16V4h-5V3H9zm1 5v10h2V8h-2zm4 0v10h2V8h-2zM5 8v12h14V8H5z" />
                      </svg>
                    )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas para móvil */}
      <div className="mobile-cards md:hidden">
        {equiposFiltrados.map((e) => (
          <div key={e.id} className="mobile-card">
            <div className="mobile-card-header">
              {e.modelo}
            </div>
            
            <div className="mobile-card-row">
              <span className="mobile-card-label">ID:</span>
              <span className="mobile-card-value">{e.id}</span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Cliente:</span>
              <span className="mobile-card-value">{e.clienteNombre ?? "-"}</span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Línea:</span>
              <span className="mobile-card-value">{e.lineaProceso}</span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Estado:</span>
              <span className="mobile-card-value">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  e.estadoOperativo
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {e.estadoOperativo ? "Operativo" : "No operativo"}
                </span>
              </span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Instalación:</span>
              <span className="mobile-card-value">{formatearFecha(e.fechaInstalacion)}</span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Mantención:</span>
              <span className="mobile-card-value">{formatearFecha(e.proximaMantencion)}</span>
            </div>

            <div className="mobile-card-actions">
              <button
                type="button"
                onClick={() => {
                  const origin = typeof window !== "undefined" ? window.location.origin : "";
                  const url = `${origin}/equipos?openHistorial=${e.id}`;
                  setQrUrl(url);
                  setQrEquipo(e);
                  setQrAbierto(true);
                }}
                className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                QR
              </button>

              <button
                type="button"
                onClick={() => abrirModalHistorial(e)}
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Ver Historial
              </button>

              {(esJefe || esAdmin) && (
                <>
                  <button
                    type="button"
                    onClick={() => abrirModalEditar(e)}
                    className="px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEliminar(e)}
                    disabled={eliminandoId === e.id}
                    className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    {eliminandoId === e.id ? "..." : "Eliminar"}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREAR */}
      {crearAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Crear equipo</h2>

            <form onSubmit={handleCrearSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Cliente</label>
                <select
                  value={nuevoIdCliente}
                  onChange={(e) => setNuevoIdCliente(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Selecciona un cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.razonSocial}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Modelo</label>
                <input
                  type="text"
                  value={nuevoModelo}
                  onChange={(e) => setNuevoModelo(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: Nordson ProBlue 7"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Línea de proceso</label>
                <input
                  type="text"
                  value={nuevoLineaProceso}
                  onChange={(e) => setNuevoLineaProceso(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: Línea de ensamblaje"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="nuevo-estado"
                  type="checkbox"
                  checked={nuevoEstadoOperativo}
                  onChange={(e) => setNuevoEstadoOperativo(e.target.checked)}
                />
                <label htmlFor="nuevo-estado" className="text-sm">
                  Operativo
                </label>
              </div>

              <div>
                <label className="block text-sm mb-1">Fecha de instalación</label>
                <input
                  type="date"
                  value={nuevoFechaInstalacion}
                  onChange={(e) => setNuevoFechaInstalacion(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Próxima mantención</label>
                <input
                  type="date"
                  value={nuevoProximaMantencion}
                  onChange={(e) => setNuevoProximaMantencion(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
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

      {/* MODAL EDITAR */}
      {editarAbierto && equipoSel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              Editar equipo {equipoSel.modelo}
            </h2>

            <form onSubmit={handleEditarSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Modelo</label>
                <input
                  type="text"
                  value={editModelo}
                  onChange={(e) => setEditModelo(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Línea de proceso</label>
                <input
                  type="text"
                  value={editLineaProceso}
                  onChange={(e) => setEditLineaProceso(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="edit-estado"
                  type="checkbox"
                  checked={editEstadoOperativo}
                  onChange={(e) => setEditEstadoOperativo(e.target.checked)}
                />
                <label htmlFor="edit-estado" className="text-sm">
                  Operativo
                </label>
              </div>

              <div>
                <label className="block text-sm mb-1">Fecha de instalación</label>
                <input
                  type="date"
                  value={editFechaInstalacion}
                  onChange={(e) => setEditFechaInstalacion(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Próxima mantención</label>
                <input
                  type="date"
                  value={editProximaMantencion}
                  onChange={(e) => setEditProximaMantencion(e.target.value)}
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

      {/* MODAL HISTORIAL */}
      {historialesAbierto && historialEquipo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Historial de mantenciones - {historialEquipo.modelo}
              </h2>
              <button
                onClick={cerrarModalHistorial}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {generarHistorialMock(historialEquipo.id).map((h) => (
                <div key={h.id} className="border rounded p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm">{h.tipo}</p>
                      <p className="text-xs text-gray-600">
                        {formatearFecha(h.fecha)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600">Técnico: {h.técnico}</p>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{h.descripcion}</p>

                  {h.evidencias && h.evidencias.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-semibold mb-2">Evidencias:</p>
                      <div className="space-y-2">
                        {h.evidencias.map((e) => (
                          <div key={e.id} className="bg-white rounded p-2 text-xs">
                            <p className="font-medium">{e.tipo}</p>
                            <a
                              href={e.urlArchivo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 break-all"
                            >
                              {e.urlArchivo}
                            </a>
                            {e.descripcion && (
                              <p className="text-gray-700 mt-1">{e.descripcion}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {generarHistorialMock(historialEquipo.id).length === 0 && (
                <p className="text-sm text-gray-600 text-center py-4">
                  Sin historial de mantenciones
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={cerrarModalHistorial}
                className="px-4 py-2 border rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QR */}
      {qrAbierto && qrEquipo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm max-h-screen overflow-y-auto text-center">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">QR - Equipo {qrEquipo.id}</h2>
              <button onClick={() => { setQrAbierto(false); setQrEquipo(null); }} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>

            <p className="text-sm text-gray-600 mb-4">Escanea para abrir la lista de equipos y mostrar el historial de este equipo automáticamente en modal.</p>

            <div className="mb-4 flex justify-center items-center">
              {qrGenerating ? (
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-8 w-8 text-gray-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <p className="text-sm text-gray-600">Generando QR...</p>
                </div>
              ) : qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR equipo ${qrEquipo.id}`} className="w-64 h-64" />
              ) : (
                <img
                  src={`https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(qrUrl)}`}
                  alt={`QR equipo ${qrEquipo.id}`}
                  className="w-64 h-64"
                />
              )}
            </div>

            <div className="space-y-2">
              <input readOnly value={qrUrl} className="w-full border rounded px-3 py-2 text-xs" />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(qrUrl);
                  }}
                  className="px-3 py-2 border rounded text-sm"
                >
                  Copiar enlace
                </button>
                <a
                  href={qrEquipo ? `/api/qr/${qrEquipo.id}` : "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded bg-green-600 text-white text-sm"
                >
                  Descargar PNG
                </a>
                <button
                  type="button"
                  onClick={() => { setQrAbierto(false); setQrEquipo(null); }}
                  className="px-3 py-2 border rounded text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
