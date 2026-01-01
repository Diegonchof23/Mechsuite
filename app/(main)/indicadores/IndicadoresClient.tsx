"use client";

import { useState } from "react";

const kpiLabels = [
  "Proporción de intervenciones registradas digitalmente (%)",
  "% de mantenimientos preventivos ejecutados en plazo",
  "% de evaluaciones positivas de usuarios internos",
  "Promedio de días de resolución de OT cerradas",
  "% de equipos operativos respecto al total mantenido"
];

type KPIData = {
  kpi1?: number;
  kpi2?: number;
  kpi3?: number;
  kpi4?: number;
  kpi5?: number;
  periodos?: any;
  detalles_vars?: any;
  detalles?: {
    encuestas: any[];
  };
};

interface Props {
  data: KPIData;
}

export default function IndicadoresClient({ data }: Props) {
  const [comentarioModal, setComentarioModal] = useState<any>(null);

  const cards = [1, 2, 3, 4, 5].map((idx) => {
    const kpiKey = `kpi${idx}` as keyof KPIData;
    const value = data[kpiKey];
    const periodo = data.periodos?.[kpiKey];
    const detalles = data.detalles_vars?.[kpiKey];
    return { idx, label: kpiLabels[idx - 1], value, periodo, detalles };
  });

  const adminEncuestas = data?.detalles?.encuestas || [];

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-white" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
        Indicadores (KPIs)
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.idx}
            className="group bg-white rounded shadow p-4 border border-gray-200 transition-transform duration-150 hover:scale-[1.02] flex flex-col justify-between"
          >
            <div>
              <div className="text-sm text-gray-500 mb-1">KPI {card.idx}</div>
              <div className="font-semibold mb-2 leading-snug">{card.label}</div>
              <div className="text-3xl font-bold text-blue-700">
                {card.value != null
                  ? Number(card.value).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })
                  : "-"}
              </div>
            </div>
            {(card.periodo || card.detalles) && (
              <div className="mt-3 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                {card.periodo && (
                  <div>
                    Periodo: {new Date(card.periodo.start).toLocaleDateString()} -{" "}
                    {new Date(card.periodo.end).toLocaleDateString()}
                  </div>
                )}
                {card.detalles &&
                  Array.isArray(card.detalles) &&
                  card.detalles.length > 0 && (
                    <div className="border-t pt-1">
                      {card.detalles.map((d: any, idx2: number) => (
                        <div key={idx2} className="flex justify-between gap-2">
                          <span className="text-gray-500">{d.label}:</span>
                          <span className="font-semibold text-gray-800">
                            {d.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
        ))}
      </div>

      {adminEncuestas.length > 0 && (
        <div className="mt-10 bg-white rounded shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Encuestas de Satisfacción</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2">Fecha</th>
                  <th className="py-2 pr-2">Usuario</th>
                  <th className="py-2 pr-2">Puntaje</th>
                  <th className="py-2 pr-2">Positiva</th>
                  <th className="py-2 pr-2">Comentarios</th>
                </tr>
              </thead>
              <tbody>
                {adminEncuestas.map((e: any) => (
                  <tr key={e.id_encuesta} className="border-b last:border-0">
                    <td className="py-2 pr-2">
                      {new Date(e.fecha_respuesta).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-2">
                      {`${e.usuario?.nombre || ""} ${
                        e.usuario?.apellido || ""
                      }`.trim()}
                    </td>
                    <td className="py-2 pr-2">{e.puntaje_total}</td>
                    <td className="py-2 pr-2">{e.positiva ? "Sí" : "No"}</td>
                    <td className="py-2 pr-2">
                      <button
                        onClick={() => setComentarioModal(e)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        Ver comentarios
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de comentarios */}
      {comentarioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Comentarios de la encuesta
              </h2>
              <button
                onClick={() => setComentarioModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700">Usuario:</span>
                <span className="text-gray-600">
                  {`${comentarioModal.usuario?.nombre || ""} ${
                    comentarioModal.usuario?.apellido || ""
                  }`.trim()}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700">Fecha:</span>
                <span className="text-gray-600">
                  {new Date(comentarioModal.fecha_respuesta).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700">Puntaje:</span>
                <span className="text-gray-600">
                  {comentarioModal.puntaje_total}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700">Positiva:</span>
                <span className="text-gray-600">
                  {comentarioModal.positiva ? "Sí" : "No"}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Comentario:</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                {comentarioModal.comentario || "Sin comentarios"}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setComentarioModal(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
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
