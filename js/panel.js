// js/panel.js

import { supabase } from './supabase-client.js';
import { esAdmin, cerrarSesion, obtenerUsuario } from './auth.js';
import { subirFoto, buscarAuto, crearAuto, crearServicio, obtenerTodosLosAutos, obtenerServiciosAuto, actualizarAuto, borrarFoto } from './admin.js';
import { obtenerMisAutos, obtenerHistorial } from './cliente.js';

// Elementos del DOM
const loader = document.getElementById('loader');
const contenido = document.getElementById('contenido');
const vistaAdmin = document.getElementById('vista-admin');
const vistaDetalleAdmin = document.getElementById('vista-detalle-admin');
const vistaCliente = document.getElementById('vista-cliente');
const userEmailSpan = document.getElementById('user-email');
const btnLogout = document.getElementById('btn-logout');

const modalServicio = document.getElementById('modal-servicio');
const modalEditarTodo = document.getElementById('modal-editar-todo');
const modalImagenZoom = document.getElementById('modal-imagen-zoom');
const imagenZoomSrc = document.getElementById('imagen-zoom-src');
const btnCerrarZoom = document.getElementById('btn-cerrar-zoom');
const zoomPrev = document.getElementById('zoom-prev');
const zoomNext = document.getElementById('zoom-next');
const inputAgregarFotoExistente = document.getElementById('input-agregar-foto-existente');

// Variables de estado
let autoSeleccionado = null;
let listaAutosGlobal = [];
let servicioParaAgregarFoto = null;
let serviciosEditando = [];

// Estado del Zoom (Popup con array de fotos)
let fotosZoomActuales = [];
let indiceZoomActual = 0;

// Fotos del carrusel de la vista cliente (una por slot, siempre fija)
const FOTOS_CARRUSEL_CLIENTE = [
    'img/servicio1.jpg',
    'img/servicio2.png',
    'img/servicio3.png',
    'img/servicio4.png',
    'img/servicio5.png',
    'img/servicio6.png',
    'img/servicio7.png'
];

// 1. Inicialización
async function init() {
    const user = await obtenerUsuario();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    userEmailSpan.textContent = user.email;
    loader.classList.add('hidden');
    contenido.classList.remove('hidden');

    const admin = await esAdmin();

    if (admin) {
        vistaAdmin.classList.remove('hidden');
        cargarVistaAdmin();
    } else {
        vistaCliente.classList.remove('hidden');
        cargarVistaCliente(user.email);
    }
}

btnLogout.addEventListener('click', cerrarSesion);

// Lógica para el Zoom de Imágenes (Modal Pop-up con soporte de array y flechas)
window.abrirZoom = (url, arrayFotosStr = null) => {
    if (arrayFotosStr) {
        try {
            fotosZoomActuales = JSON.parse(arrayFotosStr);
        } catch (e) {
            fotosZoomActuales = [url];
        }
    } else {
        fotosZoomActuales = [url];
    }

    indiceZoomActual = fotosZoomActuales.indexOf(url);
    if (indiceZoomActual === -1) indiceZoomActual = 0;

    actualizarImagenZoom();
    modalImagenZoom.classList.remove('hidden');
    modalImagenZoom.classList.add('flex');
};

function actualizarImagenZoom() {
    if (fotosZoomActuales.length > 0) {
        imagenZoomSrc.src = fotosZoomActuales[indiceZoomActual];
        
        // Mostrar u ocultar flechas según si hay más de una foto
        if (fotosZoomActuales.length > 1) {
            zoomPrev.style.display = 'flex';
            zoomNext.style.display = 'flex';
        } else {
            zoomPrev.style.display = 'none';
            zoomNext.style.display = 'none';
        }
    }
}

if (zoomPrev) {
    zoomPrev.addEventListener('click', () => {
        if (fotosZoomActuales.length > 0) {
            indiceZoomActual = (indiceZoomActual - 1 + fotosZoomActuales.length) % fotosZoomActuales.length;
            actualizarImagenZoom();
        }
    });
}

if (zoomNext) {
    zoomNext.addEventListener('click', () => {
        if (fotosZoomActuales.length > 0) {
            indiceZoomActual = (indiceZoomActual + 1) % fotosZoomActuales.length;
            actualizarImagenZoom();
        }
    });
}

const cerrarZoomModal = () => {
    modalImagenZoom.classList.add('hidden');
    modalImagenZoom.classList.remove('flex');
    imagenZoomSrc.src = '';
    fotosZoomActuales = [];
    indiceZoomActual = 0;
};

