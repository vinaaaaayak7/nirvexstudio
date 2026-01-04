// Main JavaScript for PenguinStudios

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const mobileMQ = window.matchMedia('(max-width: 768px)');
    const isMobile = () => mobileMQ.matches;
    const clearDesktopNavStyles = () => {
        if (!navMenu) return;
        navMenu.removeAttribute('style');
        navMenu.classList.remove('active');
        if (navToggle) {
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    };

    if (navToggle && navMenu) {
        const openMenu = () => {
            if (!isMobile()) return; // guard: only apply mobile drawer behavior
            navMenu.classList.add('active');
            navToggle.classList.add('active');
            navToggle.setAttribute('aria-expanded', 'true');
            // Force visible inline to bypass conflicting CSS (mobile only)
            navMenu.style.position = 'fixed';
            navMenu.style.left = '12px';
            navMenu.style.right = '12px';
            navMenu.style.top = 'calc(var(--nav-height) + 10px)';
            navMenu.style.display = 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.opacity = '1';
            navMenu.style.pointerEvents = 'auto';
            navMenu.style.zIndex = '10000';
            navMenu.style.transition = 'none';
        };
        const closeMenu = () => {
            if (!isMobile()) return; // guard: do not hide desktop nav
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            // Hide inline to bypass conflicting CSS (mobile only)
            navMenu.style.opacity = '0';
            navMenu.style.pointerEvents = 'none';
            navMenu.style.display = 'none';
        };
        const toggleMenu = (e) => {
            if (e) { e.preventDefault && e.preventDefault(); e.stopPropagation && e.stopPropagation(); }
            if (navMenu.classList.contains('active')) closeMenu(); else openMenu();
        };

        // Support click + pointer reliably on mobile (avoid double toggle)
        let lastToggleAt = 0;
        const markToggle = () => { lastToggleAt = Date.now(); };
        const isFollowupClick = () => (Date.now() - lastToggleAt) < 400;

        navToggle.addEventListener('pointerup', (e) => {
            if (e.pointerType === 'touch' || e.pointerType === 'pen') {
                e.preventDefault();
                e.stopPropagation();
                toggleMenu(e);
                markToggle();
            }
        }, { passive: false });

        navToggle.addEventListener('click', (e) => {
            if (isFollowupClick()) { e.preventDefault(); e.stopPropagation(); return; }
            e.preventDefault();
            e.stopPropagation();
            toggleMenu(e);
            markToggle();
        }, { passive: false });

        // Prevent outside-click handler from firing when interacting with the menu
        navMenu.addEventListener('click', (e) => e.stopPropagation());
        navMenu.addEventListener('touchstart', (e) => e.stopPropagation());

        // Close menu when clicking outside (mobile only and only if open)
        document.addEventListener('click', function(e) {
            if (!isMobile()) return;
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeMenu();
        });

        // Ensure desktop state has no leftover inline styles and watch breakpoint changes
        if (!isMobile()) {
            clearDesktopNavStyles();
        }
        if (mobileMQ && mobileMQ.addEventListener) {
            mobileMQ.addEventListener('change', (ev) => {
                if (!ev.matches) {
                    clearDesktopNavStyles();
                }
            });
        } else {
            window.addEventListener('resize', () => {
                if (!isMobile()) clearDesktopNavStyles();
            });
        }
    }

    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const rootStyles = getComputedStyle(document.documentElement);
                const navHeightVar = rootStyles.getPropertyValue('--nav-height').trim();
                const navHeight = parseInt(navHeightVar || '64', 10);
                const rect = targetSection.getBoundingClientRect();
                const offsetTop = window.pageYOffset + rect.top - navHeight;

                window.scrollTo({
                    top: Math.max(offsetTop, 0),
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (navMenu && navToggle) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    if (typeof isMobile === 'function' && isMobile()) {
                        navMenu.style.opacity = '0';
                        navMenu.style.pointerEvents = 'none';
                        navMenu.style.display = 'none';
                    } else {
                        navMenu.removeAttribute('style');
                    }
                }
            }
        });
    });

    // Active navigation link on scroll
    const sections = document.querySelectorAll('section[id]');
    
    function setActiveNav() {
        const scrollY = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Clear all active states first
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Check if at bottom of page for Support section
        if (scrollY + windowHeight >= documentHeight - 50) {
            const supportLink = document.querySelector('.nav-link[href="#support"]');
            if (supportLink) {
                supportLink.classList.add('active');
                return;
            }
        }

        // Regular section detection
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                }
            }
        });
    }

    // Improve scroll performance with rAF throttling
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                setActiveNav();
                updateNavbar();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll, .animate-on-scroll-left, .animate-on-scroll-right');
    animatedElements.forEach(el => observer.observe(el));

    // Portfolio filtering + pagination (9 per page)
    const PAGE_SIZE = 9;
    const filterButtons = document.querySelectorAll('.filter-btn');
    const allPortfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));
    const paginationEl = document.getElementById('portfolioPagination');

    const state = { filter: 'all', page: 1, totalPages: 1 };

    function getFilteredItems() {
        if (state.filter === 'all') return allPortfolioItems;
        return allPortfolioItems.filter(it => it.getAttribute('data-category') === state.filter);
    }

    function renderPagination() {
        if (!paginationEl) return;
        const totalItems = getFilteredItems().length;
        state.totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

        if (state.totalPages <= 1) {
            paginationEl.innerHTML = '';
            paginationEl.style.display = 'none';
            return;
        }

        paginationEl.style.display = 'flex';
        paginationEl.innerHTML = '';
        for (let i = 1; i <= state.totalPages; i++) {
            const dot = document.createElement('button');
            dot.className = 'page-dot' + (i === state.page ? ' active' : '');
            dot.type = 'button';
            dot.setAttribute('aria-label', `Go to page ${i}`);
            dot.dataset.page = String(i);
            paginationEl.appendChild(dot);
        }
    }

    function applyFilterAndPagination() {
        const filtered = getFilteredItems();
        const start = (state.page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const visible = new Set(filtered.slice(start, end));

        allPortfolioItems.forEach(item => {
            if (visible.has(item)) {
                item.style.removeProperty('display');
                requestAnimationFrame(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                });
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 200);
            }
        });

        renderPagination();
    }

    // Wire up filters
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            state.filter = this.getAttribute('data-filter') || 'all';
            state.page = 1;

            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            applyFilterAndPagination();
        });
    });

    // Pagination click handler
    if (paginationEl) {
        paginationEl.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.classList.contains('page-dot')) {
                const newPage = parseInt(target.dataset.page || '1', 10);
                if (!Number.isNaN(newPage) && newPage >= 1 && newPage <= state.totalPages && newPage !== state.page) {
                    state.page = newPage;
                    applyFilterAndPagination();

                    // optional: keep grid in view on page change
                    const grid = document.querySelector('.portfolio-grid');
                    if (grid) {
                        const rect = grid.getBoundingClientRect();
                        const scrollTop = window.pageYOffset + rect.top - 120;
                        window.scrollTo({ top: Math.max(scrollTop, 0), behavior: 'smooth' });
                    }
                }
            }
        });
    }

    // Add transition to items and initialize
    allPortfolioItems.forEach(item => {
        item.style.transition = 'all 0.3s ease';
    });

    // initial render respecting any preselected filter
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    state.filter = activeFilterBtn ? (activeFilterBtn.getAttribute('data-filter') || 'all') : 'all';
    state.page = 1;
    applyFilterAndPagination();

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    
    function updateNavbar() {
        if (window.scrollY > 8) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // initial navbar state
    updateNavbar();

    // Enhanced particle animation for hero section
    const particlesContainer = document.getElementById('particlesContainer');
    if (particlesContainer) {
        // Create floating particles with better visuals
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 6 + 2;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 10;
            const startX = Math.random() * 100;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${startX}%;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                opacity: ${Math.random() * 0.6 + 0.2};
            `;
            
            // Add glow effect to some particles
            if (Math.random() > 0.7) {
                particle.style.boxShadow = `0 0 ${size * 2}px rgba(96, 165, 250, 0.5)`;
            }
            
            particlesContainer.appendChild(particle);
        }
    }

    // Parallax effect for hero background
    let ticking2 = false;
    function updateParallax() {
        if (!ticking2) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const heroBackground = document.querySelector('.hero-background');
                const waveAnimation = document.querySelector('.wave-animation');
                
                if (heroBackground) {
                    heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
                }
                
                if (waveAnimation) {
                    waveAnimation.style.transform = `translateY(${scrolled * 0.3}px)`;
                }
                
                ticking2 = false;
            });
            ticking2 = true;
        }
    }
    
    window.addEventListener('scroll', updateParallax);

    // Button ripple effect
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                left: ${x}px;
                top: ${y}px;
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Lazy loading for images
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }

    // Form validation (basic, only on public pages). Skip on admin pages or forms opting out.
    const isAdminPage = !!document.querySelector('.admin-container');
    if (!isAdminPage) {
        const forms = document.querySelectorAll('form:not([data-skip-global-validation])');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                // Provide only light validation; don't hijack valid submissions
                const inputs = this.querySelectorAll('input[required], textarea[required]');
                let isValid = true;
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.classList.add('error');
                        input.addEventListener('input', function() {
                            this.classList.remove('error');
                        }, { once: true });
                    }
                });
                if (!isValid) {
                    e.preventDefault();
                }
            });
        });
    }

    // Copy to clipboard functionality
    const copyButtons = document.querySelectorAll('.btn-copy');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const textToCopy = this.previousElementSibling.textContent;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalHTML = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                this.style.color = '#28a745';
                
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        });
    });

    // Remove typing animation - let CSS animations handle it
    // The hero title now uses CSS animations for better performance

    // Mouse move effect for hero section
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
        });
        
        function animateHero() {
            currentX += (mouseX - currentX) * 0.1;
            currentY += (mouseY - currentY) * 0.1;
            
            const penguin = document.querySelector('.penguin-mascot');
            if (penguin) {
                penguin.style.transform = `translateX(${currentX}px) translateY(${currentY}px)`;
            }
            
            requestAnimationFrame(animateHero);
        }
        
        animateHero();
    }

    // Add glassmorphism cards hover effect
    const cards = document.querySelectorAll('.service-card, .team-card, .portfolio-item');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Initialize tooltips
    const elementsWithTitle = document.querySelectorAll('[title]');
    elementsWithTitle.forEach(element => {
        const title = element.getAttribute('title');
        element.removeAttribute('title');
        element.setAttribute('data-tooltip', title);
    });

    // FAQ accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(q => {
        q.addEventListener('click', () => {
            const expanded = q.getAttribute('aria-expanded') === 'true';
            // close others
            faqQuestions.forEach(other => {
                if (other !== q) {
                    other.setAttribute('aria-expanded', 'false');
                    other.parentElement.classList.remove('open');
                    const answer = other.parentElement.querySelector('.faq-answer');
                    if (answer) answer.hidden = true;
                }
            });
            // toggle current
            q.setAttribute('aria-expanded', String(!expanded));
            const item = q.parentElement;
            const answer = item.querySelector('.faq-answer');
            item.classList.toggle('open', !expanded);
            if (answer) answer.hidden = expanded;
        });
    });

    // Populate GitHub developer cards
    const ghCards = document.querySelectorAll('.team-card[data-github]');
    ghCards.forEach(async (card) => {
        const username = card.getAttribute('data-github');
        try {
            const res = await fetch(`https://api.github.com/users/${username}`);
            if (!res.ok) return;
            const data = await res.json();
            const avatar = card.querySelector('.team-avatar img');
            const nameEl = card.querySelector('.team-name');
            const bioEl = card.querySelector('.team-bio');
            const roleEl = card.querySelector('.team-role');

            if (avatar && data.avatar_url) avatar.src = data.avatar_url;
            if (nameEl) nameEl.textContent = data.name ? data.name : `@${username}`;
            if (roleEl) roleEl.textContent = data.company ? data.company : 'Developer';
            if (bioEl) bioEl.textContent = data.bio ? data.bio : 'No bio available on GitHub.';
        } catch (e) {
            console.warn('GitHub fetch failed for', username, e);
        }
    });

    // Lightweight pageview beacon (skip on admin pages)
    try {
        var isAdmin = !!document.querySelector('.admin-container');
        if (!isAdmin) {
            fetch('/api/track/visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                keepalive: true,
                body: JSON.stringify({
                    path: location.pathname + location.search,
                    referrer: document.referrer || '',
                    userAgent: navigator.userAgent || ''
                })
            }).catch(function(){ /* swallow */ });
        }
    } catch (e) { /* ignore */ }

    console.log('PenguinStudios website initialized successfully! 🐧');
});

