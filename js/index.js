// js/index.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. LÓGICA DEL SLIDER ---
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function nextSlide() {
        slides[currentSlide].classList.remove('opacity-100');
        slides[currentSlide].classList.add('opacity-0');
        
        currentSlide = (currentSlide + 1) % slides.length;
        
        slides[currentSlide].classList.remove('opacity-0');
        slides[currentSlide].classList.add('opacity-100');
    }

    // Cambia de foto cada 5 segundos (5000 ms)
    setInterval(nextSlide, 5000);

    // --- 2. LÓGICA DEL MENÚ IZQUIERDO ---
    const btnMenu = document.getElementById('btn-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const btnCerrarMenu = document.getElementById('btn-cerrar-menu');

    btnMenu.addEventListener('click', () => {
        menuOverlay.classList.remove('hidden');
        // Pequeño delay para que la transición de opacidad funcione
        setTimeout(() => {
            menuOverlay.classList.remove('opacity-0');
            menuOverlay.classList.add('opacity-100');
        }, 10);
    });

    btnCerrarMenu.addEventListener('click', () => {
        menuOverlay.classList.remove('opacity-100');
        menuOverlay.classList.add('opacity-0');
        setTimeout(() => {
            menuOverlay.classList.add('hidden');
        }, 300); // Espera a que termine la transición
    });

    // --- 3. LÓGICA DEL MENÚ DERECHO (CONTACTO) ---
    const btnContacto = document.getElementById('btn-contacto');
    const contactoOverlay = document.getElementById('contacto-overlay');
    const btnCerrarContacto = document.getElementById('btn-cerrar-contacto');

    btnContacto.addEventListener('click', () => {
        contactoOverlay.classList.remove('hidden');
        setTimeout(() => {
            contactoOverlay.classList.remove('opacity-0');
            contactoOverlay.classList.add('opacity-100');
        }, 10);
    });

    btnCerrarContacto.addEventListener('click', () => {
        contactoOverlay.classList.remove('opacity-100');
        contactoOverlay.classList.add('opacity-0');
        setTimeout(() => {
            contactoOverlay.classList.add('hidden');
        }, 300);
    });
});