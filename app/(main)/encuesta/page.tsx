"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const preguntas = [
  "¿Le resulta fácil utilizar MechSuite para realizar sus tareas diarias?",
  "¿La información presentada (órdenes de trabajo, equipos, historial técnico) es clara y fácil de interpretar?",
  "¿Está conforme con la rapidez del sistema al cargar órdenes o revisar información técnica?",
  "¿MechSuite facilita su trabajo en comparación con los registros manuales utilizados anteriormente?",
  "En general, ¿qué tan satisfecho está con MechSuite?"
];

const opciones = [
  { label: "Totalmente en desacuerdo", value: 1 },
  { label: "En desacuerdo", value: 2 },
  { label: "Ni en desacuerdo ni de acuerdo", value: 3 },
  { label: "De acuerdo", value: 4 },
  { label: "Totalmente de acuerdo", value: 5 },
];

export default function EncuestaPage() {
  const [respuestas, setRespuestas] = useState([0,0,0,0,0]);
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (idx: number, value: number) => {
    const next = [...respuestas];
    next[idx] = value;
    setRespuestas(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (respuestas.some(r => r < 1 || r > 5)) {
      setError("Debes responder todas las preguntas (1 a 5)");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/encuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respuestas, comentario: comentario.trim() || null })
      });
      console.log('[EncuestaPage] POST response status:', res.status);
      const data = await res.json();
      console.log('[EncuestaPage] POST response data:', data);
      if (!res.ok) {
        setError(data.error || "Error al enviar la encuesta");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/"), 2000);
      }
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-green-50 rounded-xl shadow-lg border border-green-200">
      <h2 className="text-2xl font-bold mb-2 text-green-800">¡Gracias por responder la encuesta!</h2>
      <p className="text-green-700">Redirigiendo...</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.96)' }}>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Encuesta de Satisfacción MechSuite</h1>
      {preguntas.map((p, i) => (
        <div key={i} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block mb-3 font-semibold text-gray-800">{i+1}. {p}</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {opciones.map(({label, value}) => (
              <label key={value} className="flex items-center gap-2 border-2 rounded-lg px-4 py-3 hover:bg-white hover:border-blue-500 cursor-pointer transition-all">
                <input
                  type="radio"
                  name={`pregunta${i}`}
                  value={value}
                  checked={respuestas[i] === value}
                  onChange={() => handleChange(i, value)}
                  required
                  className="text-blue-600"
                />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Comentarios o sugerencias (opcional)</label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={3}
          placeholder="Cuéntanos qué mejorarías"
        />
      </div>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Enviando..." : "Enviar encuesta"}
      </button>
    </form>
  );
}