if (btnCerrarZoom) {
    btnCerrarZoom.addEventListener('click', cerrarZoomModal);
}

if (modalImagenZoom) {
    modalImagenZoom.addEventListener('click', (e) => {
        if (e.target === modalImagenZoom) cerrarZoomModal();
    });
}

// Función global para desplazar contenedores de fotos horizontalmente con flechas en la tarjeta
window.scrollFotos = (contenedorId, direccion) => {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    const scrollAmount = 220;
    contenedor.scrollBy({
        left: direccion === 'izquierda' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
    });
};

// 2. Lógica ADMIN - Lista
async function cargarVistaAdmin() {
    const autos = await obtenerTodosLosAutos();
    listaAutosGlobal = autos;
    
    document.getElementById('input-buscador').addEventListener('input', (e) => {
        const texto = e.target.value.toLowerCase();
        const filtrados = listaAutosGlobal.filter(auto => 
            auto.patente.toLowerCase().includes(texto) ||
            auto.nombre_cliente.toLowerCase().includes(texto) ||
            auto.email_cliente.toLowerCase().includes(texto) ||
            auto.marca.toLowerCase().includes(texto) ||
            auto.modelo.toLowerCase().includes(texto)
        );
        renderizarListaAdmin(filtrados);
    });

    renderizarListaAdmin(autos);
}

function renderizarListaAdmin(autos) {
    const lista = document.getElementById('lista-autos-admin');
    lista.innerHTML = '';

    if (autos.length === 0) {
        lista.innerHTML = '<div class="p-8 text-zinc-500 text-center text-sm">No se encontraron autos con ese criterio.</div>';
        return;
    }

    autos.forEach(auto => {
        const div = document.createElement('div');
        div.className = 'p-6 hover:bg-[#1a1a1a] transition cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-2 border-transparent hover:border-yellow-400';
        
        const cantServicios = auto.maltese_servicios ? auto.maltese_servicios.length : 0;

        div.innerHTML = `
            <div>
                <h3 class="font-medium text-lg text-white">${auto.marca} ${auto.modelo} (${auto.anio})</h3>
                <p class="text-zinc-500 text-sm mt-1">Patente: <span class="font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-xs">${auto.patente}</span></p>
                <p class="text-zinc-600 text-sm mt-1">Cliente: ${auto.nombre_cliente} (${auto.email_cliente})</p>
                <p class="text-zinc-400 text-xs mt-2 tracking-widest uppercase">${cantServicios} servicio(s) registrado(s)</p>
            </div>
            <div class="text-zinc-400 text-sm tracking-widest uppercase">Ver detalle &rarr;</div>
        `;
        
        div.addEventListener('click', () => abrirDetalleAdmin(auto));
        lista.appendChild(div);
    });
}

