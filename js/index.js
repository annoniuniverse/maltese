// js/index.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SLIDER DE FONDO (HOME) ---
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function nextSlide() {
        if (slides.length === 0) return;
        slides[currentSlide].classList.remove('opacity-100');
        slides[currentSlide].classList.add('opacity-0');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.remove('opacity-0');
        slides[currentSlide].classList.add('opacity-100');
    }
    setInterval(nextSlide, 5000);

    // --- 2. CARRUSEL DE SERVICIOS (FLUJO CONTINUO SUAVE) ---
    const track = document.getElementById('carrusel-track');
    const items = document.querySelectorAll('.carrusel-item');
    let scrollAmount = 0;
    let speed = 0.5; // Velocidad del desplazamiento (0.5 = lento y elegante, 1 = más rápido)
    let isPaused = false;

    // Pausar el movimiento si el usuario pone el mouse encima (opcional, pero queda bien)
    if (track) {
        track.addEventListener('mouseenter', () => isPaused = true);
        track.addEventListener('mouseleave', () => isPaused = false);
    }

    function animarCarrusel() {
        if (!track || items.length === 0) return;

        if (!isPaused) {
            scrollAmount += speed;
            
            // Calculamos el ancho total de la primera mitad de las fotos (las originales)
            let mitadDelTrack = 0;
            for (let i = 0; i < items.length / 2; i++) {
                mitadDelTrack += items[i].offsetWidth + 24; // 24px es el gap
            }

            // Si llegamos a la mitad, reiniciamos a 0 de golpe (como son iguales, el ojo no lo nota)
            if (scrollAmount >= mitadDelTrack) {
                scrollAmount = 0;
            }
            
            track.style.transform = `translateX(-${scrollAmount}px)`;
        }
        requestAnimationFrame(animarCarrusel);
    }
    
    // Iniciar animación
    requestAnimationFrame(animarCarrusel);

    // --- 3. MENÚ IZQUIERDO ---
    const btnMenu = document.getElementById('btn-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const btnCerrarMenu = document.getElementById('btn-cerrar-menu');

    if (btnMenu) {
        btnMenu.addEventListener('click', () => {
            menuOverlay.classList.remove('hidden');
            setTimeout(() => {
                menuOverlay.classList.remove('opacity-0');
                menuOverlay.classList.add('opacity-100');
            }, 10);
        });
    }

    if (btnCerrarMenu) {
        btnCerrarMenu.addEventListener('click', () => {
            menuOverlay.classList.remove('opacity-100');
            menuOverlay.classList.add('opacity-0');
            setTimeout(() => {
                menuOverlay.classList.add('hidden');
            }, 300);
        });
    }

    // --- 4. MENÚ DERECHO (CONTACTO) ---
    const btnContacto = document.getElementById('btn-contacto');
    const contactoOverlay = document.getElementById('contacto-overlay');
    const btnCerrarContacto = document.getElementById('btn-cerrar-contacto');

    if (btnContacto) {
        btnContacto.addEventListener('click', () => {
            contactoOverlay.classList.remove('hidden');
            setTimeout(() => {
                contactoOverlay.classList.remove('opacity-0');
                contactoOverlay.classList.add('opacity-100');
            }, 10);
        });
    }

    if (btnCerrarContacto) {
        btnCerrarContacto.addEventListener('click', () => {
            contactoOverlay.classList.remove('opacity-100');
            contactoOverlay.classList.add('opacity-0');
            setTimeout(() => {
                contactoOverlay.classList.add('hidden');
            }, 300);
        });
    }
});