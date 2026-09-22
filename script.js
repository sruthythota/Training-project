/**
 * Bloom & Bean Cafe — Interactive JavaScript
 * Handles smooth scrolling, scroll reveal, menu filtering, heart favorites,
 * gallery lightbox modal, mobile navigation drawer, and toast notifications.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------------------------
    // 1. Toast Notification Helper
    // --------------------------------------------------------------------------
    const toastContainer = document.getElementById('toast-container');

    /**
     * Displays a floating toast notification message.
     * @param {string} message - Text content to display
     * @param {string} icon - Emoji icon prefix
     */
    function showToast(message, icon = '🌸') {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-text">${message}</span>
    `;

        toastContainer.appendChild(toast);

        // Auto remove after 3.5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // --------------------------------------------------------------------------
    // 2. Sticky Navbar & Mobile Drawer
    // --------------------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky header background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
        highlightActiveNav();
    });

    // Toggle mobile navigation menu
    hamburgerBtn?.addEventListener('click', () => {
        const isOpen = navMenu?.classList.toggle('active');
        hamburgerBtn.classList.toggle('active');
        hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile navigation menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navMenu?.classList.remove('active');
            hamburgerBtn?.classList.remove('active');
            hamburgerBtn?.setAttribute('aria-expanded', 'false');

            // Smooth scroll target handling
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                const targetElem = document.querySelector(targetId);
                if (targetElem) {
                    e.preventDefault();
                    targetElem.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Highlight active nav item based on scroll section
    const sections = document.querySelectorAll('section[id]');
    function highlightActiveNav() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-link[href*="${sectionId}"]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-link[href*="${sectionId}"]`)?.classList.remove('active');
            }
        });
    }

    // --------------------------------------------------------------------------
    // 3. Scroll Reveal Animations (IntersectionObserver)
    // --------------------------------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Unobserve once revealed for smooth performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => scrollObserver.observe(el));

    // --------------------------------------------------------------------------
    // 4. Menu Category Filtering
    // --------------------------------------------------------------------------
    const tabBtns = document.querySelectorAll('.tab-btn');
    const menuCards = document.querySelectorAll('.menu-card');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Set active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            menuCards.forEach(card => {
                const category = card.getAttribute('data-category');

                // Smooth transition effect
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // --------------------------------------------------------------------------
    // 5. Interactive Buttons (Heart Favorite & Order Buttons)
    // --------------------------------------------------------------------------
    const heartBtns = document.querySelectorAll('.heart-btn');
    heartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.menu-card');
            const itemTitle = card?.querySelector('.card-title')?.textContent || 'item';
            const isLiked = btn.classList.toggle('liked');

            if (isLiked) {
                btn.querySelector('.heart-icon').textContent = '💖';
                showToast(`Saved "${itemTitle}" to your favorites!`, '💖');
            } else {
                btn.querySelector('.heart-icon').textContent = '🤍';
                showToast(`Removed "${itemTitle}" from favorites.`, '🌸');
            }
        });
    });

    const orderBtns = document.querySelectorAll('.order-btn');
    orderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const itemName = btn.getAttribute('data-name') || 'Item';
            showToast(`Added "${itemName}" to your order! ☕`, '✨');

            // Quick button pulse effect
            btn.style.transform = 'scale(1.1)';
            setTimeout(() => btn.style.transform = 'none', 200);
        });
    });

    // --------------------------------------------------------------------------
    // 6. Gallery Lightbox Modal
    // --------------------------------------------------------------------------
    const galleryCards = document.querySelectorAll('.gallery-card');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop');

    function openLightbox(src, title) {
        if (!lightboxModal || !lightboxImg) return;
        lightboxImg.src = src;
        lightboxImg.alt = title;
        if (lightboxTitle) lightboxTitle.textContent = title;

        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    }

    function closeLightbox() {
        if (!lightboxModal) return;
        lightboxModal.classList.remove('active');
        lightboxModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restore scroll
    }

    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            const fullSrc = card.getAttribute('data-fullsrc');
            const title = card.getAttribute('data-title') || 'Bloom & Bean Gallery';
            if (fullSrc) openLightbox(fullSrc, title);
        });
    });

    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxBackdrop?.addEventListener('click', closeLightbox);

    // Close modal on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal?.classList.contains('active')) {
            closeLightbox();
        }
    });

    // --------------------------------------------------------------------------
    // 7. Newsletter Subscription Handler
    // --------------------------------------------------------------------------
    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('email-input');

    newsletterForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput?.value.trim();

        if (email) {
            showToast('Welcome to the Coffee Club! 💌 Check your inbox for 15% off!', '🎉');
            emailInput.value = '';
        }
    });

    // Initial toast welcome after 1.5s
    setTimeout(() => {
        showToast('Welcome to Bloom & Bean Cafe! 🌸 Enjoy 15% off your first visit.', '☕');
    }, 1500);

});
