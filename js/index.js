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
    let speed = 0.5;
    let isPaused = false;

    if (track) {
        track.addEventListener('mouseenter', () => isPaused = true);
        track.addEventListener('mouseleave', () => isPaused = false);
    }

    function animarCarrusel() {
        if (!track || items.length === 0) return;

        if (!isPaused) {
            scrollAmount += speed;
            
            let mitadDelTrack = 0;
            for (let i = 0; i < items.length / 2; i++) {
                mitadDelTrack += items[i].offsetWidth + 24;
            }

            if (scrollAmount >= mitadDelTrack) {
                scrollAmount = 0;
            }
            
            track.style.transform = `translateX(-${scrollAmount}px)`;
        }
        requestAnimationFrame(animarCarrusel);
    }
    
    requestAnimationFrame(animarCarrusel);

    // --- 3. MENÚ IZQUIERDO ---
    const btnMenu = document.getElementById('btn-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const btnCerrarMenu = document.getElementById('btn-cerrar-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const cerrarMenu = () => {
        menuOverlay.classList.remove('opacity-100');
        menuOverlay.classList.add('opacity-0');
        setTimeout(() => {
            menuOverlay.classList.add('hidden');
        }, 300);
    };

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
        btnCerrarMenu.addEventListener('click', cerrarMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            cerrarMenu();
        });
    });

    // --- 4. MENÚ DERECHO (CONTACTO Y DESPLEGABLES) ---
    const btnContacto = document.getElementById('btn-contacto');
    const contactoOverlay = document.getElementById('contacto-overlay');
    const btnCerrarContacto = document.getElementById('btn-cerrar-contacto');

    const infoWsp = document.getElementById('info-wsp');
    const infoMail = document.getElementById('info-mail');
    const infoTel = document.getElementById('info-tel');

    const btnToggleWsp = document.getElementById('btn-toggle-wsp');
    const btnToggleMail = document.getElementById('btn-toggle-mail');
    const btnToggleTel = document.getElementById('btn-toggle-tel');

    const cerrarTodosLosDesplegables = () => {
        if (infoWsp) infoWsp.classList.add('hidden');
        if (infoMail) infoMail.classList.add('hidden');
        if (infoTel) infoTel.classList.add('hidden');
    };

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
                cerrarTodosLosDesplegables();
            }, 300);
        });
    }

    // Toggle desplegable WhatsApp
    if (btnToggleWsp && infoWsp) {
        btnToggleWsp.addEventListener('click', () => {
            const estaOculto = infoWsp.classList.contains('hidden');
            cerrarTodosLosDesplegables();
            if (estaOculto) infoWsp.classList.remove('hidden');
        });
    }

    // Toggle desplegable Mail
    if (btnToggleMail && infoMail) {
        btnToggleMail.addEventListener('click', () => {
            const estaOculto = infoMail.classList.contains('hidden');
            cerrarTodosLosDesplegables();
            if (estaOculto) infoMail.classList.remove('hidden');
        });
    }

    // Toggle desplegable Teléfono
    if (btnToggleTel && infoTel) {
        btnToggleTel.addEventListener('click', () => {
            const estaOculto = infoTel.classList.contains('hidden');
            cerrarTodosLosDesplegables();
            if (estaOculto) infoTel.classList.remove('hidden');
        });
    }

    // Copiar Mail
    const btnCopiarMail = document.getElementById('btn-copiar-mail');
    const textoMail = document.getElementById('texto-mail');
    if (btnCopiarMail && textoMail) {
        btnCopiarMail.addEventListener('click', () => {
            navigator.clipboard.writeText(textoMail.textContent.trim());
            btnCopiarMail.textContent = '¡Copiado!';
            setTimeout(() => {
                btnCopiarMail.textContent = 'Copiar Mail';
            }, 2000);
        });
    }

    // Copiar Teléfono
    const btnCopiarTel = document.getElementById('btn-copiar-tel');
    const textoTel = document.getElementById('texto-tel');
    if (btnCopiarTel && textoTel) {
        btnCopiarTel.addEventListener('click', () => {
            navigator.clipboard.writeText(textoTel.textContent.trim());
            btnCopiarTel.textContent = '¡Copiado!';
            setTimeout(() => {
                btnCopiarTel.textContent = 'Copiar Teléfono';
            }, 2000);
        });
    }
});