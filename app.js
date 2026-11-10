/**
 * TITAN FORGE GYM - MOBILE-FIRST JAVASCRIPT
 * High performance, zero dependencies, touch-gesture native
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. MOBILE NAVIGATION & DRAWER SYSTEM
  // =========================================================================
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerClose = document.getElementById('drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-nav-link, .drawer-btn');
  const siteHeader = document.getElementById('site-header');

  let isDrawerOpen = false;

  function openDrawer() {
    isDrawerOpen = true;
    mobileDrawer.classList.add('open');
    drawerBackdrop.classList.add('active');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    drawerClose.focus();
  }

  function closeDrawer() {
    if (!isDrawerOpen) return;
    isDrawerOpen = false;
    mobileDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('active');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    menuToggle.focus();
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (isDrawerOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeDrawer);
  }

  // Close drawer when selecting any navigation link
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Close drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDrawerOpen) {
      closeDrawer();
    }
  });

  // Sticky Header Subtle Shadow on Scroll
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > 20) {
      siteHeader.style.background = 'rgba(10, 10, 12, 0.95)';
      siteHeader.style.borderBottomColor = 'rgba(255, 107, 0, 0.25)';
    } else {
      siteHeader.style.background = 'rgba(10, 10, 12, 0.85)';
      siteHeader.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  // =========================================================================
  // 2. MOBILE SWIPEABLE CAROUSEL DOTS SYNCHRONISATION
  // =========================================================================
  function initCarouselDots(railId, dotsContainerId) {
    const rail = document.getElementById(railId);
    const dotsContainer = document.getElementById(dotsContainerId);
    if (!rail || !dotsContainer) return;

    const cards = rail.children;
    const cardCount = cards.length;
    if (cardCount <= 1) return;

    // Generate dots
    dotsContainer.innerHTML = '';
    for (let i = 0; i < cardCount; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'button');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
      dotsContainer.appendChild(dot);
    }

    const dots = dotsContainer.querySelectorAll('.dot');

    // Debounced scroll listener to update active dot
    let isTicking = false;
    rail.addEventListener('scroll', () => {
      if (!isTicking) {
        window.requestAnimationFrame(() => {
          const scrollLeft = rail.scrollLeft;
          const containerWidth = rail.clientWidth;
          const totalWidth = rail.scrollWidth - containerWidth;
          
          if (totalWidth <= 0) {
            isTicking = false;
            return;
          }

          // Calculate index based on nearest card
          let closestIndex = 0;
          let minDistance = Infinity;
          const railCenter = rail.getBoundingClientRect().left + containerWidth / 2;

          for (let i = 0; i < cardCount; i++) {
            const cardRect = cards[i].getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(railCenter - cardCenter);
            if (distance < minDistance) {
              minDistance = distance;
              closestIndex = i;
            }
          }

          dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === closestIndex);
          });

          isTicking = false;
        });
        isTicking = true;
      }
    }, { passive: true });
  }

  initCarouselDots('services-rail', 'services-dots');
  initCarouselDots('trainers-rail', 'trainers-dots');
  initCarouselDots('reviews-rail', 'reviews-dots');

  // =========================================================================
  // 3. BILLING FREQUENCY TOGGLE (MONTHLY vs ANNUAL DISCOUNT)
  // =========================================================================
  const billingSwitch = document.getElementById('billing-switch');
  const labelMonthly = document.getElementById('label-monthly');
  const labelAnnual = document.getElementById('label-annual');
  const priceValues = document.querySelectorAll('.price-value');
  const billingNotes = document.querySelectorAll('.billing-note');

  if (billingSwitch) {
    billingSwitch.addEventListener('click', () => {
      const isAnnual = billingSwitch.getAttribute('aria-checked') === 'true';
      const newState = !isAnnual;

      billingSwitch.setAttribute('aria-checked', String(newState));
      
      if (newState) {
        labelAnnual.classList.add('active');
        labelMonthly.classList.remove('active');
      } else {
        labelMonthly.classList.add('active');
        labelAnnual.classList.remove('active');
      }

      // Update displayed prices
      priceValues.forEach(el => {
        const val = newState ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
        el.textContent = val;
      });

      // Update notes
      billingNotes.forEach(el => {
        if (newState) {
          el.textContent = el.getAttribute('data-annual-note') || 'Billed annually • Cancel anytime';
        } else {
          el.textContent = 'Billed monthly • Cancel anytime';
        }
      });
    });
  }

  // =========================================================================
  // 4. FULLSCREEN GALLERY LIGHTBOX WITH TOUCH GESTURES
  // =========================================================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxContent = document.getElementById('lightbox-content');

  let currentGalleryIndex = 0;
  const galleryData = [];

  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    const caption = item.getAttribute('data-caption') || img.alt;
    galleryData.push({
      src: img.src,
      alt: img.alt,
      caption: caption
    });

    item.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  function openLightbox(index) {
    currentGalleryIndex = index;
    updateLightboxContent();
    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
  }

  function updateLightboxContent() {
    const data = galleryData[currentGalleryIndex];
    if (!data) return;
    lightboxImg.src = data.src;
    lightboxImg.alt = data.alt;
    lightboxCaption.textContent = data.caption;
    lightboxCounter.textContent = `${currentGalleryIndex + 1} of ${galleryData.length}`;
  }

  function showNextImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryData.length;
    updateLightboxContent();
  }

  function showPrevImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
    updateLightboxContent();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
  });

  // Mobile Touch Gestures for Lightbox (Swipe left/right)
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  if (lightboxContent) {
    lightboxContent.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    lightboxContent.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleLightboxSwipe();
    }, { passive: true });
  }

  function handleLightboxSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Check horizontal swipe threshold (min 45px) and verify it's mostly horizontal
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        showNextImage(); // Swiped left -> next
      } else {
        showPrevImage(); // Swiped right -> prev
      }
    }
  }

  // =========================================================================
  // 5. MOBILE-OPTIMIZED PASS FORM VALIDATION & INTERACTIVE STATE
  // =========================================================================
  const passForm = document.getElementById('claim-pass-form');
  const successCard = document.getElementById('form-success-card');
  const resetBtn = document.getElementById('reset-pass-btn');
  const submitBtn = document.getElementById('submit-pass-btn');

  const inputName = document.getElementById('input-name');
  const inputPhone = document.getElementById('input-phone');
  const inputEmail = document.getElementById('input-email');

  const groupName = document.getElementById('group-name');
  const groupPhone = document.getElementById('group-phone');
  const groupEmail = document.getElementById('group-email');

  function validateName() {
    const val = inputName.value.trim();
    const isValid = val.length >= 2;
    groupName.classList.toggle('has-error', !isValid);
    inputName.setAttribute('aria-invalid', String(!isValid));
    return isValid;
  }

  function validatePhone() {
    const rawVal = inputPhone.value.replace(/[^0-9+]/g, '');
    const isValid = rawVal.length >= 10;
    groupPhone.classList.toggle('has-error', !isValid);
    inputPhone.setAttribute('aria-invalid', String(!isValid));
    return isValid;
  }

  function validateEmail() {
    const val = inputEmail.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(val);
    groupEmail.classList.toggle('has-error', !isValid);
    inputEmail.setAttribute('aria-invalid', String(!isValid));
    return isValid;
  }

  // Format phone number dynamically as user types
  if (inputPhone) {
    inputPhone.addEventListener('input', (e) => {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      if (x) {
        e.target.value = !x[2] ? x[1] : `(${x[1]}) ${x[2]}` + (x[3] ? `-${x[3]}` : '');
      }
      if (groupPhone.classList.contains('has-error')) {
        validatePhone();
      }
    });
  }

  if (inputName) {
    inputName.addEventListener('blur', validateName);
    inputName.addEventListener('input', () => {
      if (groupName.classList.contains('has-error')) validateName();
    });
  }

  if (inputEmail) {
    inputEmail.addEventListener('blur', validateEmail);
    inputEmail.addEventListener('input', () => {
      if (groupEmail.classList.contains('has-error')) validateEmail();
    });
  }

  if (passForm) {
    passForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateName();
      const isPhoneValid = validatePhone();
      const isEmailValid = validateEmail();

      if (!isNameValid || !isPhoneValid || !isEmailValid) {
        // Focus first invalid input
        if (!isNameValid) inputName.focus();
        else if (!isPhoneValid) inputPhone.focus();
        else if (!isEmailValid) inputEmail.focus();
        return;
      }

      // Show submitting state
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'ACTIVATING PASS...';

      setTimeout(() => {
        const userName = inputName.value.trim().split(' ')[0] || 'Athlete';
        const randomVoucher = `TF-VIP-${Math.floor(1000 + Math.random() * 9000)}`;

        document.getElementById('ticket-voucher-code').textContent = randomVoucher;
        document.getElementById('success-custom-text').textContent = 
          `Welcome, ${userName}! Your free 1-day biometric gym pass has been activated. We've dispatched an SMS confirmation to ${inputPhone.value}.`;

        passForm.style.display = 'none';
        successCard.style.display = 'block';

        // Scroll to success card smoothly
        successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 700);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      passForm.reset();
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').textContent = 'GET MY FREE PASS NOW';
      groupName.classList.remove('has-error');
      groupPhone.classList.remove('has-error');
      groupEmail.classList.remove('has-error');
      successCard.style.display = 'none';
      passForm.style.display = 'flex';
      inputName.focus();
    });
  }

  // =========================================================================
  // 6. WHATSAPP FLOATING BUTTON ENHANCEMENT & AUTO-RETRACT ON FORM CONTROLS
  // =========================================================================
  const whatsappBtn = document.getElementById('whatsapp-btn');
  if (whatsappBtn) {
    // Dynamic message greeting based on time of day
    const hour = new Date().getHours();
    let timeGreeting = 'Hello';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    const phone = '15550192834';
    const text = encodeURIComponent(`${timeGreeting} Titan Forge Gym! I'd like to claim my Free 1-Day Pass and ask a few questions about memberships.`);
    whatsappBtn.href = `https://wa.me/${phone}?text=${text}`;

    // Auto-retract when near contact form submit button to prevent overlapping touch targets
    const submitBtn = document.getElementById('submit-pass-btn');
    if ('IntersectionObserver' in window && submitBtn) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            whatsappBtn.classList.add('whatsapp-retracted');
          } else {
            whatsappBtn.classList.remove('whatsapp-retracted');
          }
        });
      }, { rootMargin: '0px 0px 40px 0px', threshold: 0.1 });

      observer.observe(submitBtn);
    }
  }

});
