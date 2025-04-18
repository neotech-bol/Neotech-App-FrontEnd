/**
 * Convierte un texto en un slug URL-friendly
 * @param {string} text - El texto a convertir en slug
 * @return {string} El slug generado
 */
export function generarSlug(text) {
    if (!text) return '';
    
    return text
      .toString()
      .normalize('NFD')                   // Normaliza caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '')   // Elimina diacríticos
      .toLowerCase()                      // Convierte a minúsculas
      .replace(/\s+/g, '-')              // Reemplaza espacios con guiones
      .replace(/[^\w\-]+/g, '')          // Elimina caracteres no alfanuméricos
      .replace(/\-\-+/g, '-')            // Reemplaza múltiples guiones con uno solo
      .replace(/^-+/, '')                // Elimina guiones del inicio
      .replace(/-+$/, '');               // Elimina guiones del final
  }
  
  /**
   * Genera un slug único añadiendo un identificador al final si es necesario
   * @param {string} text - El texto base para el slug
   * @param {number|string} id - Identificador único para añadir al slug
   * @return {string} El slug único generado
   */
  export function generarSlugUnico(text, id) {
    const baseSlug = generarSlug(text);
    return `${baseSlug}-${id}`;
  }