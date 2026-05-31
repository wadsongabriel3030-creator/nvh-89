export interface CalendarActivity {
  id: string;
  title: string;
  color: 'purple' | 'blue' | 'green' | 'orange' | 'yellow' | 'pink';
  date: Date;
  comments?: string;
  cycles?: string;
}

// Color mapping:
// purple = Servicio dominical
// blue = Reuniones / Equipo Ejecutivo / Discipuladores
// green = Vida Nuevos Hechos / Academia Reset / PLC
// orange = Oración / Ayuno / SELAH
// yellow = Noche de Libertad / Noche de Adoración
// pink = Freedom / Bautismos / Celebraciones especiales

export const calendarActivities2026: CalendarActivity[] = [
  // ===================== ENERO =====================
  { id: 'jan-1', title: 'Servicio - Adoración / Honra', color: 'purple', date: new Date(2026, 0, 4), cycles: 'Inicia primero ciclo' },
  { id: 'jan-2', title: 'Celebración Santa Cena', color: 'purple', date: new Date(2026, 0, 4) },
  { id: 'jan-3', title: 'Inicia 7 días de oración', color: 'orange', date: new Date(2026, 0, 5), cycles: 'Primer tiempo de oración' },
  { id: 'jan-4', title: 'Reunión Equipo Ejecutivo (presencial)', color: 'blue', date: new Date(2026, 0, 7) },
  { id: 'jan-5', title: 'Finaliza 7 días de oración', color: 'orange', date: new Date(2026, 0, 7) },
  { id: 'jan-6', title: 'Inicia 21 días de Ayuno y Oración', color: 'orange', date: new Date(2026, 0, 7) },
  { id: 'jan-7', title: 'Servicio - Cambio de Reino', color: 'purple', date: new Date(2026, 0, 11) },
  { id: 'jan-8', title: 'Noche de Libertad y Regalos', color: 'yellow', date: new Date(2026, 0, 16), comments: 'Reunión presencial / pausa en PLC' },
  { id: 'jan-9', title: 'Academia Reset (Primer Seminario)', color: 'green', date: new Date(2026, 0, 18), comments: 'Inicia a las 9:00 a.m.' },
  { id: 'jan-10', title: 'Oración - Levántate Guate', color: 'orange', date: new Date(2026, 0, 18), comments: 'Turno de oración CONEXIÓN MINISTERIOS 12:00 pm' },
  { id: 'jan-11', title: 'Reunión Equipo Ejecutivo (Zoom)', color: 'blue', date: new Date(2026, 0, 21) },
  { id: 'jan-12', title: 'Servicio - Corazón del Padre', color: 'purple', date: new Date(2026, 0, 25) },
  { id: 'jan-13', title: 'Reunión Discipuladores', color: 'blue', date: new Date(2026, 0, 25), comments: 'Después de servicio / casa pastores' },
  { id: 'jan-14', title: 'Finaliza 21 días de Ayuno', color: 'orange', date: new Date(2026, 0, 31) },

  // ===================== FEBRERO =====================
  { id: 'feb-1', title: 'Servicio - Misión del Hijo / Propósito de la Iglesia', color: 'purple', date: new Date(2026, 1, 1) },
  { id: 'feb-2', title: 'Celebración Santa Cena', color: 'purple', date: new Date(2026, 1, 1) },
  { id: 'feb-3', title: 'Vida Nuevos Hechos', color: 'green', date: new Date(2026, 1, 1) },
  { id: 'feb-4', title: 'Reunión Equipo Ejecutivo (presencial)', color: 'blue', date: new Date(2026, 1, 4) },
  { id: 'feb-5', title: 'Servicio - Ir', color: 'purple', date: new Date(2026, 1, 8) },
  { id: 'feb-6', title: 'Vida Nuevos Hechos', color: 'green', date: new Date(2026, 1, 8) },
  { id: 'feb-7', title: 'Servicio - Predicar y Enseñar', color: 'purple', date: new Date(2026, 1, 15) },
  { id: 'feb-8', title: 'Freedom - Capacitación', color: 'pink', date: new Date(2026, 1, 20), comments: 'Virtual en Inglés · $20 por persona' },
  { id: 'feb-9', title: 'PLC - Salida de Esperanza', color: 'green', date: new Date(2026, 1, 21) },
  { id: 'feb-9b', title: 'PLC - Salida de Esperanza', color: 'green', date: new Date(2026, 1, 22) },
  { id: 'feb-10', title: 'Servicio - Hacer discípulos', color: 'purple', date: new Date(2026, 1, 22) },
  { id: 'feb-11', title: 'Bautismos', color: 'pink', date: new Date(2026, 1, 22) },
  { id: 'feb-12', title: 'Freedom - Capacitación', color: 'pink', date: new Date(2026, 1, 27), comments: 'Virtual en Español · $ por persona' },

  // ===================== MARZO =====================
  { id: 'mar-1', title: 'Servicio - Bautizar', color: 'purple', date: new Date(2026, 2, 1) },
  { id: 'mar-2', title: 'Celebración Santa Cena', color: 'purple', date: new Date(2026, 2, 1) },
  { id: 'mar-3', title: 'Vida Nuevos Hechos', color: 'green', date: new Date(2026, 2, 1) },
  { id: 'mar-4', title: 'Inicia 24/7 de oración', color: 'orange', date: new Date(2026, 2, 2), cycles: 'Segundo tiempo de oración' },
  { id: 'mar-5', title: 'Reunión Equipo Ejecutivo (presencial)', color: 'blue', date: new Date(2026, 2, 4) },
  { id: 'mar-6', title: 'Finaliza 7 días de oración', color: 'orange', date: new Date(2026, 2, 4) },
  { id: 'mar-7', title: 'Servicio - Sanar y Liberar', color: 'purple', date: new Date(2026, 2, 8) },
  { id: 'mar-8', title: 'Presentación de Pastores y Equipo E.', color: 'blue', date: new Date(2026, 2, 8), comments: 'Vestimenta formal' },
  { id: 'mar-9', title: 'Servicio - Dar / Generosidad', color: 'purple', date: new Date(2026, 2, 15) },
  { id: 'mar-10', title: 'Reunión Discipuladores', color: 'blue', date: new Date(2026, 2, 15), cycles: 'Finaliza Primero ciclo' },
  { id: 'mar-11', title: 'Noche de Adoración', color: 'yellow', date: new Date(2026, 2, 20), comments: 'Reunión presencial / pausa en PLC' },
  { id: 'mar-12', title: 'Servicio - Familia / Temas Varios', color: 'purple', date: new Date(2026, 2, 22) },
  { id: 'mar-13', title: 'Bautismos', color: 'pink', date: new Date(2026, 2, 22), comments: 'Casa las Orquídeas / hora' },
  { id: 'mar-14', title: 'Servicio - Adoración / Honra', color: 'purple', date: new Date(2026, 2, 29), cycles: 'Inicia Segundo Ciclo' },

  // ===================== ABRIL =====================
  { id: 'abr-1', title: '🟠 SELAH', color: 'orange', date: new Date(2026, 3, 5) },
  { id: 'abr-2', title: 'Reunión Equipo Ejecutivo (presencial)', color: 'blue', date: new Date(2026, 3, 8) },
  { id: 'abr-3', title: 'Servicio - Cambio de Reino', color: 'purple', date: new Date(2026, 3, 12) },
  { id: 'abr-4', title: 'Celebración Santa Cena', color: 'purple', date: new Date(2026, 3, 12) },
  { id: 'abr-5', title: 'Vida Nuevos Hechos', color: 'green', date: new Date(2026, 3, 12) },
  { id: 'abr-6', title: 'PLC - Salida de Esperanza', color: 'green', date: new Date(2026, 3, 17) },
  { id: 'abr-6b', title: 'PLC - Salida de Esperanza', color: 'green', date: new Date(2026, 3, 18) },
  { id: 'abr-7', title: 'Servicio - Corazón del Padre', color: 'purple', date: new Date(2026, 3, 19), comments: 'Invitado: Pastor Bayron Lechuga' },
  { id: 'abr-8', title: 'Servicio - Misión del Hijo / Propósito de la Iglesia', color: 'purple', date: new Date(2026, 3, 26) },
  { id: 'abr-9', title: 'Bautismos', color: 'pink', date: new Date(2026, 3, 26) },

  // ===================== MAYO =====================
  { id: 'may-1', title: 'Servicio - Invitado Especial', color: 'purple', date: new Date(2026, 4, 3) },
  { id: 'may-2', title: 'Celebración Santa Cena', color: 'purple', date: new Date(2026, 4, 3), cycles: 'Tercer tiempo de oración' },
  { id: 'may-3', title: 'Inicia 7 días de oración', color: 'orange', date: new Date(2026, 4, 4) },
  { id: 'may-4', title: 'Reunión Equipo Ejecutivo (presencial)', color: 'blue', date: new Date(2026, 4, 6) },
  { id: 'may-5', title: 'Finaliza 7 días de oración', color: 'orange', date: new Date(2026, 4, 6) },
  { id: 'may-6', title: 'Celebración día de la Madre', color: 'pink', date: new Date(2026, 4, 10) },
  { id: 'may-7', title: 'Freedom - Primer Encuentro', color: 'pink', date: new Date(2026, 4, 15) },
  { id: 'may-7b', title: 'Freedom - Primer Encuentro', color: 'pink', date: new Date(2026, 4, 16) },
  { id: 'may-8', title: 'Servicio - Ir', color: 'purple', date: new Date(2026, 4, 17) },
  { id: 'may-9', title: 'Noche de Libertad y Regalos', color: 'yellow', date: new Date(2026, 4, 22), comments: 'Reunión presencial / pausa en PLC' },
  { id: 'may-10', title: 'Servicio - Predicar y Enseñar', color: 'purple', date: new Date(2026, 4, 24) },
  { id: 'may-11', title: 'Bautismos', color: 'pink', date: new Date(2026, 4, 24) },
  { id: 'may-12', title: 'Reunión Discipuladores', color: 'blue', date: new Date(2026, 4, 24), comments: 'Después de Bautismos' },
  { id: 'may-13', title: 'Servicio - Hacer discípulos', color: 'purple', date: new Date(2026, 4, 31) },

  // ===================== JUNIO =====================
  { id: 'jun-1', title: 'Reunión Equipo Ejecutivo (presencial)', color: 'blue', date: new Date(2026, 5, 3) },
  { id: 'jun-2', title: 'Academia Reset (Segundo seminario)', color: 'green', date: new Date(2026, 5, 7), comments: 'Inicia a las 9:00 a.m.' },
  { id: 'jun-3', title: 'Vida Nuevos Hechos', color: 'green', date: new Date(2026, 5, 7) },
  { id: 'jun-4', title: 'Celebración día del Padre', color: 'pink', date: new Date(2026, 5, 7) },
  { id: 'jun-5', title: 'Servicio - Bautizar', color: 'purple', date: new Date(2026, 5, 14) },
  { id: 'jun-6', title: 'Celebración Santa Cena', color: 'purple', date: new Date(2026, 5, 14) },
  { id: 'jun-7', title: 'PLC - Salida de Esperanza', color: 'green', date: new Date(2026, 5, 19) },
  { id: 'jun-7b', title: 'PLC - Salida de Esperanza', color: 'green', date: new Date(2026, 5, 20) },
  { id: 'jun-8', title: 'Servicio - Sanar y Liberar', color: 'purple', date: new Date(2026, 5, 21) },
  { id: 'jun-9', title: 'Bautismos', color: 'pink', date: new Date(2026, 5, 21) },
  { id: 'jun-10', title: 'Servicio - Dar / Generosidad', color: 'purple', date: new Date(2026, 5, 28), cycles: 'Finaliza Segundo ciclo' },

  // ===================== JULIO =====================
  { id: 'jul-1', title: 'Reunión Equipo Ejecutivo (presencial)', color: 'blue', date: new Date(2026, 6, 1) },
  { id: 'jul-2', title: 'Servicio - Temas Varios', color: 'purple', date: new Date(2026, 6, 5) },
  { id: 'jul-3', title: 'Celebración Santa Cena', color: 'purple', date: new Date(2026, 6, 5) },
  { id: 'jul-4', title: 'Vida Nuevos Hechos', color: 'green', date: new Date(2026, 6, 5) },
  { id: 'jul-5', title: 'Inicia 7 días de oración', color: 'orange', date: new Date(2026, 6, 6), comments: 'Cuarto tiempo anual', cycles: 'Cuarto tiempo de oración' },
  { id: 'jul-6', title: 'Finaliza 7 días de oración', color: 'orange', date: new Date(2026, 6, 6) },
  { id: 'jul-7', title: 'Servicio - Adoración / Honra', color: 'purple', date: new Date(2026, 6, 12), cycles: 'Inicia Tercer ciclo' },
  { id: 'jul-8', title: 'Noche de Adoración', color: 'yellow', date: new Date(2026, 6, 17), comments: 'Reunión presencial / pausa en PLC' },
  { id: 'jul-9', title: 'Servicio - Cambio de Reino', color: 'purple', date: new Date(2026, 6, 19) },
  { id: 'jul-10', title: 'Reunión Discipuladores', color: 'blue', date: new Date(2026, 6, 19) },
  { id: 'jul-11', title: 'Servicio - Corazón del Padre', color: 'purple', date: new Date(2026, 6, 26) },
  { id: 'jul-12', title: 'Bautismos', color: 'pink', date: new Date(2026, 6, 26) },
  { id: 'jul-13', title: 'Inicia 7 días de oración', color: 'orange', date: new Date(2026, 6, 27), comments: 'Quinto tiempo anual', cycles: 'Quinto tiempo de oración' },

  // ===================== AGOSTO =====================
  { id: 'ago-1', title: 'Servicio - Misión del Hijo / Propósito de la Iglesia', color: 'purple', date: new Date(2026, 7, 2) },
  { id: 'ago-2', title: 'Celebración Santa Cena', color: 'purple', date: new Date(2026, 7, 2) },
  { id: 'ago-3', title: 'Finaliza 7 días de oración', color: 'orange', date: new Date(2026, 7, 2) },
  { id: 'ago-4', title: 'Vida Nuevos Hechos', color: 'green', date: new Date(2026, 7, 2) },
  { id: 'ago-5', title: 'Reunión Equipo Ejecutivo (presencial)', color: 'blue', date: new Date(2026, 7, 5) },
  { id: 'ago-6', title: 'Freedom - Segundo Encuentro', color: 'pink', date: new Date(2026, 7, 7) },
  { id: 'ago-6b', title: 'Freedom - Segundo Encuentro', color: 'pink', date: new Date(2026, 7, 8) },
  { id: 'ago-7', title: 'Servicio - Ir', color: 'purple', date: new Date(2026, 7, 9) },
  { id: 'ago-8', title: '🟠 SELAH', color: 'orange', date: new Date(2026, 7, 16) },
  { id: 'ago-9', title: 'Servicio - Predicar y Enseñar', color: 'purple', date: new Date(2026, 7, 23) },
  { id: 'ago-10', title: 'Bautismos', color: 'pink', date: new Date(2026, 7, 23) },
  { id: 'ago-11', title: 'PLC - Salida de Esperanza', color: 'green', date: new Date(2026, 7, 28) },
  { id: 'ago-11b', title: 'PLC - Salida de Esperanza', color: 'green', date: new Date(2026, 7, 29) },
  { id: 'ago-12', title: 'Servicio - Hacer discípulos', color: 'purple', date: new Date(2026, 7, 30) },
  { id: 'ago-13', title: 'Inicia 7 días de oración', color: 'orange', date: new Date(2026, 7, 31), cycles: 'Sexto tiempo de oración' },

  // ===================== SEPTIEMBRE =====================
  { id: 'sep-1', title: 'Reunión Equipo Ejecutivo (presencial)', color: 'blue', date: new Date(2026, 8, 2) },
  { id: 'sep-2', title: 'Servicio - Bautizar', color: 'purple', date: new Date(2026, 8, 6) },
  { id: 'sep-3', title: 'Celebración Santa Cena', color: 'purple', date: new Date(2026, 8, 6) },
  { id: 'sep-4', title: 'Finaliza 7 días de oración', color: 'orange', date: new Date(2026, 8, 6) },
  { id: 'sep-5', title: 'Vida Nuevos Hechos', color: 'green', date: new Date(2026, 8, 6) },
  { id: 'sep-6', title: 'Servicio - Sanar y Liberar', color: 'purple', date: new Date(2026, 8, 13) },
  { id: 'sep-7', title: 'Reunión Discipuladores', color: 'blue', date: new Date(2026, 8, 13) },
  { id: 'sep-8', title: 'Noche de Libertad y Regalos', color: 'yellow', date: new Date(2026, 8, 18), comments: 'Reunión presencial / pausa en PLC' },
  { id: 'sep-9', title: 'Servicio - Dar / Generosidad', color: 'purple', date: new Date(2026, 8, 20), cycles: 'Finaliza Tercer ciclo' },
  { id: 'sep-10', title: 'Academia Reset (Tercer seminario)', color: 'green', date: new Date(2026, 8, 27), comments: 'Inicia a las 9:00 a.m.' },
  { id: 'sep-11', title: 'Bautismos', color: 'pink', date: new Date(2026, 8, 27) },

  // ===================== OCTUBRE =====================
  { id: 'oct-1', title: 'Servicio - Adoración / Honra', color: 'purple', date: new Date(2026, 9, 4), cycles: 'Inicia Cuarto ciclo' },
  { id: 'oct-2', title: 'Celebración Santa Cena', color: 'purple', date: new Date(2026, 9, 4) },
  { id: 'oct-3', title: 'Membresía Nuevos Hechos', color: 'green', date: new Date(2026, 9, 4) },
  { id: 'oct-4', title: 'Reunión Equipo Ejecutivo (presencial)', color: 'blue', date: new Date(2026, 9, 7) },
  { id: 'oct-5', title: 'Servicio - Cambio de Reino', color: 'purple', date: new Date(2026, 9, 11) },
  { id: 'oct-6', title: 'Celebración Santa Cena', color: 'purple', date: new Date(2026, 9, 11) },
  { id: 'oct-7', title: 'Servicio - Corazón del Padre', color: 'purple', date: new Date(2026, 9, 18) },
  { id: 'oct-8', title: 'PLC - Salida de Esperanza', color: 'green', date: new Date(2026, 9, 23) },
  { id: 'oct-8b', title: 'PLC - Salida de Esperanza', color: 'green', date: new Date(2026, 9, 24) },
  { id: 'oct-9', title: 'Servicio - Misión del Hijo / Propósito de la Iglesia', color: 'purple', date: new Date(2026, 9, 25) },
  { id: 'oct-10', title: 'Bautismos', color: 'pink', date: new Date(2026, 9, 25) },
  { id: 'oct-11', title: 'Reunión Discipuladores', color: 'blue', date: new Date(2026, 9, 25) },

  // ===================== NOVIEMBRE =====================
  { id: 'nov-1', title: '🟠 SELAH', color: 'orange', date: new Date(2026, 10, 1) },
  { id: 'nov-2', title: 'Inicia 7 días de oración', color: 'orange', date: new Date(2026, 10, 2), cycles: 'Séptimo tiempo de oración' },
  { id: 'nov-3', title: 'Reunión Equipo Ejecutivo (presencial)', color: 'blue', date: new Date(2026, 10, 4) },
  { id: 'nov-4', title: 'Servicio - Ir', color: 'purple', date: new Date(2026, 10, 8) },
  { id: 'nov-5', title: 'Celebración Santa Cena', color: 'purple', date: new Date(2026, 10, 8) },
  { id: 'nov-6', title: 'Finaliza 7 días de oración', color: 'orange', date: new Date(2026, 10, 8) },
  { id: 'nov-7', title: 'Vida Nuevos Hechos', color: 'green', date: new Date(2026, 10, 8) },
  { id: 'nov-8', title: 'Servicio - Predicar y Enseñar', color: 'purple', date: new Date(2026, 10, 15) },
  { id: 'nov-9', title: 'Freedom - Tercer Encuentro', color: 'pink', date: new Date(2026, 10, 20) },
  { id: 'nov-9b', title: 'Freedom - Tercer Encuentro', color: 'pink', date: new Date(2026, 10, 21) },
  { id: 'nov-10', title: 'Servicio - Hacer discípulos', color: 'purple', date: new Date(2026, 10, 22) },
  { id: 'nov-11', title: 'Noche de Adoración', color: 'yellow', date: new Date(2026, 10, 27), comments: 'Reunión presencial / pausa en PLC' },
  { id: 'nov-12', title: 'Servicio - Bautizar', color: 'purple', date: new Date(2026, 10, 29) },
  { id: 'nov-13', title: 'Bautismos', color: 'pink', date: new Date(2026, 10, 29) },
  { id: 'nov-14', title: 'Reunión Discipuladores', color: 'blue', date: new Date(2026, 10, 29) },

  // ===================== DICIEMBRE =====================
  { id: 'dec-1', title: 'Reunión Equipo Ejecutivo (presencial)', color: 'blue', date: new Date(2026, 11, 2) },
  { id: 'dec-2', title: 'Servicio - Sanar y Liberar', color: 'purple', date: new Date(2026, 11, 6) },
  { id: 'dec-3', title: 'Servicio - Adoración / Honra', color: 'purple', date: new Date(2026, 11, 13), cycles: 'Finaliza Cuarto ciclo' },
  { id: 'dec-4', title: 'Bautismos', color: 'pink', date: new Date(2026, 11, 13) },
  { id: 'dec-5', title: 'Servicio - Temas Varios', color: 'purple', date: new Date(2026, 11, 20) },
  { id: 'dec-6', title: '🟠 SELAH', color: 'orange', date: new Date(2026, 11, 27) },
];
