"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRefresh } from "@/lib/useRefresh";

type EquipoDTO = {
  id: number;
  modelo: string;
  clienteNombre: string;
};

type TecnicoDTO = {
  id: number;
  nombre: string;
  apellido: string;
};

type EvidenciaDTO = {
  id: number;
  tipo: string;
  urlArchivo: string;
  descripcion: string | null;
  fechaHora: string;
};

type OrdenDTO = {
  id: number;
  idEquipo: number;
  equipoModelo: string;
  clienteNombre: string;
  tipoOt: string;
  prioridad: string;
  estado: string;
  descripcionSintoma: string | null;
  trabajoRealizado: string | null;
  repuestosUtilizados: string | null;
  fechaCreacion: string;
  fechaProgramada: string | null;
  fechaCierre: string | null;
  idCreador: number | null;
  creadorNombre: string | null;
  evidencias: EvidenciaDTO[];
};

interface Props {
  ordenes: OrdenDTO[];
  equipos: EquipoDTO[];
  tecnicos: TecnicoDTO[];
  usuarioId: number;
  esJefe: boolean;
  esAdmin?: boolean;
}

export default function OrdenesClient({
  ordenes,
  equipos,
  tecnicos,
  usuarioId,
  esJefe,
  esAdmin = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-refresh cada 10 segundos para ver cambios de otros usuarios
  useRefresh(10);

  // Abrir modal si viene ?crear=true
  useEffect(() => {
    const crear = searchParams?.get("crear");
    if (crear === "true" && (esJefe || esAdmin)) {
      abrirModalCrear();
      router.replace("/ordenes", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // BÚSQUEDA Y FILTROS
  const [search, setSearch] = useState("");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("");

  // CREAR
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [nuevoIdEquipo, setNuevoIdEquipo] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("Preventiva");
  const [nuevaPrioridad, setNuevaPrioridad] = useState("Media");
  const [nuevoEstado, setNuevoEstado] = useState("Pendiente");
  const [nuevoDescripcion, setNuevoDescripcion] = useState("");
  const [guardandoCreacion, setGuardandoCreacion] = useState(false);
  const [errorCreacion, setErrorCreacion] = useState<string | null>(null);

  // EDITAR
  const [editarAbierto, setEditarAbierto] = useState(false);
  const [ordenSel, setOrdenSel] = useState<OrdenDTO | null>(null);
  const [editTipo, setEditTipo] = useState("");
  const [editPrioridad, setEditPrioridad] = useState("");
  const [editEstado, setEditEstado] = useState("");
  const [editDescripcionSintoma, setEditDescripcionSintoma] = useState("");
  const [editTrabajoRealizado, setEditTrabajoRealizado] = useState("");
  const [editRepuestos, setEditRepuestos] = useState("");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);

  // COMPLETAR OT
  const [completandoOT, setCompletandoOT] = useState(false);

  // EVIDENCIAS
  const [evidenciasAbierto, setEvidenciasAbierto] = useState(false);
  const [ordenEvidencias, setOrdenEvidencias] = useState<OrdenDTO | null>(null);
  const [nuevaEvidenciaTipo, setNuevaEvidenciaTipo] = useState("Informe");
  const [nuevaEvidenciaFile, setNuevaEvidenciaFile] = useState<File | null>(null);
  const [nuevaEvidenciaDescripcion, setNuevaEvidenciaDescripcion] = useState("");
  const [guardandoEvidencia, setGuardandoEvidencia] = useState(false);
  const [errorEvidencia, setErrorEvidencia] = useState<string | null>(null);

  // ELIMINAR
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  // ---------- FILTRADO ----------
  const ordenesFiltradas = ordenes.filter((o) => {
    const t = search.toLowerCase().trim();

    if (t) {
      const coincideTexto =
        o.equipoModelo.toLowerCase().includes(t) ||
        o.clienteNombre.toLowerCase().includes(t) ||
        o.tipoOt.toLowerCase().includes(t) ||
        (o.creadorNombre ?? "").toLowerCase().includes(t);

      if (!coincideTexto) return false;
    }

    if (filtroEstado && o.estado !== filtroEstado) {
      return false;
    }

    if (filtroPrioridad && o.prioridad !== filtroPrioridad) {
      return false;
    }

    return true;
  });

  // ---------- CREAR ----------
  const abrirModalCrear = () => {
    if (!esJefe && !esAdmin) return; // Jefe o Admin pueden crear
    setNuevoIdEquipo("");
    setNuevoTipo("Preventiva");
    setNuevaPrioridad("Media");
    setNuevoEstado("Pendiente");
    setNuevoDescripcion("");
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

    const idEquipoTrim = nuevoIdEquipo.trim();

    if (!idEquipoTrim) {
      setErrorCreacion("Equipo es obligatorio.");
      return;
    }

    setGuardandoCreacion(true);
    setErrorCreacion(null);
    setErrorGeneral(null);

    try {
      const res = await fetch("/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idEquipo: Number(idEquipoTrim),
          tipoOt: nuevoTipo,
          prioridad: nuevaPrioridad,
          estado: nuevoEstado,
          descripcionSintoma: nuevoDescripcion || null,
          fechaProgramada: null,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al crear orden");
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
  const abrirModalEditar = (o: OrdenDTO) => {
    // Jefe o Admin pueden editar todo, Técnico solo si creó la orden
    if (!esJefe && !esAdmin && o.idCreador !== usuarioId) {
      alert("No tienes permiso para editar esta orden");
      return;
    }

    setOrdenSel(o);
    setEditTipo(o.tipoOt);
    setEditPrioridad(o.prioridad);
    setEditEstado(o.estado);
    setEditDescripcionSintoma(o.descripcionSintoma ?? "");
    setEditTrabajoRealizado(o.trabajoRealizado ?? "");
    setEditRepuestos(o.repuestosUtilizados ?? "");
    setErrorEdicion(null);
    setErrorGeneral(null);
    setEditarAbierto(true);
  };

  const cerrarModalEditar = () => {
    setEditarAbierto(false);
    setOrdenSel(null);
    setErrorEdicion(null);
  };

  const handleEditarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenSel) return;

    setGuardandoEdicion(true);
    setErrorEdicion(null);
    setErrorGeneral(null);

    try {
      const body: any = { id: ordenSel.id };

      if (esJefe || esAdmin) {
        body.tipoOt = editTipo;
        body.prioridad = editPrioridad;
        body.estado = editEstado;
        body.descripcionSintoma = editDescripcionSintoma || null;
        body.trabajoRealizado = editTrabajoRealizado || null;
        body.repuestosUtilizados = editRepuestos || null;
        body.fechaProgramada = null;
      } else {
        // Técnico solo puede actualizar trabajo realizado y estado
        body.trabajoRealizado = editTrabajoRealizado || null;
        body.estado = editEstado;
      }

      const res = await fetch("/api/ordenes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al actualizar orden");
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

  // ---------- COMPLETAR OT ----------
  const handleCompletarOT = async (idOrden: number) => {
    if (!confirm("¿Marcar esta OT como completada? No se podrá editar después.")) return;
    
    setCompletandoOT(true);
    setErrorGeneral(null);

    try {
      const res = await fetch("/api/ordenes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: idOrden, 
          estado: "Completada"
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al completar orden");
      }

      router.refresh();
    } catch (err: any) {
      setErrorGeneral(err.message ?? "Error desconocido");
      alert("Error: " + (err.message ?? "Error desconocido"));
    } finally {
      setCompletandoOT(false);
    }
  };

  // ---------- EVIDENCIAS ----------
  const refrescarOrdenEvidencias = async () => {
    if (!ordenEvidencias) return;

    try {
      const res = await fetch(`/api/ordenes?id_equipo=${ordenEvidencias.idEquipo}`);
      const data = await res.json().catch(() => null);

      if (!res.ok || !data.ordenes) {
        return;
      }

      // Encontrar la orden actualizada
      const ordenActualizada = data.ordenes.find((o: any) => o.id_ot === ordenEvidencias.id);
      if (ordenActualizada) {
        // Mapear a OrdenDTO
        const ordenMapeada: OrdenDTO = {
          id: ordenActualizada.id_ot,
          idEquipo: ordenActualizada.id_equipo,
          equipoModelo: ordenActualizada.equipo?.modelo ?? "",
          clienteNombre: ordenActualizada.equipo?.cliente?.razon_social ?? "",
          tipoOt: ordenActualizada.tipo_ot,
          prioridad: ordenActualizada.prioridad,
          estado: ordenActualizada.estado,
          descripcionSintoma: ordenActualizada.descripcion_sintoma ?? null,
          trabajoRealizado: ordenActualizada.trabajo_realizado ?? null,
          repuestosUtilizados: ordenActualizada.repuestos_utilizados ?? null,
          fechaCreacion: ordenActualizada.fecha_creacion,
          fechaProgramada: ordenActualizada.fecha_programada ?? null,
          fechaCierre: ordenActualizada.fecha_cierre ?? null,
          idCreador: ordenActualizada.id_creador ?? null,
          creadorNombre: ordenActualizada.creador?.nombre ?? null,
          evidencias: (ordenActualizada.evidencias ?? []).map((e: any) => ({
            id: e.id_evidencia,
            tipo: e.tipo,
            urlArchivo: e.url_archivo,
            descripcion: e.descripcion ?? null,
            fechaHora: e.fecha_hora,
          })),
        };
        setOrdenEvidencias(ordenMapeada);
      }
    } catch (err) {
      console.error("Error refrescando evidencias:", err);
    }
  };

  const abrirModalEvidencias = (o: OrdenDTO) => {
    // Todos pueden ver evidencias (Jefe, Admin, Técnico)
    setOrdenEvidencias(o);
    setNuevaEvidenciaTipo("Informe");
    setNuevaEvidenciaFile(null);
    setNuevaEvidenciaDescripcion("");
    setErrorEvidencia(null);
    setEvidenciasAbierto(true);
  };

  const cerrarModalEvidencias = () => {
    setEvidenciasAbierto(false);
    setOrdenEvidencias(null);
    setErrorEvidencia(null);
  };

  const handleAgregarEvidencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenEvidencias) return;

    if (!nuevaEvidenciaFile) {
      setErrorEvidencia("Debes seleccionar un archivo.");
      return;
    }

    setGuardandoEvidencia(true);
    setErrorEvidencia(null);

    try {
      // Subir archivo
      const fd = new FormData();
      fd.append("file", nuevaEvidenciaFile);

      const up = await fetch("/api/evidencias/upload", {
        method: "POST",
        body: fd,
      });

      const upData = await up.json().catch(() => null);
      if (!up.ok) {
        throw new Error(upData?.error || "Error al subir archivo");
      }

      const urlToUse = upData.path;

      // Crear evidencia con la ruta del archivo
      const res = await fetch("/api/evidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idOt: ordenEvidencias.id,
          tipo: nuevaEvidenciaTipo,
          urlArchivo: urlToUse,
          descripcion: nuevaEvidenciaDescripcion || null,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al agregar evidencia");
      }

      // Limpiar formulario
      setNuevaEvidenciaFile(null);
      setNuevaEvidenciaDescripcion("");

      // Refrescar datos del modal sin cerrarlo
      await refrescarOrdenEvidencias();
    } catch (err: any) {
      setErrorEvidencia(err.message ?? "Error desconocido");
    } finally {
      setGuardandoEvidencia(false);
    }
  };

  const handleEliminarEvidencia = async (evidenciaId: number) => {
    const ok = window.confirm(
      "¿Eliminar esta evidencia? Esta acción no se puede deshacer."
    );
    if (!ok) return;

    try {
      const res = await fetch("/api/evidencias", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: evidenciaId }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al eliminar evidencia");
      }

      // Refrescar datos del modal sin cerrarlo
      await refrescarOrdenEvidencias();
    } catch (err: any) {
      alert(err.message ?? "Error desconocido");
    }
  };

  // ---------- ELIMINAR ----------
  const handleEliminar = async (o: OrdenDTO) => {
    if (!esJefe && !esAdmin) {
      alert("Solo los jefes y administradores pueden eliminar órdenes");
      return;
    }

    const ok = window.confirm(
      `¿Eliminar orden ${o.id}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    setEliminandoId(o.id);
    setErrorGeneral(null);

    try {
      const res = await fetch("/api/ordenes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: o.id }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al eliminar orden");
      }

      router.refresh();
    } catch (err: any) {
      setErrorGeneral(err.message ?? "Error desconocido");
    } finally {
      setEliminandoId(null);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const colores: { [key: string]: string } = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      "En progreso": "bg-blue-100 text-blue-800",
      Completada: "bg-green-100 text-green-800",
      Cancelada: "bg-red-100 text-red-800",
    };
    return colores[estado] || "bg-gray-100 text-gray-800";
  };

  const getPrioridadBadge = (prioridad: string) => {
    const colores: { [key: string]: string } = {
      Baja: "bg-blue-100 text-blue-800",
      Media: "bg-yellow-100 text-yellow-800",
      Alta: "bg-orange-100 text-orange-800",
      Urgente: "bg-red-100 text-red-800",
    };
    return colores[prioridad] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        {(esJefe || esAdmin) && (
          <button
            type="button"
            onClick={abrirModalCrear}
            className="w-40 px-4 py-2 rounded bg-blue-600 text-white whitespace-nowrap"
          >
            Nueva orden
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
          className="w-32 px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 whitespace-nowrap"
        >
          Filtrar
        </button>
      </div>

      {/* Drawer de filtros */}
      {filtrosAbiertos && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 animate-fadeIn" onClick={() => setFiltrosAbiertos(false)} />
          
          <div className="fixed top-0 right-0 h-full w-80 z-50 shadow-2xl transform translate-x-0 transition-transform duration-300 ease-out animate-slideInRight" style={{ background: 'linear-gradient(135deg, #0024FF 0%, #0017b3 100%)' }}>
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
                  <label className="block text-sm mb-2 text-white font-medium">Estado</label>
                  <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="w-full border rounded px-3 py-2 bg-white text-gray-900">
                    <option value="">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En progreso">En progreso</option>
                    <option value="Completada">Completada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-white font-medium">Prioridad</label>
                  <select value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)} className="w-full border rounded px-3 py-2 bg-white text-gray-900">
                    <option value="">Todas</option>
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>

                <div className="pt-6 border-t border-white/20 space-y-3">
                  <button type="button" onClick={() => { setFiltroEstado(""); setFiltroPrioridad(""); }} className="w-full px-4 py-2 bg-white/20 text-white rounded hover:bg-white/30">
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

      <h1 className="text-2xl font-semibold mb-4">Órdenes de Trabajo</h1>

      {/* Tabla para escritorio */}
      <div className="overflow-x-auto border rounded hidden md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Equipo</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Prioridad</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Técnico</th>
              <th className="px-4 py-2 text-left">Creación</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenesFiltradas.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-2 font-semibold">{o.id}</td>
                <td className="px-4 py-2">
                  <div className="text-sm">
                    <p className="font-medium">{o.equipoModelo}</p>
                    <p className="text-gray-600">{o.clienteNombre}</p>
                  </div>
                </td>
                <td className="px-4 py-2">{o.tipoOt}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getPrioridadBadge(o.prioridad)}`}>
                    {o.prioridad}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getEstadoBadge(o.estado)}`}>
                    {o.estado}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">
                  {o.creadorNombre ? (
                    <p>{o.creadorNombre}</p>
                  ) : (
                    <p className="text-gray-500">-</p>
                  )}
                </td>
                <td className="px-4 py-2 text-sm">
                  {new Date(o.fechaCreacion).toLocaleDateString("es-CL")}
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => abrirModalEvidencias(o)}
                    className="p-1 text-blue-500 hover:text-blue-600"
                    title="Ver/agregar evidencias"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1 4.5 4.5 0 11-4.814 6.5z" />
                    </svg>
                  </button>

                  {/* Botón Completar OT */}
                  {o.estado !== "Completada" && !o.fechaCierre && (esJefe || esAdmin || o.idCreador === usuarioId) && (
                    <button
                      type="button"
                      onClick={() => handleCompletarOT(o.id)}
                      disabled={completandoOT}
                      className="p-1 text-green-500 hover:text-green-600 disabled:opacity-50"
                      title="Completar OT"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}

                  {(esJefe || esAdmin || o.idCreador === usuarioId) && !o.fechaCierre && (
                    <button
                      type="button"
                      onClick={() => abrirModalEditar(o)}
                      className="p-1 text-yellow-500 hover:text-yellow-600"
                      title="Editar orden"
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
                      onClick={() => handleEliminar(o)}
                      disabled={eliminandoId === o.id}
                      title="Eliminar orden"
                      className="text-red-600 hover:scale-110 transition"
                    >
                      {eliminandoId === o.id ? (
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas para móvil */}
      <div className="mobile-cards md:hidden">
        {ordenesFiltradas.map((o) => (
          <div key={o.id} className="mobile-card">
            <div className="mobile-card-header">
              OT #{o.id} - {o.equipoModelo}
            </div>
            
            <div className="mobile-card-row">
              <span className="mobile-card-label">Cliente:</span>
              <span className="mobile-card-value">{o.clienteNombre}</span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Tipo:</span>
              <span className="mobile-card-value">{o.tipoOt}</span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Prioridad:</span>
              <span className="mobile-card-value">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getPrioridadBadge(o.prioridad)}`}>
                  {o.prioridad}
                </span>
              </span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Estado:</span>
              <span className="mobile-card-value">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getEstadoBadge(o.estado)}`}>
                  {o.estado}
                </span>
              </span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Técnico:</span>
              <span className="mobile-card-value">
                {o.creadorNombre || "-"}
              </span>
            </div>

            <div className="mobile-card-row">
              <span className="mobile-card-label">Fecha:</span>
              <span className="mobile-card-value">
                {new Date(o.fechaCreacion).toLocaleDateString("es-CL")}
              </span>
            </div>

            <div className="mobile-card-actions">
              <button
                type="button"
                onClick={() => abrirModalEvidencias(o)}
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Evidencias
              </button>

              {o.estado !== "Completada" && !o.fechaCierre && (esJefe || esAdmin || o.idCreador === usuarioId) && (
                <button
                  type="button"
                  onClick={() => handleCompletarOT(o.id)}
                  disabled={completandoOT}
                  className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Completar
                </button>
              )}

              {(esJefe || esAdmin || o.idCreador === usuarioId) && !o.fechaCierre && (
                <button
                  type="button"
                  onClick={() => abrirModalEditar(o)}
                  className="px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  Editar
                </button>
              )}

              {(esJefe || esAdmin) && (
                <button
                  type="button"
                  onClick={() => handleEliminar(o)}
                  disabled={eliminandoId === o.id}
                  className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {eliminandoId === o.id ? "..." : "Eliminar"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREAR */}
      {crearAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Crear orden de trabajo</h2>

            <form onSubmit={handleCrearSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Equipo</label>
                <select
                  value={nuevoIdEquipo}
                  onChange={(e) => setNuevoIdEquipo(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Selecciona un equipo...</option>
                  {equipos.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.modelo} - {e.clienteNombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Tipo de OT</label>
                <select
                  value={nuevoTipo}
                  onChange={(e) => setNuevoTipo(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Preventiva">Preventiva</option>
                  <option value="General">General</option>
                  <option value="Intervención">Intervención</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Prioridad</label>
                <select
                  value={nuevaPrioridad}
                  onChange={(e) => setNuevaPrioridad(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Estado</label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En progreso">En progreso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Descripción del síntoma</label>
                <textarea
                  value={nuevoDescripcion}
                  onChange={(e) => setNuevoDescripcion(e.target.value)}
                  className="w-full border rounded px-3 py-2 h-20"
                  placeholder="Describe el problema..."
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
      {editarAbierto && ordenSel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Editar orden {ordenSel.id}</h2>

            <form onSubmit={handleEditarSubmit} className="space-y-4">
              {(esJefe || esAdmin) && (
                <>
                  <div>
                    <label className="block text-sm mb-1">Tipo de OT</label>
                    <select
                      value={editTipo}
                      onChange={(e) => setEditTipo(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="Preventiva">Preventiva</option>
                      <option value="General">General</option>
                      <option value="Intervención">Intervención</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Prioridad</label>
                    <select
                      value={editPrioridad}
                      onChange={(e) => setEditPrioridad(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                      <option value="Urgente">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Descripción del síntoma</label>
                    <textarea
                      value={editDescripcionSintoma}
                      onChange={(e) => setEditDescripcionSintoma(e.target.value)}
                      className="w-full border rounded px-3 py-2 h-20"
                      />
                    </div>

                  <div>
                    <label className="block text-sm mb-1">Repuestos utilizados</label>
                    <textarea
                      value={editRepuestos}
                      onChange={(e) => setEditRepuestos(e.target.value)}
                      className="w-full border rounded px-3 py-2 h-16"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm mb-1">Trabajo realizado</label>
                <textarea
                  value={editTrabajoRealizado}
                  onChange={(e) => setEditTrabajoRealizado(e.target.value)}
                  className="w-full border rounded px-3 py-2 h-20"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Estado</label>
                <select
                  value={editEstado}
                  onChange={(e) => setEditEstado(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En progreso">En progreso</option>
                </select>
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

      {/* MODAL EVIDENCIAS */}
      {evidenciasAbierto && ordenEvidencias && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Evidencias - Orden {ordenEvidencias.id}
              </h2>
              <button
                onClick={cerrarModalEvidencias}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* AGREGAR EVIDENCIA */}
            {(/* permitir que técnicos vean y agreguen evidencias */ true) && (
              <div className="mb-6 p-4 border rounded bg-gray-50">
                <h3 className="font-semibold mb-3 text-sm">Agregar evidencia</h3>
                <form onSubmit={handleAgregarEvidencia} className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Tipo</label>
                    <select
                      value={nuevaEvidenciaTipo}
                      onChange={(e) => setNuevaEvidenciaTipo(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="Informe">Informe</option>
                      <option value="Fotos">Fotos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Archivo</label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setNuevaEvidenciaFile(f);
                      }}
                      className="w-full text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Descripción</label>
                    <textarea
                      value={nuevaEvidenciaDescripcion}
                      onChange={(e) => setNuevaEvidenciaDescripcion(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm h-16"
                      placeholder="Describe la evidencia..."
                    />
                  </div>

                  {errorEvidencia && (
                    <p className="text-sm text-red-600">{errorEvidencia}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full px-3 py-2 rounded bg-green-600 text-white text-sm"
                    disabled={guardandoEvidencia}
                  >
                    {guardandoEvidencia ? "Agregando..." : "Agregar"}
                  </button>
                </form>
              </div>
            )}

            {/* LISTA DE EVIDENCIAS */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm mb-3">
                Evidencias ({ordenEvidencias.evidencias.length})
              </h3>

              {ordenEvidencias.evidencias.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-4">
                  Sin evidencias
                </p>
              ) : (
                ordenEvidencias.evidencias.map((e) => (
                  <div key={e.id} className="border rounded p-3 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{e.tipo}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(e.fechaHora).toLocaleDateString("es-CL")}{" "}
                          {new Date(e.fechaHora).toLocaleTimeString("es-CL")}
                        </p>
                      </div>
                      {(esJefe || esAdmin) && (
                        <button
                          type="button"
                          onClick={() => handleEliminarEvidencia(e.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <p className="text-sm mb-2 break-all">
                      <a
                        href={e.urlArchivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {e.urlArchivo}
                      </a>
                    </p>
                    {e.descripcion && (
                      <p className="text-sm text-gray-700">{e.descripcion}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={cerrarModalEvidencias}
                className="px-4 py-2 border rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
