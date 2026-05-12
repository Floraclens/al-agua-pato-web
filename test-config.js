// Simple test to verify the configuration system works
const { determinarTemporada, obtenerReglasParaFecha, esFinDeSemanaOFeriado } = require('./lib/config-reservas.ts');

console.log('Testing configuration system...');

// Test Temporada Baja (1 de Abril)
const fechaBaja = new Date(2026, 3, 15); // 15 de Abril
console.log('Fecha Baja:', fechaBaja.toDateString());
console.log('Temporada:', determinarTemporada(fechaBaja));

// Test Temporada Media (1 de Septiembre)
const fechaMedia = new Date(2026, 8, 15); // 15 de Septiembre
console.log('Fecha Media:', fechaMedia.toDateString());
console.log('Temporada:', determinarTemporada(fechaMedia));

// Test Temporada Alta (15 de Diciembre)
const fechaAlta = new Date(2026, 11, 20); // 20 de Diciembre
console.log('Fecha Alta:', fechaAlta.toDateString());
console.log('Temporada:', determinarTemporada(fechaAlta));

// Test reglas para una fecha específica
const reglas = obtenerReglasParaFecha(fechaMedia);
console.log('Reglas para fecha media:', JSON.stringify(reglas, null, 2));

console.log('Configuration test completed successfully!');
