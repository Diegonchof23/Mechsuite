// lib/password.ts
export function generarPasswordAutomatico(nombre: string, apellido: string): string {
  const nombreLower = nombre.toLowerCase().trim();
  
  // Nombre en minúscula + 12345
  return `${nombreLower}12345`;
}
