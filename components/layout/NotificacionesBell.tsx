"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Notificacion = {
  id_notificacion: number;
  id_equipo: number;
  fecha_objetivo: string;
  fecha_creacion: string;
  visto: boolean;
  equipo: {
    modelo: string;
    linea_proceso: string;
    cliente: {
      razon_social: string;
    };
  };
};

export function NotificacionesBell() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    cargarNotificaciones();
    // Recargar cada 5 minutos
    const interval = setInterval(cargarNotificaciones, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const cargarNotificaciones = async () => {
    try {
      const res = await fetch("/api/notificaciones");
      if (!res.ok) {
        console.error("[NotificacionesBell] Error en response:", res.status, res.statusText);
        const errorData = await res.json().catch(() => ({}));
        console.error("[NotificacionesBell] Error data:", errorData);
        setNotificaciones([]);
        return;
      }
      const data = await res.json();
      console.log("[NotificacionesBell] Datos recibidos:", data);
      setNotificaciones(data.notificaciones || []);
    } catch (err) {
      console.error("[NotificacionesBell] Error al cargar notificaciones:", err);
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClickNotificacion = async (notif: Notificacion) => {
    // Construir búsqueda con cliente, modelo y línea de proceso
    const searchTerms = [
      notif.equipo.cliente.razon_social,
      notif.equipo.modelo,
      notif.equipo.linea_proceso
    ].filter(Boolean).join(' ');
    
    // Redirigir al módulo de equipos con búsqueda
    router.push(`/equipos?search=${encodeURIComponent(searchTerms)}`);
    setMostrar(false);
  };

  const handleMarcarVista = async (e: React.MouseEvent, notif: Notificacion) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notificaciones?id=${notif.id_notificacion}`, {
        method: "PATCH",
      });
      // Actualizar lista local
      setNotificaciones(notificaciones.map(n =>
        n.id_notificacion === notif.id_notificacion ? { ...n, visto: true } : n
      ));
    } catch (err) {
      console.error("Error al marcar como vista:", err);
    }
  };

  const handleMarcarTodasVistas = async () => {
    try {
      await fetch(`/api/notificaciones?todas=true`, {
        method: "PATCH",
      });
      // Actualizar lista local
      setNotificaciones(notificaciones.map(n => ({ ...n, visto: true })));
    } catch (err) {
      console.error("Error al marcar todas como vistas:", err);
    }
  };

  const handleEliminar = async (e: React.MouseEvent, notif: Notificacion) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notificaciones?id=${notif.id_notificacion}`, {
        method: "DELETE",
      });
      // Actualizar lista local
      setNotificaciones(notificaciones.filter(n => n.id_notificacion !== notif.id_notificacion));
    } catch (err) {
      console.error("Error al eliminar notificación:", err);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calcularDiasRestantes = (fechaObjetivo: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const objetivo = new Date(fechaObjetivo);
    objetivo.setHours(0, 0, 0, 0);
    const diffTime = objetivo.getTime() - hoy.getTime();
    const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return dias;
  };

  if (loading) return null;

  const cantidadNotif = notificaciones.length;
  const noVistas = notificaciones.filter(n => !n.visto).length;

  return (
    <div className="relative">
      <button
        onClick={() => setMostrar(!mostrar)}
        className="relative text-white hover:text-gray-200 transition-colors"
        aria-label="Notificaciones"
      >
        {/* Icono de campana */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge con cantidad */}
        {noVistas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {noVistas > 9 ? "9+" : noVistas}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {mostrar && (
        <>
          {/* Overlay invisible para cerrar al hacer click fuera */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setMostrar(false)}
          />

          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[500px] overflow-hidden flex flex-col" style={{ zIndex: 9999 }}>
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Notificaciones
                </h3>
                <div className="flex items-center gap-2">
                  {noVistas > 0 && (
                    <button
                      onClick={handleMarcarTodasVistas}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      title="Marcar todas como vistas"
                    >
                      Marcar todas vistas
                    </button>
                  )}
                  <button
                    onClick={() => setMostrar(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="overflow-y-auto flex-1">
              {cantidadNotif === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto mb-2 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm">No hay notificaciones pendientes</p>
                </div>
              ) : (
                <div>
                  {notificaciones.map((notif) => {
                    const diasRestantes = calcularDiasRestantes(notif.fecha_objetivo);
                    const esUrgente = diasRestantes <= 7;
                    
                    return (
                      <div
                        key={notif.id_notificacion}
                        className={`w-full px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer ${notif.visto ? 'opacity-50' : ''}`}
                        onClick={() => handleClickNotificacion(notif)}
                      >
                        <div className="flex items-start gap-2">
                          {/* Icono de alerta */}
                          <div className={`flex-shrink-0 ${esUrgente ? 'text-red-500' : 'text-yellow-500'}`}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>

                          {/* Contenido */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-semibold text-gray-900">
                                Alerta de mantención
                              </p>
                              {notif.visto && (
                                <span className="text-xs text-green-600 font-medium">✓ Vista</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              El equipo <span className="font-semibold">{notif.equipo.modelo}</span> del cliente{" "}
                              <span className="font-semibold">{notif.equipo.cliente.razon_social}</span> está próximo a su mantención programada ({formatearFecha(notif.fecha_objetivo)}).
                            </p>
                            <p className={`text-xs mt-1 font-medium ${esUrgente ? 'text-red-600' : 'text-yellow-600'}`}>
                              {diasRestantes === 0 ? '¡Hoy!' : diasRestantes === 1 ? 'Mañana' : `En ${diasRestantes} días`}
                            </p>
                          </div>

                          {/* Botones de acción */}
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            {/* Botón marcar como vista */}
                            {!notif.visto && (
                              <button
                                onClick={(e) => handleMarcarVista(e, notif)}
                                className="text-gray-400 hover:text-green-600 transition-colors p-1"
                                title="Marcar como vista"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            )}

                            {/* Botón eliminar */}
                            <button
                              onClick={(e) => handleEliminar(e, notif)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              title="Eliminar notificación"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cantidadNotif > 0 && (
              <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Haz clic en una notificación para ver el equipo
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
