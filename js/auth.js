// js/auth.js

import { supabase } from './supabase-client.js';

// Iniciar sesión con Google
export async function loginConGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/panel.html'
    }
  });
  if (error) console.error('Error en login:', error.message);
}

// Cerrar sesión
export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error al cerrar sesión:', error.message);
  window.location.href = 'index.html';
}

// Verificar si el usuario está logueado
export async function obtenerUsuario() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Verificar si el usuario es Admin
export async function esAdmin() {
  const user = await obtenerUsuario();
  if (!user) return false;
  
  const { data, error } = await supabase
    .from('maltese_admins')
    .select('email')
    .eq('email', user.email)
    .single();

  if (error || !data) return false;
  return true;
}