// Before/After Slider Functionality
(function() {
    const slider = document.getElementById('beforeAfterSlider');
    const afterContainer = document.getElementById('afterContainer');
    const sliderHandle = document.getElementById('sliderHandle');
    const afterImage = document.getElementById('afterImage');
    
    if (!slider || !afterContainer || !sliderHandle || !afterImage) {
        return;
    }
    
    let isActive = false;

    function setAfterImageWidth() {
        const sliderWidth = slider.offsetWidth;
        afterImage.style.width = sliderWidth + 'px';
    }

    window.addEventListener('load', setAfterImageWidth);
    window.addEventListener('resize', setAfterImageWidth);
    setAfterImageWidth();

    function updateSlider(x) {
        const bounds = slider.getBoundingClientRect();
        const position = ((x - bounds.left) / bounds.width) * 100;
        
        const constrainedPosition = Math.max(0, Math.min(100, position));
        
        afterContainer.style.width = constrainedPosition + '%';
        sliderHandle.style.left = constrainedPosition + '%';
    }

    sliderHandle.addEventListener('mousedown', function() {
        isActive = true;
    });

    document.addEventListener('mouseup', function() {
        isActive = false;
    });

    document.addEventListener('mousemove', function(e) {
        if (!isActive) return;
        updateSlider(e.clientX);
    });

    sliderHandle.addEventListener('touchstart', function(e) {
        isActive = true;
        e.preventDefault();
    });

    document.addEventListener('touchend', function() {
        isActive = false;
    });

    document.addEventListener('touchmove', function(e) {
        if (!isActive) return;
        e.preventDefault();
        const touch = e.touches[0];
        updateSlider(touch.clientX);
    });

    slider.addEventListener('click', function(e) {
        updateSlider(e.clientX);
    });
})();


// Mobile Menu Functionality
(function() {
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const body = document.body;
    
    const overlay = document.createElement('div');
    overlay.classList.add('mobile-menu-overlay');
    body.appendChild(overlay);
    
    function openMenu(e) {
        e.preventDefault();
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        body.classList.add('mobile-menu-open');
    }
    
    function closeMenu(e) {
        e.preventDefault();
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        body.classList.remove('mobile-menu-open');
    }
    
    if (hamburgerIcon) {
        hamburgerIcon.addEventListener('click', openMenu);
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMenu);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMenu(e);
        }
    });
})();

// Logo Marquee Functionality
(function() {
    const container = document.querySelector('.marquee-container');
    const track = document.querySelector('.marquee-track');
    
    if (!container || !track) {
        return; 
    }
    
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    
    function getTranslateX() {
        const style = window.getComputedStyle(track);
        const matrix = style.transform;
        
        if (matrix === 'none') return 0;
        
        const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ');
        return parseFloat(matrixValues[4]);
    }
    
    container.addEventListener('mousedown', dragStart);
    container.addEventListener('mousemove', drag);
    container.addEventListener('mouseup', dragEnd);
    container.addEventListener('mouseleave', dragEnd);
    
    container.addEventListener('touchstart', dragStart);
    container.addEventListener('touchmove', drag);
    container.addEventListener('touchend', dragEnd);
    
    function dragStart(e) {
        isDragging = true;
        startPos = getPositionX(e);
        prevTranslate = getTranslateX();
        track.classList.add('dragging');
        
        track.style.animation = 'none';
        animationID = requestAnimationFrame(animation);
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        const currentPosition = getPositionX(e);
        currentTranslate = prevTranslate + currentPosition - startPos;
    }
    
    function dragEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        cancelAnimationFrame(animationID);
        track.classList.remove('dragging');
        
        const currentX = getTranslateX();
        
        track.style.animation = 'none';
        track.style.transform = `translateX(${currentX}px)`;
        
        void track.offsetWidth;
        
        track.style.animation = 'marquee 30s linear infinite';
        
        const trackWidth = track.scrollWidth / 2;
        let normalizedX = currentX % trackWidth;
        if (normalizedX > 0) normalizedX -= trackWidth;
        
        track.style.transform = `translateX(${normalizedX}px)`;
    }
    
    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }
    
    function animation() {
        if (isDragging) {
            track.style.transform = `translateX(${currentTranslate}px)`;
            
            const trackWidth = track.scrollWidth / 2;
            
            if (currentTranslate > 0) {
                currentTranslate = -trackWidth;
                prevTranslate = currentTranslate;
            } else if (currentTranslate < -trackWidth) {
                currentTranslate = 0;
                prevTranslate = currentTranslate;
            }
            
            animationID = requestAnimationFrame(animation);
        }
    }
    
    const images = track.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });
})();