// 3. Lógica ADMIN - Detalle
async function abrirDetalleAdmin(auto) {
    vistaAdmin.classList.add('hidden');
    vistaDetalleAdmin.classList.remove('hidden');
    autoSeleccionado = auto;

    document.getElementById('detalle-titulo').textContent = `${auto.marca} ${auto.modelo} (${auto.anio})`;
    document.getElementById('detalle-patente').textContent = `Patente: ${auto.patente}`;
    document.getElementById('detalle-cliente').textContent = `Cliente: ${auto.nombre_cliente} (${auto.email_cliente})`;

    const historial = await obtenerServiciosAuto(auto.id);
    const contenedor = document.getElementById('detalle-historial');
    contenedor.innerHTML = '';

    if (historial.length === 0) {
        contenedor.innerHTML = '<p class="text-zinc-500 text-sm italic">No hay servicios registrados para este auto.</p>';
        return;
    }

    historial.forEach((serv, idx) => {
        let fotosHtml = '';
        if (serv.fotos && serv.fotos.length > 0) {
            const contenedorId = `admin-fotos-${serv.id}-${idx}`;
            const arrayFotosJson = JSON.stringify(serv.fotos).replace(/"/g, '&quot;');
            
            const botonesNavegacion = serv.fotos.length > 1 ? `
                <button onclick="scrollFotos('${contenedorId}', 'izquierda')" class="absolute left-1 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white rounded-full w-7 h-7 flex items-center justify-center text-sm z-10 border border-zinc-700 shadow">&larr;</button>
                <button onclick="scrollFotos('${contenedorId}', 'derecha')" class="absolute right-1 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white rounded-full w-7 h-7 flex items-center justify-center text-sm z-10 border border-zinc-700 shadow">&rarr;</button>
            ` : '';

            fotosHtml = `
                <div class="relative mt-4 group/slider">
                    ${botonesNavegacion}
                    <div id="${contenedorId}" class="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                        ${serv.fotos.map(url => `
                            <div class="relative group flex-shrink-0">
                                <img src="${url}" class="h-28 w-28 object-cover rounded border border-zinc-700 cursor-pointer hover:opacity-90 transition" onclick="abrirZoom('${url}', '${arrayFotosJson}')">
                                <button onclick="eliminarFoto('${url}', '${serv.id}', '${auto.id}')" class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold shadow">&times;</button>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        }

        const div = document.createElement('div');
        div.className = 'border-l-2 border-zinc-700 pl-4 py-2';
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <span class="text-sm font-medium text-white">${new Date(serv.fecha).toLocaleDateString('es-AR')}</span>
                    <span class="text-xs text-zinc-500 ml-2">| ${serv.kilometros} km</span>
                </div>
                <!-- BOTÓN SUBIR FOTO CON BORDE AMARILLO -->
                <button onclick="abrirInputFoto('${serv.id}')" class="text-xs text-yellow-400 border border-yellow-400 px-2 py-1 rounded transition-colors hover:bg-yellow-400 hover:text-black">
                    + Subir Foto
                </button>
            </div>
            <p class="text-zinc-300 text-sm whitespace-pre-wrap">${serv.servicio}</p>
            ${fotosHtml}
        `;
        contenedor.appendChild(div);
    });
}

document.getElementById('btn-volver-lista').addEventListener('click', () => {
    vistaDetalleAdmin.classList.add('hidden');
    vistaAdmin.classList.remove('hidden');
    autoSeleccionado = null;
    document.getElementById('input-buscador').value = '';
    cargarVistaAdmin();
});

// 4. Lógica CLIENTE
async function cargarVistaCliente(email) {
    iniciarCarruselCliente();

    const autos = await obtenerMisAutos();
    const lista = document.getElementById('lista-autos-cliente');
    lista.innerHTML = '';

    if (autos.length === 0) {
        lista.innerHTML = '<div class="bg-[#111111] border border-zinc-800 p-8 rounded-lg text-center text-zinc-500">No tenés vehículos registrados a tu nombre todavía.</div>';
        return;
    }

    for (const auto of autos) {
        const servicios = await obtenerHistorial(auto.id);
        
        const div = document.createElement('div');
        div.className = 'bg-[#111111] border border-zinc-800 rounded-lg overflow-hidden mb-8';
        
        let serviciosHtml = '';
        if (servicios.length === 0) {
            serviciosHtml = '<p class="text-zinc-500 text-sm italic">No hay servicios registrados.</p>';
        } else {
            servicios.forEach((serv, idx) => {
                let fotosHtml = '';
                if (serv.fotos && serv.fotos.length > 0) {
                    const contenedorId = `cliente-fotos-${serv.id}-${idx}`;
                    const arrayFotosJson = JSON.stringify(serv.fotos).replace(/"/g, '&quot;');
                    
                    const botonesNavegacion = serv.fotos.length > 1 ? `
                        <button onclick="scrollFotos('${contenedorId}', 'izquierda')" class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-base z-10 border border-zinc-700 shadow-lg">&larr;</button>
                        <button onclick="scrollFotos('${contenedorId}', 'derecha')" class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-base z-10 border border-zinc-700 shadow-lg">&rarr;</button>
                    ` : '';

                    fotosHtml = `
                        <div class="relative group/slider mt-2">
                            ${botonesNavegacion}
                            <div id="${contenedorId}" class="flex gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
                                ${serv.fotos.map(url => `
                                    <div class="flex-shrink-0 w-64 h-64 sm:w-72 sm:h-72 overflow-hidden rounded-lg bg-zinc-900 border border-zinc-700">
                                        <img src="${url}" class="w-full h-full object-cover cursor-pointer hover:scale-105 transition duration-300" onclick="abrirZoom('${url}', '${arrayFotosJson}')" alt="Foto de servicio">
                                    </div>
                                `).join('')}
                            </div>
                        </div>`;
                } else {
                    fotosHtml = '<div class="flex items-center justify-center h-48 bg-[#161616] border border-zinc-800 rounded-lg text-zinc-600 text-xs tracking-widest uppercase">Sin imágenes para este servicio</div>';
                }

                serviciosHtml += `
                    <div class="border-b border-zinc-800 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
                        <div class="md:grid md:grid-cols-2 md:gap-8 items-start">
                            <!-- Columna Izquierda: Información y texto del servicio -->
                            <div class="space-y-3 mb-4 md:mb-0">
                                <div class="flex items-center space-x-2">
                                    <span class="text-sm font-medium text-white bg-zinc-800 px-2.5 py-1 rounded">${new Date(serv.fecha).toLocaleDateString('es-AR')}</span>
                                    <span class="text-xs text-zinc-400 font-mono">${serv.kilometros} km</span>
                                </div>
                                <div class="bg-[#161616] border border-zinc-800/80 p-4 rounded-lg">
                                    <p class="text-xs tracking-widest text-zinc-500 uppercase mb-1">Trabajo realizado</p>
                                    <p class="text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed">${serv.servicio}</p>
                                </div>
                            </div>

                            <!-- Columna Derecha: Fotos con scroll horizontal -->
                            <div>
                                <p class="text-xs tracking-widest text-zinc-500 uppercase mb-2">Registros fotográficos</p>
                                ${fotosHtml}
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        div.innerHTML = `
            <div class="bg-[#1a1a1a] border-b border-zinc-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 class="font-light text-2xl text-white tracking-wide">${auto.marca} ${auto.modelo}</h3>
                    <p class="text-zinc-400 text-sm mt-1">Patente: <span class="font-mono text-zinc-200">${auto.patente}</span> | Año: ${auto.anio}</p>
                </div>
            </div>
            <div class="p-6">
                <h4 class="text-xs tracking-widest text-zinc-500 uppercase mb-6 pb-2 border-b border-zinc-800">Historial y Ficha Técnica</h4>
                <div class="space-y-6">
                    ${serviciosHtml}
                </div>
            </div>
        `;
        lista.appendChild(div);
    }
}

// 4.b Carrusel de fotos en la vista cliente (7 slots, cada uno con su foto fija que prende y apaga)
function iniciarCarruselCliente() {
    const slots = document.querySelectorAll('#carrusel-cliente img[data-slot]');
    if (slots.length === 0 || FOTOS_CARRUSEL_CLIENTE.length === 0) return;

    const totalSlots = Math.min(slots.length, FOTOS_CARRUSEL_CLIENTE.length);

    for (let i = 0; i < totalSlots; i++) {
        const img = slots[i];
        const fotoFija = FOTOS_CARRUSEL_CLIENTE[i];

        // Cada slot muestra SIEMPRE su misma foto
        img.src = fotoFija;

        // Transición de opacidad lenta (coincide con el CSS: duration-1000 → 1s por paso)
        img.style.transition = 'opacity 2.5s ease-in-out';

        // Intervalo largo y aleatorio para que no se sincronicen (árbol de navidad)
        const intervalo = 9000 + Math.random() * 7000; // entre 9s y 16s
        const duracionFade = 2500; // 2.5s para el fade out, igual para el fade in

        setInterval(() => {
            img.style.opacity = '0';
            setTimeout(() => {
                img.style.opacity = '1';
            }, duracionFade);
        }, intervalo);
    }
}

// 5. Modal Servicio (Carga Simple)
function abrirModalServicio(esNuevoAuto = true, auto = null) {
    modalServicio.classList.remove('hidden');
    modalServicio.classList.add('flex');
    document.getElementById('form-servicio').reset();
    document.getElementById('input-fecha').valueAsDate = new Date();
    document.getElementById('modal-titulo-servicio').textContent = esNuevoAuto ? "Cargar Servicio Nuevo" : "Agregar Servicio a este Auto";

    const inputs = ['input-patente', 'input-email', 'input-nombre', 'input-marca', 'input-modelo', 'input-anio'];
    
    if (esNuevoAuto) {
        document.getElementById('seccion-datos-auto').classList.remove('hidden');
        inputs.forEach(id => document.getElementById(id).required = true);
    } else if (auto) {
        document.getElementById('seccion-datos-auto').classList.add('hidden');
        inputs.forEach(id => document.getElementById(id).required = false);
    }
}

document.getElementById('btn-nuevo-servicio').addEventListener('click', () => abrirModalServicio(true));
document.getElementById('btn-agregar-a-este-auto').addEventListener('click', () => abrirModalServicio(false, autoSeleccionado));

document.getElementById('btn-cerrar-modal').addEventListener('click', () => {
    modalServicio.classList.add('hidden');
    modalServicio.classList.remove('flex');
});

// 6. Guardar Servicio (Desde el modal simple)
document.getElementById('form-servicio').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnGuardar = document.getElementById('btn-guardar-servicio');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
        let autoId = autoSeleccionado ? autoSeleccionado.id : null;

        if (!autoId) {
            const autoData = {
                patente: document.getElementById('input-patente').value.toUpperCase().trim(),
                email_cliente: document.getElementById('input-email').value.toLowerCase().trim(),
                nombre_cliente: document.getElementById('input-nombre').value.trim(),
                marca: document.getElementById('input-marca').value.trim(),
                modelo: document.getElementById('input-modelo').value.trim(),
                anio: parseInt(document.getElementById('input-anio').value)
            };

            const autoExistente = await buscarAuto(autoData.patente);
            
            if (autoExistente) {
                autoId = autoExistente.id;
            } else {
                const nuevoAuto = await crearAuto(autoData);
                if (!nuevoAuto) throw new Error("No se pudo crear el auto");
                autoId = nuevoAuto.id;
            }
        }

        const fileInput = document.getElementById('input-fotos');
        let urlsFotos = [];
        if (fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
                const url = await subirFoto(fileInput.files[i]);
                if (url) urlsFotos.push(url);
            }
        }

        const servicioData = {
            auto_id: autoId,
            fecha: document.getElementById('input-fecha').value,
            kilometros: parseInt(document.getElementById('input-km').value),
            servicio: document.getElementById('input-servicio').value.trim(),
            fotos: urlsFotos
        };

        await crearServicio(servicioData);

        alert('Servicio guardado correctamente');
        modalServicio.classList.add('hidden');
        modalServicio.classList.remove('flex');
        
        if (autoSeleccionado) {
            abrirDetalleAdmin(autoSeleccionado);
        } else {
            cargarVistaAdmin();
        }

    } catch (error) {
        console.error(error);
        alert('Error al guardar: ' + error.message);
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar Servicio';
    }
});

