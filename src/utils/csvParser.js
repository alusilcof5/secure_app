/**
 * Utilidades para parsear CSVs con diferentes encodings
 */

export const parseCSVAdvanced = (text) => {
  text = text.replace(/^\ufeff/, '');

  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = parseCSVLine(lines[0]);
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim() || '';
    });
    
    return obj;
  });
};

// Parser de líneas CSV que maneja comillas y comas dentro de campos
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Comilla escapada
        current += '"';
        i++;
      } else {
        // Toggle estado de comillas
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Separador de campo
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Agregar último campo
  result.push(current);
  
  return result;
};

// Detectar y convertir encoding
export const detectAndConvertEncoding = async (blob) => {
  // Intentar leer como UTF-8 primero
  try {
    const text = await blob.text();
    return text;
  } catch (e) {
    // Si falla, intentar con UTF-16
    const arrayBuffer = await blob.arrayBuffer();
    const decoder = new TextDecoder('utf-16le');
    return decoder.decode(arrayBuffer);
  }
};
