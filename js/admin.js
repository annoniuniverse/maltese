// js/admin.js

import { supabase } from './supabase-client.js';

// 1. Subir imagen al bucket
export async function subirFoto(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('maltese-fotos')
    .upload(filePath, file);

  if (error) {
    console.error('Error al subir foto:', error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('maltese-fotos')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// 2. Buscar auto por patente
export async function buscarAuto(patente) {
  const { data, error } = await supabase
    .from('maltese_autos')
    .select('*')
    .eq('patente', patente.toUpperCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error al buscar auto:', error.message);
  }
  return data;
}

// 3. Crear un nuevo auto
export async function crearAuto(autoData) {
  const { data, error } = await supabase
    .from('maltese_autos')
    .insert([autoData])
    .select()
    .single();

  if (error) {
    console.error('Error al crear auto:', error.message);
    return null;
  }
  return data;
}

// 4. Crear un servicio (carga)
export async function crearServicio(servicioData) {
  const { data, error } = await supabase
    .from('maltese_servicios')
    .insert([servicioData])
    .select()
    .single();

  if (error) {
    console.error('Error al crear servicio:', error.message);
    return null;
  }
  return data;
}

// 5. Obtener todos los autos (para el panel del admin)
export async function obtenerTodosLosAutos() {
  const { data, error } = await supabase
    .from('maltese_autos')
    .select('*, maltese_servicios(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener autos:', error.message);
    return [];
  }
  return data;
}

// 6. Obtener servicios de un auto específico
export async function obtenerServiciosAuto(autoId) {
  const { data, error } = await supabase
    .from('maltese_servicios')
    .select('*')
    .eq('auto_id', autoId)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error al obtener servicios:', error.message);
    return [];
  }
  return data;
}

// 7. NUEVA: Actualizar datos de un auto
export async function actualizarAuto(autoId, datosNuevos) {
  const { data, error } = await supabase
    .from('maltese_autos')
    .update(datosNuevos)
    .eq('id', autoId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar auto:', error.message);
    return null;
  }
  return data;
}