// 7. Editar Todo (Auto + Servicios)
document.getElementById('btn-editar-todo').addEventListener('click', async () => {
    if (!autoSeleccionado) return;

    document.getElementById('edit-patente').value = autoSeleccionado.patente;
    document.getElementById('edit-email').value = autoSeleccionado.email_cliente;
    document.getElementById('edit-nombre').value = autoSeleccionado.nombre_cliente;
    document.getElementById('edit-marca').value = autoSeleccionado.marca;
    document.getElementById('edit-modelo').value = autoSeleccionado.modelo;
    document.getElementById('edit-anio').value = autoSeleccionado.anio;

    const historial = await obtenerServiciosAuto(autoSeleccionado.id);
    serviciosEditando = historial;
    const listaServicios = document.getElementById('edit-lista-servicios');
    listaServicios.innerHTML = '';

    if (historial.length === 0) {
        listaServicios.innerHTML = '<p class="text-zinc-500 text-sm italic">No hay servicios registrados para este auto.</p>';
    } else {
        historial.forEach((serv, index) => {
            const div = document.createElement('div');
            div.className = 'bg-[#0a0a0a] p-4 rounded border border-zinc-800 space-y-3 mb-4';
            div.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-xs text-zinc-500 uppercase tracking-widest">Servicio ${index + 1}</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[10px] text-zinc-500 mb-1">Fecha</label>
                        <input type="date" value="${serv.fecha}" data-servicio-id="${serv.id}" class="edit-serv-fecha w-full bg-[#111] border border-zinc-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:border-zinc-400">
                    </div>
                    <div>
                        <label class="block text-[10px] text-zinc-500 mb-1">Kilómetros</label>
                        <input type="number" value="${serv.kilometros}" data-servicio-id="${serv.id}" class="edit-serv-km w-full bg-[#111] border border-zinc-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:border-zinc-400">
                    </div>
                </div>
                <div>
                    <label class="block text-[10px] text-zinc-500 mb-1">Servicio Realizado</label>
                    <textarea data-servicio-id="${serv.id}" class="edit-serv-texto w-full bg-[#111] border border-zinc-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:border-zinc-400" rows="2">${serv.servicio}</textarea>
                </div>
            `;
            listaServicios.appendChild(div);
        });
    }

    modalEditarTodo.classList.remove('hidden');
    modalEditarTodo.classList.add('flex');
});

document.getElementById('btn-cerrar-modal-editar-todo').addEventListener('click', () => {
    modalEditarTodo.classList.add('hidden');
    modalEditarTodo.classList.remove('flex');
});

// 8. Guardar Todo (Auto + Servicios)
document.getElementById('form-editar-todo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnGuardar = document.getElementById('btn-guardar-todo');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
        const datosAutoNuevos = {
            patente: document.getElementById('edit-patente').value.toUpperCase().trim(),
            email_cliente: document.getElementById('edit-email').value.toLowerCase().trim(),
            nombre_cliente: document.getElementById('edit-nombre').value.trim(),
            marca: document.getElementById('edit-marca').value.trim(),
            modelo: document.getElementById('edit-modelo').value.trim(),
            anio: parseInt(document.getElementById('edit-anio').value)
        };
        await actualizarAuto(autoSeleccionado.id, datosAutoNuevos);

        const inputsFecha = document.querySelectorAll('.edit-serv-fecha');
        const inputsKm = document.querySelectorAll('.edit-serv-km');
        const inputsTexto = document.querySelectorAll('.edit-serv-texto');

        for (let i = 0; i < inputsFecha.length; i++) {
            const id = inputsFecha[i].getAttribute('data-servicio-id');
            await supabase
                .from('maltese_servicios')
                .update({
                    fecha: inputsFecha[i].value,
                    kilometros: parseInt(inputsKm[i].value),
                    servicio: inputsTexto[i].value.trim()
                })
                .eq('id', id);
        }

        alert('Todo actualizado correctamente');
        modalEditarTodo.classList.add('hidden');
        modalEditarTodo.classList.remove('flex');
        
        autoSeleccionado = { ...autoSeleccionado, ...datosAutoNuevos };
        abrirDetalleAdmin(autoSeleccionado);

    } catch (error) {
        console.error(error);
        alert('Error al guardar: ' + error.message);
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar Todos los Cambios';
    }
});

// 9. Eliminar Foto
window.eliminarFoto = async (url, servicioId, autoId) => {
    if (!confirm('¿Estás seguro de que querés borrar esta foto?')) return;

    try {
        const exito = await borrarFoto(url);
        if (!exito) throw new Error('No se pudo borrar la foto del almacenamiento');

        const { data: servicio, error } = await supabase
            .from('maltese_servicios')
            .select('fotos')
            .eq('id', servicioId)
            .single();
        
        if (error) throw error;

        const fotosActualizadas = servicio.fotos.filter(f => f !== url);

        await supabase
            .from('maltese_servicios')
            .update({ fotos: fotosActualizadas })
            .eq('id', servicioId);

        const autoActual = listaAutosGlobal.find(a => a.id === autoId);
        if (autoActual) abrirDetalleAdmin(autoActual);

    } catch (error) {
        console.error(error);
        alert('Error al borrar la foto: ' + error.message);
    }
};

// 10. Agregar Foto a Servicio Existente
window.abrirInputFoto = (servicioId) => {
    servicioParaAgregarFoto = servicioId;
    inputAgregarFotoExistente.click();
};

inputAgregarFotoExistente.addEventListener('change', async (e) => {
    if (!e.target.files.length || !servicioParaAgregarFoto) return;

    const btnSubir = document.querySelector(`button[onclick="abrirInputFoto('${servicioParaAgregarFoto}')"]`);
    if(btnSubir) btnSubir.textContent = 'Subiendo...';

    try {
        const nuevasUrls = [];
        for (let i = 0; i < e.target.files.length; i++) {
            const url = await subirFoto(e.target.files[i]);
            if (url) nuevasUrls.push(url);
        }

        const { data: servicio, error } = await supabase
            .from('maltese_servicios')
            .select('fotos')
            .eq('id', servicioParaAgregarFoto)
            .single();
        
        if (error) throw error;

        const fotosActuales = servicio.fotos || [];
        const fotosActualizadas = [...fotosActuales, ...nuevasUrls];

        await supabase
            .from('maltese_servicios')
            .update({ fotos: fotosActualizadas })
            .eq('id', servicioParaAgregarFoto);

        const autoActual = listaAutosGlobal.find(a => a.id === autoSeleccionado.id);
        if (autoActual) abrirDetalleAdmin(autoActual);

    } catch (error) {
        console.error(error);
        alert('Error al subir fotos: ' + error.message);
    } finally {
        inputAgregarFotoExistente.value = '';
        servicioParaAgregarFoto = null;
    }
});

// Ejecutar
init();