// js/cliente.js

import { supabase } from './supabase-client.js';

// 1. Obtener los autos del cliente logueado
export async function obtenerMisAutos() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('maltese_autos')
    .select('*')
    .eq('email_cliente', user.email);

  if (error) {
    console.error('Error al obtener mis autos:', error.message);
    return [];
  }
  return data;
}

// 2. Obtener el historial de servicios de un auto específico
export async function obtenerHistorial(autoId) {
  const { data, error } = await supabase
    .from('maltese_servicios')
    .select('*')
    .eq('auto_id', autoId)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error al obtener historial:', error.message);
    return [];
  }
  return data;
}