// Product Carousel Functionality
(function() {
    const track = document.querySelector('.product-carousel-track');
    const items = document.querySelectorAll('.product-card');
    const prevBtn = document.querySelector('.product-carousel-nav.prev');
    const nextBtn = document.querySelector('.product-carousel-nav.next');
    const dotsContainer = document.querySelector('.product-carousel-dots');
    
    if (!track || !items.length || !prevBtn || !nextBtn || !dotsContainer) {
        return;
    }
    
    let currentIndex = 0;
    let itemsPerView = 4;
    
    function updateItemsPerView() {
        if (window.innerWidth <= 768) {
            itemsPerView = 1; // Mobile: 1 slide
        } else if (window.innerWidth <= 1024) {
            itemsPerView = 2; // Tablet: 2 slides
        } else {
            itemsPerView = 4; // Desktop: 4 slides
        }
    }

    function getTotalSlides() {
        return items.length - itemsPerView + 1;
    }
    
    function createDots() {
        dotsContainer.innerHTML = '';
        const totalSlides = getTotalSlides();
        
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('product-carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    function updateCarousel() {
        const itemWidth = items[0].offsetWidth;
        const gap = 30;
        const offset = currentIndex * (itemWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;
        
        document.querySelectorAll('.product-carousel-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
        
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= getTotalSlides() - 1;
    }
    
    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
    }
    
    function nextSlide() {
        if (currentIndex < getTotalSlides() - 1) {
            currentIndex++;
            updateCarousel();
        }
    }
    
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    }
    
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    let autoplayInterval;
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            if (currentIndex >= getTotalSlides() - 1) {
                currentIndex = 0;
            } else {
                currentIndex++;
            }
            updateCarousel();
        }, 5000); 
    }
    
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }
    
    const carouselWrapper = document.querySelector('.product-carousel-wrapper');
    if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', stopAutoplay);
        carouselWrapper.addEventListener('mouseleave', startAutoplay);
    }
    
    window.addEventListener('resize', () => {
        updateItemsPerView();
        createDots();
        currentIndex = 0;
        updateCarousel();
    });
    
    updateItemsPerView();
    createDots();
    updateCarousel();
    startAutoplay();
})();

// Update current year in footer
(function() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
})();

// Map Location Switcher
function changeMapLocation(location) {
    const maps = {
        oregon: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2915520.6737326938!2d-122.67648819999999!3d43.8041334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54936e7c9b9c9ae1%3A0x6c9f9e4f7f5e5e5e!2sOregon!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus',
        portland: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d178858.81726307178!2d-122.79051984999999!3d45.5202471!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54950b0b7da97427%3A0x1c36b9e6f6d18591!2sPortland%2C%20OR!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus',
        salem: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d89579.61073515625!2d-123.08597959999999!3d44.9428975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54bffdf31bfb6283%3A0x44f6b067144c470!2sSalem%2C%20OR!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus',
        eugene: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d95260.88475313593!2d-123.16881409999999!3d44.0505054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54c119b0ac501919%3A0x57ec61894a43894d!2sEugene%2C%20OR!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus',
        bend: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d92559.97693486394!2d-121.36150109999999!3d44.0581728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54b8c2351cb45299%3A0x95a0a55f778c2559!2sBend%2C%20OR!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus',
        medford: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d95638.35847328823!2d-122.93526309999999!3d42.3265152!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54cf73e39f32e7f9%3A0x62a3f9a1c99603cf!2sMedford%2C%20OR!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus'
    };
    
    const iframe = document.getElementById('serviceMap');
    const buttons = document.querySelectorAll('.location-btn');
    
    if (iframe && maps[location]) {
        iframe.style.opacity = '0.5';
        
        setTimeout(() => {
            iframe.src = maps[location];
            
            setTimeout(() => {
                iframe.style.opacity = '1';
            }, 100);
        }, 300);
        
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }
}

// FLOORING ESTIMATE FORM

