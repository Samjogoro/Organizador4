"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbx9sqRyT6_N3wSOJohW0KhqSkNlaYcuSodd3cGLNn7tPtFOh3Mh8_uEAK7ZG7bQs78VlQ/exec";

  const [categoria, setCategoria] = useState("");
  const [tarea, setTarea] = useState("");
  const [responsable, setResponsable] = useState("");
  const [diaAsignado, setDiaAsignado] = useState("");
  const [tareas, setTareas] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");

  // Cargar tareas desde Google Sheets
  const cargarTareas = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTareas(data.slice(1)); // Ignora la fila de encabezados
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  };

  // Guardar tarea en Google Sheets
  const guardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoria,
          tarea,
          responsable,
          diaAsignado,
        }),
      });

      if (response.ok) {
        setMensaje("✅ Tarea guardada correctamente");
        setCategoria("");
        setTarea("");
        setResponsable("");
        setDiaAsignado("");
        cargarTareas();
        setTimeout(() => setMensaje(""), 3000);
      } else {
        setMensaje("❌ Error al guardar la tarea");
        setTimeout(() => setMensaje(""), 3000);
      }
    } catch (error) {
      setMensaje("❌ Error de conexión");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  useEffect(() => {
    cargarTareas();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Organizador Semanal de Tareas</h1>

      <form
        onSubmit={guardarDatos}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6"
        id="form-tareas"
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Categoría
          </label>
          <input
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Tarea
          </label>
          <input
            id="tarea"
            value={tarea}
            onChange={(e) => setTarea(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Responsable
          </label>
          <input
            id="responsable"
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Día Asignado
          </label>
          <input
            id="dia"
            type="date"
            value={diaAsignado}
            onChange={(e) => setDiaAsignado(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Agregar
        </button>
      </form>

      {mensaje && (
        <p className="mb-4 text-green-600 font-semibold">{mensaje}</p>
      )}

      <button
        onClick={cargarTareas}
        id="btn-recargar"
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Recargar tareas
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Fecha</th>
              <th className="border px-4 py-2">Categoría</th>
              <th className="border px-4 py-2">Tarea</th>
              <th className="border px-4 py-2">Responsable</th>
              <th className="border px-4 py-2">Día Asignado</th>
            </tr>
          </thead>
          <tbody id="lista-tareas">
            {tareas.map((row, index) => (
              <tr key={index}>
                {row.map((cell: string, i: number) => (
                  <td key={i} className="border px-4 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