(function() {
    if (!document.getElementById('formProgressSteps')) return;

    const formState = {
        currentStep: 1,
        serviceType: null,
        squareFootage: '',
        subFloor: null,
        existingFloorType: null,
        moistureBarrier: null,
        finishType: null,
        plankWidth: null,
        naturalOrStain: null,
        sandingOption: null,
        topCoat: null,
        contactInfo: { 
            name: '', 
            phone: '', 
            email: '', 
            zip: '', 
            agreeNotifications: false 
        }
    };

    function getTotalSteps() {
        return formState.serviceType === 'installation' ? 6 : 5;
    }

    function initProgressSteps() {
        const container = document.getElementById('formProgressSteps');
        if (!container) return;
        
        container.innerHTML = '';
        const total = getTotalSteps();
        
        for (let i = 1; i <= total; i++) {
            const step = document.createElement('div');
            step.className = 'form-step-indicator' + (i === 1 ? ' active' : '');
            step.textContent = i;
            container.appendChild(step);
            
            if (i < total) {
                const line = document.createElement('div');
                line.className = 'form-step-line';
                container.appendChild(line);
            }
        }
    }

    function updateProgress() {
        document.querySelectorAll('.form-step-indicator').forEach((el, i) => {
            const step = i + 1;
            el.classList.toggle('active', step === formState.currentStep);
            el.classList.toggle('completed', step < formState.currentStep);
        });
        
        document.querySelectorAll('.form-step-line').forEach((el, i) => {
            el.classList.toggle('completed', i + 1 < formState.currentStep);
        });
    }

    function showStep() {
        document.querySelectorAll('.form-step-content').forEach(el => {
            el.classList.remove('active');
        });
        
        let stepEl;
        if (formState.currentStep === 1) {
            stepEl = document.querySelector('[data-step="1"]');
        } else if (formState.serviceType === 'installation') {
            if (formState.currentStep === 6) {
                stepEl = document.querySelector('.contact-step');
            } else {
                stepEl = document.querySelector(`.installation-step[data-step="${formState.currentStep}"]`);
            }
        } else if (formState.serviceType === 'refinishing') {
            if (formState.currentStep === 5) {
                stepEl = document.querySelector('.contact-step');
            } else {
                stepEl = document.querySelector(`.refinishing-step[data-step="${formState.currentStep}"]`);
            }
        }
        
        if (stepEl) {
            stepEl.classList.add('active');
        }
        
        updateButtons();
    }

    function canProceed() {
        if (formState.currentStep === 1) {
            return formState.serviceType && formState.squareFootage.trim() !== '';
        }
        
        if (formState.serviceType === 'installation') {
            if (formState.currentStep === 2) {
                return formState.subFloor && (formState.subFloor === 'clean' || formState.existingFloorType);
            }
            if (formState.currentStep === 3) return formState.moistureBarrier;
            if (formState.currentStep === 4) return formState.finishType;
            if (formState.currentStep === 5) return formState.plankWidth;
            if (formState.currentStep === 6) {
                return formState.contactInfo.name.trim() !== '' && 
                       formState.contactInfo.phone.trim() !== '' && 
                       formState.contactInfo.zip.trim() !== '';
            }
        }
        
        if (formState.serviceType === 'refinishing') {
            if (formState.currentStep === 2) return formState.naturalOrStain;
            if (formState.currentStep === 3) return formState.sandingOption;
            if (formState.currentStep === 4) return formState.topCoat;
            if (formState.currentStep === 5) {
                return formState.contactInfo.name.trim() !== '' && 
                       formState.contactInfo.phone.trim() !== '' && 
                       formState.contactInfo.zip.trim() !== '';
            }
        }
        
        return false;
    }

    function updateButtons() {
        const back = document.getElementById('formBtnBack');
        const next = document.getElementById('formBtnNext');
        
        if (!back || !next) return;
        
        back.style.display = formState.currentStep > 1 ? 'block' : 'none';
        next.textContent = formState.currentStep === getTotalSteps() ? 'Submit' : 'Next';
        next.disabled = !canProceed();
    }

    function formatPhone(val) {
        const num = val.replace(/\D/g, '');
        if (num.length <= 3) return num;
        if (num.length <= 6) return `(${num.slice(0,3)}) ${num.slice(3)}`;
        return `(${num.slice(0,3)}) ${num.slice(3,6)}-${num.slice(6,10)}`;
    }

    function handleCardClick(card) {
        const field = card.dataset.field;
        const value = card.dataset.value;
        
        card.parentElement.querySelectorAll('.form-card-select').forEach(c => {
            c.classList.remove('selected');
        });
        
        card.classList.add('selected');
        
        formState[field] = value;
        
        if (field === 'serviceType') {
            formState.currentStep = 1;
            initProgressSteps();
        }
        
        if (field === 'subFloor' && value === 'existing') {
            const modal = document.getElementById('formFloorModal');
            if (modal) modal.classList.add('active');
        } else if (field === 'subFloor') {
            formState.existingFloorType = null;
        }
        
        updateButtons();
    }

    function handleModalCardClick(card) {
        const val = card.dataset.value;
        
        card.parentElement.querySelectorAll('.form-modal-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        card.classList.add('selected');
        
        formState.existingFloorType = val;
        
        setTimeout(() => {
            const modal = document.getElementById('formFloorModal');
            if (modal) modal.classList.remove('active');
            updateButtons();
        }, 300);
    }

    function handleNext() {
        const total = getTotalSteps();
        
        if (formState.currentStep < total) {
            formState.currentStep++;
            showStep();
            updateProgress();
        } else {
            // Submit form
            console.log('Form submitted:', formState);
            alert('Thank you! Your estimate request has been submitted. We will contact you within 1 business day.');
            
            // You can add your form submission logic here
            // Example: Send data to server
            // fetch('/api/submit-estimate', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formState)
            // });
        }
    }

    function handleBack() {
        if (formState.currentStep > 1) {
            formState.currentStep--;
            showStep();
            updateProgress();
        }
    }

    function initEventListeners() {
        document.querySelectorAll('.form-card-select:not(.form-modal-card)').forEach(card => {
            card.addEventListener('click', () => handleCardClick(card));
        });
        
        document.querySelectorAll('.form-modal-card').forEach(card => {
            card.addEventListener('click', () => handleModalCardClick(card));
        });
        
        const squareFootageInput = document.getElementById('formSquareFootage');
        if (squareFootageInput) {
            squareFootageInput.addEventListener('input', (e) => {
                formState.squareFootage = e.target.value;
                updateButtons();
            });
        }
        
        const contactNameInput = document.getElementById('formContactName');
        if (contactNameInput) {
            contactNameInput.addEventListener('input', (e) => {
                formState.contactInfo.name = e.target.value;
                updateButtons();
            });
        }
        
        const contactPhoneInput = document.getElementById('formContactPhone');
        if (contactPhoneInput) {
            contactPhoneInput.addEventListener('input', (e) => {
                e.target.value = formatPhone(e.target.value);
                formState.contactInfo.phone = e.target.value;
                updateButtons();
            });
        }
        
        const contactEmailInput = document.getElementById('formContactEmail');
        if (contactEmailInput) {
            contactEmailInput.addEventListener('input', (e) => {
                formState.contactInfo.email = e.target.value;
            });
        }
        
        const contactZipInput = document.getElementById('formContactZip');
        if (contactZipInput) {
            contactZipInput.addEventListener('input', (e) => {
                formState.contactInfo.zip = e.target.value;
                updateButtons();
            });
        }
        
        const agreeNotificationsCheckbox = document.getElementById('formAgreeNotifications');
        if (agreeNotificationsCheckbox) {
            agreeNotificationsCheckbox.addEventListener('change', (e) => {
                formState.contactInfo.agreeNotifications = e.target.checked;
            });
        }
        
        const btnNext = document.getElementById('formBtnNext');
        if (btnNext) {
            btnNext.addEventListener('click', handleNext);
        }
        
        const btnBack = document.getElementById('formBtnBack');
        if (btnBack) {
            btnBack.addEventListener('click', handleBack);
        }
        
        const closeModalBtn = document.getElementById('formCloseModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                const modal = document.getElementById('formFloorModal');
                if (modal) modal.classList.remove('active');
            });
        }
        
        const modalOverlay = document.getElementById('formFloorModal');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.classList.remove('active');
                }
            });
        }
    }

    function initForm() {
        initProgressSteps();
        showStep();
        initEventListeners();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initForm);
    } else {
        initForm();
    }
})();