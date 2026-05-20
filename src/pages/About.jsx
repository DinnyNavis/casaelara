import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  const [galleryExpanded, setGalleryExpanded] = useState(false)

  useEffect(() => {
    if (window.AOS) {
      window.AOS.init({ duration: 600, easing: 'ease-out-cubic', once: true, offset: 60 })
      window.AOS.refresh()
    }
    // Defer createIcons so all DOM nodes are painted before Lucide scans them
    const t = setTimeout(() => {
      if (window.lucide) window.lucide.createIcons()
    }, 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.AOS) { window.AOS.refresh() }
      if (window.lucide) window.lucide.createIcons()
    }, 100)
    return () => clearTimeout(timer)
  }, [galleryExpanded])

  useEffect(() => {
    // Navbar: start transparent, morph on scroll (same as home)
    const navbarWrapper = document.getElementById('navbar-wrapper')
    const heroSlider = document.querySelector('.about-hero-slider')

    function onScroll() {
      const scrollY = window.scrollY
      if (scrollY > 1) {
        if (navbarWrapper) navbarWrapper.classList.add('scrolled')
      } else {
        if (navbarWrapper) navbarWrapper.classList.remove('scrolled')
      }
      if (heroSlider && scrollY < window.innerHeight) {
        heroSlider.style.transform = `translateY(${scrollY * 0.4}px)`
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const scrollTopBtn = document.getElementById('scrollTop')
    function onScroll() {
      if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 500)
    }
    function onClick() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
    if (scrollTopBtn) {
      window.addEventListener('scroll', onScroll)
      scrollTopBtn.addEventListener('click', onClick)
    }
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (scrollTopBtn) scrollTopBtn.removeEventListener('click', onClick)
    }
  }, [])

  useEffect(() => {
    const hamburger = document.getElementById('hamburger')
    const mobileMenu = document.getElementById('mobile-menu')
    function onHamburger() {
      if (mobileMenu) mobileMenu.classList.toggle('open')
      if (hamburger) hamburger.classList.toggle('active')
    }
    function closeMenu() {
      if (mobileMenu) mobileMenu.classList.remove('open')
      if (hamburger) hamburger.classList.remove('active')
    }
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', onHamburger)
      mobileMenu.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMenu))
    }
    return () => {
      if (hamburger) hamburger.removeEventListener('click', onHamburger)
    }
  }, [])

  useEffect(() => {
    // Lightbox
    const galleryItems = document.querySelectorAll('.gallery-item')
    const lightbox = document.getElementById('lightbox')
    if (!lightbox || !galleryItems.length) return
    const lightboxImg = lightbox.querySelector('.lightbox-image')
    const lightboxCounter = lightbox.querySelector('.lightbox-counter')
    let currentIndex = 0
    const images = Array.from(galleryItems).map(item => item.querySelector('img').src)

    function openLightbox() {
      lightboxImg.src = images[currentIndex]
      lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`
      lightbox.classList.add('active')
      document.body.style.overflow = 'hidden'
    }
    function closeLightbox() {
      lightbox.classList.remove('active')
      document.body.style.overflow = ''
    }
    function updateLightbox() {
      lightboxImg.style.animation = 'none'
      lightboxImg.offsetHeight
      lightboxImg.style.animation = 'lightboxZoomIn 0.3s ease'
      lightboxImg.src = images[currentIndex]
      lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`
    }

    const clickHandlers = []
    galleryItems.forEach((item, index) => {
      const fn = () => { currentIndex = index; openLightbox() }
      item.addEventListener('click', fn)
      clickHandlers.push({ item, fn })
    })

    const closeBtn = lightbox.querySelector('.lightbox-close')
    const prevBtn = lightbox.querySelector('.lightbox-prev')
    const nextBtn = lightbox.querySelector('.lightbox-next')
    const closeFn = closeLightbox
    const prevFn = () => { currentIndex = (currentIndex - 1 + images.length) % images.length; updateLightbox() }
    const nextFn = () => { currentIndex = (currentIndex + 1) % images.length; updateLightbox() }

    if (closeBtn) closeBtn.addEventListener('click', closeFn)
    if (prevBtn) prevBtn.addEventListener('click', prevFn)
    if (nextBtn) nextBtn.addEventListener('click', nextFn)

    const keyFn = (e) => {
      if (!lightbox.classList.contains('active')) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + images.length) % images.length; updateLightbox() }
      if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % images.length; updateLightbox() }
    }
    document.addEventListener('keydown', keyFn)

    const outsideFn = (e) => { if (e.target === lightbox) closeLightbox() }
    lightbox.addEventListener('click', outsideFn)

    let touchStartX = 0
    const touchStartFn = (e) => { touchStartX = e.changedTouches[0].screenX }
    const touchEndFn = (e) => {
      const diff = e.changedTouches[0].screenX - touchStartX
      if (Math.abs(diff) > 50) {
        if (diff > 0) currentIndex = (currentIndex - 1 + images.length) % images.length
        else currentIndex = (currentIndex + 1) % images.length
        updateLightbox()
      }
    }
    lightbox.addEventListener('touchstart', touchStartFn, { passive: true })
    lightbox.addEventListener('touchend', touchEndFn)

    return () => {
      clickHandlers.forEach(({ item, fn }) => item.removeEventListener('click', fn))
      if (closeBtn) closeBtn.removeEventListener('click', closeFn)
      if (prevBtn) prevBtn.removeEventListener('click', prevFn)
      if (nextBtn) nextBtn.removeEventListener('click', nextFn)
      document.removeEventListener('keydown', keyFn)
      lightbox.removeEventListener('click', outsideFn)
      lightbox.removeEventListener('touchstart', touchStartFn)
      lightbox.removeEventListener('touchend', touchEndFn)
    }
  }, [galleryExpanded])

  useEffect(() => {
    const footerDeluxe = document.querySelector('.footer-deluxe')
    let obs
    if (footerDeluxe) {
      obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) footerDeluxe.classList.add('aos-animate')
      }, { threshold: 0.1 })
      obs.observe(footerDeluxe)
    }
    return () => { if (obs) obs.disconnect() }
  }, [])

  // Custom cursor (desktop only) — same as Home and Contact pages
  useEffect(() => {
    if (window.innerWidth <= 768) return
    const cursorDot = document.createElement('div')
    cursorDot.classList.add('cursor-dot')
    document.body.appendChild(cursorDot)

    let cursorX = window.innerWidth / 2
    let cursorY = window.innerHeight / 2
    let dotX = cursorX
    let dotY = cursorY
    let rafId

    function onMouseMove(e) {
      cursorX = e.clientX
      cursorY = e.clientY
    }
    document.addEventListener('mousemove', onMouseMove)

    function animateCursor() {
      dotX += (cursorX - dotX) * 0.2
      dotY += (cursorY - dotY) * 0.2
      cursorDot.style.left = `${dotX}px`
      cursorDot.style.top = `${dotY}px`
      rafId = requestAnimationFrame(animateCursor)
    }
    animateCursor()

    const interactables = document.querySelectorAll('a, button, .feature-card, .room-image')
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorDot.style.width = '16px'
        cursorDot.style.height = '16px'
        cursorDot.style.backgroundColor = 'var(--tropical-gold)'
        cursorDot.style.boxShadow = '0 0 15px rgba(200, 168, 78, 0.8)'
      })
      el.addEventListener('mouseleave', () => {
        cursorDot.style.width = '8px'
        cursorDot.style.height = '8px'
        cursorDot.style.backgroundColor = 'var(--lush-green)'
        cursorDot.style.boxShadow = '0 0 10px rgba(26, 122, 76, 0.8)'
      })
    })

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
      if (cursorDot.parentNode) cursorDot.parentNode.removeChild(cursorDot)
    }
  }, [])

  function handleGalleryToggle() {
    const newState = !galleryExpanded
    setGalleryExpanded(newState)

    if (!newState) {
      // Scroll back to gallery
      setTimeout(() => {
        const gallerySection = document.getElementById('gallery')
        if (gallerySection) {
          const yOffset = -100
          const y = gallerySection.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 420)
    }
  }

  const extraItemStyle = (visible) => ({
    display: visible ? 'block' : 'none',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(30px)',
    transition: 'opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s, border-color 0.4s'
  })

  return (
    <div className="page-about">
      {/* Navigation */}
      <div className="navbar-wrapper" id="navbar-wrapper">
        <nav id="navbar" className="navbar">
          <div className="container nav-container">
            <Link to="/" className="nav-logo">
              <img src="/logo_transparent.png" alt="Casa Elara" />
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/about" className="nav-link active">About Us</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
              <a href="https://wa.me/919292004162?text=Hi!%20I%27d%20like%20to%20book%20a%20stay%20at%20Casa%20Elara%20Luxury%20Pool%20Villa.%20Please%20share%20availability%20and%20pricing." target="_blank" rel="noopener noreferrer" className="nav-btn btn-ripple">Book Now</a>
            </div>
            <button className="hamburger" id="hamburger" aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className="mobile-menu" id="mobile-menu">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link active">About Us</Link>
        <Link to="/contact" className="nav-link">Contact</Link>
        <a href="https://wa.me/919292004162?text=Hi!%20I%27d%20like%20to%20book%20a%20stay%20at%20Casa%20Elara%20Luxury%20Pool%20Villa.%20Please%20share%20availability%20and%20pricing." target="_blank" rel="noopener noreferrer" className="btn btn-primary nav-btn btn-ripple">Book Now</a>
      </div>

      {/* Hero */}
      <section className="about-hero-new page-hero">
        <div className="hero-slider about-hero-slider">
          <div className="hero-slide" style={{ backgroundImage: "url('/9301-wholeresortview.PNG')" }}></div>
          <div className="hero-slide" style={{ backgroundImage: "url('/9284wholepoolview.jpeg')" }}></div>
          <div className="hero-slide" style={{ backgroundImage: "url('/9214_livingroomwithstairs.jpeg')" }}></div>
          <div className="hero-slide" style={{ backgroundImage: "url('/9211_bedroom-whole.jpeg')" }}></div>
        </div>
        <div className="hero-overlay about-hero-overlay-luxury"></div>
        <div className="about-hero-content">
          <div className="hero-breadcrumb" data-aos="fade-down" data-aos-duration="800">Home / About Us</div>
          <span className="hero-kicker" data-aos="fade-in" data-aos-duration="1000" data-aos-delay="200">CASA ELARA STORY</span>
          <h1 className="hero-title" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">Our Story</h1>
          <div className="hero-gold-line"></div>
          <p className="hero-subtitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="600">A private pool villa where Wayanad's calm nature meets warm luxury, privacy, and unforgettable moments.</p>
          <p className="hero-small-line" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="800">Crafted for peaceful stays, family escapes, and soulful retreats.</p>
          <div className="hero-buttons" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="1000">
            <a href="#about-intro" className="btn btn-gold">EXPLORE OUR STORY</a>
            <a href="https://wa.me/919292004162" target="_blank" rel="noopener noreferrer" className="btn btn-outline-white">BOOK YOUR STAY</a>
          </div>
        </div>
      </section>

      {/* Section: Our Story */}
      <section id="about-intro" className="bg-cream about-intro-section">
        <div className="container story-section about-story-section">
          <div className="story-text about-story-text" data-aos="fade-right">
            <span className="section-label about-label">THE BEGINNING</span>
            <h2 className="section-heading about-heading">A Dream Woven with Nature</h2>
            <div className="gold-divider left"></div>
            <div className="about-text-content-wrapper">
              <p className="about-p">Casa Elara was created as a peaceful hideaway where modern comfort blends with the untouched charm of Wayanad. Every space is designed to help guests slow down, reconnect, and enjoy privacy with a touch of refined luxury.</p>
              <div className="about-quote-card-subtle">
                <p className="pull-quote about-quote">"We didn't just build a villa — we crafted an experience."</p>
              </div>
            </div>
            <div className="about-mini-highlights">
              <div className="mini-highlight">
                <span className="num">01</span>
                <span className="lbl">Private Villa</span>
              </div>
              <div className="mini-highlight">
                <span className="num">02</span>
                <span className="lbl">Nature Escape</span>
              </div>
              <div className="mini-highlight">
                <span className="num">03</span>
                <span className="lbl">Luxury Comfort</span>
              </div>
            </div>
          </div>
          <div className="story-visual about-story-visual" data-aos="fade-left">
            <div className="story-image-container about-image-container-premium">
              <img src="/9243-goodbedroom.jpeg" alt="Our Story" loading="lazy" />
              <div className="about-badge">Luxury Stay</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Why Choose Us */}
      <section className="bg-mint about-features-section">
        <div className="container">
          <div className="text-center">
            <span className="section-label about-label" data-aos="fade-up">THE CASA ELARA DIFFERENCE</span>
            <h2 className="section-heading about-heading" data-aos="fade-up" data-aos-delay="100">What Sets Us Apart</h2>
            <div className="gold-divider center" data-aos="fade-up" data-aos-delay="200"></div>
          </div>
          <div className="why-grid about-why-grid">

            <div className="why-box about-why-box-luxury" data-aos="fade-up" data-aos-delay="50">
              <span className="card-number">01</span>
              <span className="ce-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#c8a646" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5s2.5 2 5 2 2.5-2 5-2 2.5 2 2.5 2" /><path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11s2.5 2 5 2 2.5-2 5-2 2.5 2 2.5 2" /><path d="M2 18c.6.5 1.2 1 2.5 1C7 19 7 17 9.5 17s2.5 2 5 2 2.5-2 5-2 2.5 2 2.5 2" />
                </svg>
              </span>
              <h3 className="card-title about-card-title">Private Pool Villa</h3>
              <p className="card-desc about-card-desc">An exclusive private pool villa designed for peaceful stays and complete relaxation.</p>
            </div>

            <div className="why-box about-why-box-luxury" data-aos="fade-up" data-aos-delay="100">
              <span className="card-number">02</span>
              <span className="ce-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#c8a646" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m8 3 4 8 5-5 5 15H2L8 3z" /><path d="M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19" />
                </svg>
              </span>
              <h3 className="card-title about-card-title">Scenic Wayanad Location</h3>
              <p className="card-desc about-card-desc">Nestled in the serene hills of Wayanad, close to nature, greenery, and calm landscapes.</p>
            </div>

            <div className="why-box about-why-box-luxury" data-aos="fade-up" data-aos-delay="150">
              <span className="card-number">03</span>
              <span className="ce-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#c8a646" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
                  <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
                </svg>
              </span>
              <h3 className="card-title about-card-title">Luxury Interiors</h3>
              <p className="card-desc about-card-desc">Spacious rooms with elegant finishes, warm lighting, and a refined villa atmosphere.</p>
            </div>

            <div className="why-box about-why-box-luxury" data-aos="fade-up" data-aos-delay="50">
              <span className="card-number">04</span>
              <span className="ce-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#c8a646" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </span>
              <h3 className="card-title about-card-title">Curated Experience</h3>
              <p className="card-desc about-card-desc">From plantation walks to cozy evenings, every moment is designed with care.</p>
            </div>

            <div className="why-box about-why-box-luxury" data-aos="fade-up" data-aos-delay="100">
              <span className="card-number">05</span>
              <span className="ce-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#c8a646" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </span>
              <h3 className="card-title about-card-title">Personalized Service</h3>
              <p className="card-desc about-card-desc">A dedicated team ensuring your comfort, privacy, and memorable stay.</p>
            </div>

            <div className="why-box about-why-box-luxury" data-aos="fade-up" data-aos-delay="150">
              <span className="card-number">06</span>
              <span className="ce-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#c8a646" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </span>
              <h3 className="card-title about-card-title">Farm-to-Table Dining</h3>
              <p className="card-desc about-card-desc">Fresh authentic Kerala meals prepared with locally sourced ingredients.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Section: Gallery */}
      <section id="gallery" className="bg-cream about-gallery-section">
        <div className="container" style={{ maxWidth: '1400px', padding: 0 }}>
          <div className="text-center mb-5">
            <span className="section-label about-label" data-aos="fade-up">GALLERY</span>
            <h2 className="section-heading about-heading" data-aos="fade-up" data-aos-delay="50">Glimpses of Paradise</h2>
            <p className="about-gallery-sub" data-aos="fade-up" data-aos-delay="100">A glimpse into peaceful rooms, glowing evenings, and private villa moments.</p>
            <div className="gold-divider center" data-aos="fade-up" data-aos-delay="150"></div>
          </div>

          <div className="gallery-grid">
            {/* Visible first 6 */}
            <div className="gallery-item wide" data-aos="fade-up" data-aos-delay="50">
              <img src="/9301-wholeresortview.PNG" alt="Casa Elara Whole Resort View" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Resort View</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
            <div className="gallery-item large" data-aos="fade-up" data-aos-delay="100">
              <img src="/9284wholepoolview.jpeg" alt="Casa Elara Whole Pool View" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Infinity Pool View</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
            <div className="gallery-item" data-aos="fade-up" data-aos-delay="150">
              <img src="/9286-wholepoolsideview.jpeg" alt="Casa Elara Whole Poolside View" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Poolside Serenity</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
            <div className="gallery-item" data-aos="fade-up" data-aos-delay="50">
              <img src="/9283-poolview.jpeg" alt="Casa Elara Pool View" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Glistening Waters</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
            <div className="gallery-item large" data-aos="fade-up" data-aos-delay="100">
              <img src="/9214_livingroomwithstairs.jpeg" alt="Casa Elara Living Room with Stairs" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Grand Living Space</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
            <div className="gallery-item" data-aos="fade-up" data-aos-delay="150">
              <img src="/9215-diningroom.jpeg" alt="Casa Elara Dining Room" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Curated Dining</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>

            {/* Extra hidden images */}
            <div className="gallery-item extra-item" style={extraItemStyle(galleryExpanded)}>
              <img src="/9211_bedroom-whole.jpeg" alt="Casa Elara Master Bedroom" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Master Sanctuary</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
            <div className="gallery-item extra-item wide" style={extraItemStyle(galleryExpanded)}>
              <img src="/9233-anotherbedrromwithattractive.jpeg" alt="Casa Elara Premium Suite" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Royal Suite</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
            <div className="gallery-item extra-item large" style={extraItemStyle(galleryExpanded)}>
              <img src="/9243-goodbedroom.jpeg" alt="Casa Elara Deluxe Room" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Deluxe Retreat</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
            <div className="gallery-item extra-item" style={extraItemStyle(galleryExpanded)}>
              <img src="/9232-anotherbedroom.jpeg" alt="Casa Elara Guest Room" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Comfort Suite</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
            <div className="gallery-item extra-item" style={extraItemStyle(galleryExpanded)}>
              <img src="/9208_bedroom.jpeg" alt="Casa Elara Cozy Bedroom" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Garden Suite</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
            <div className="gallery-item extra-item wide" style={extraItemStyle(galleryExpanded)}>
              <img src="/9245-averagebedroom1.jpeg" alt="Casa Elara Bedroom Space" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Warm Sanctuary</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
            <div className="gallery-item extra-item" style={extraItemStyle(galleryExpanded)}>
              <img src="/averageroom.jpeg" alt="Casa Elara Suite Room" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Serene Hideaway</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
            <div className="gallery-item extra-item" style={extraItemStyle(galleryExpanded)}>
              <img src="/9212-livingroomentryfrominside.jpeg" alt="Casa Elara Living Room Entry" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Living Room Entry</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
            <div className="gallery-item extra-item" style={extraItemStyle(galleryExpanded)}>
              <img src="/9224-bathroom.jpeg" alt="Casa Elara En-suite Bathroom" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Luxury Bathroom</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
            <div className="gallery-item extra-item" style={extraItemStyle(galleryExpanded)}>
              <img src="/9247-bathroom.jpeg" alt="Casa Elara Premium Bathroom" loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="overlay-text">Modern Bath Space</span>
                <div className="zoom-icon"><i data-lucide="zoom-in"></i></div>
              </div>
            </div>
          </div>

          <div className="gallery-btn-container" style={{ textAlign: 'center', marginTop: '50px', marginBottom: '30px' }} data-aos="fade-up">
            <button
              id="gallery-toggle-btn"
              className={`btn btn-gold btn-ripple gallery-toggle-btn${galleryExpanded ? ' expanded-state' : ''}`}
              onClick={handleGalleryToggle}
            >
              <span className="btn-text">{galleryExpanded ? 'Show Less' : 'See More'}</span>
              <i data-lucide="chevron-down" className="btn-icon" style={{ marginLeft: '8px', width: '18px', height: '18px', transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)', transform: galleryExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}></i>
            </button>
          </div>
        </div>
      </section>

      {/* Section: Philosophy */}
      <section className="philosophy about-philosophy-luxury-section">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="container about-philosophy-container" data-aos="fade-up">
          <span className="philosophy-label">CASA ELARA PHILOSOPHY</span>
          <div className="about-philosophy-card-luxury">
            <div className="quote-mark-bg">"</div>
            <h3 className="about-philosophy-quote">"Our true luxury is giving you the time and space to disconnect from the world and reconnect with yourself."</h3>
            <div className="gold-divider center"></div>
            <p className="philosophy-sub">A stay designed for stillness, privacy, and soulful comfort.</p>
            <div className="philosophy-tags">
              <div className="tag-pill"><i data-lucide="shield"></i>Privacy</div>
              <div className="tag-pill"><i data-lucide="leaf"></i>Peace</div>
              <div className="tag-pill"><i data-lucide="flower"></i>Nature</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: CTA Banner */}
      <section className="cta-banner parallax-bg about-cta-section-luxury">
        <div className="cta-overlay about-cta-overlay-gold"></div>
        <div className="container cta-content about-cta-content-luxury" data-aos="fade-up">
          <div className="script-hero mb-2 about-cta-small-gold">Ready to Escape?</div>
          <h2 className="section-heading about-cta-heading-luxury">Book Your Stay at Casa Elara</h2>
          <div className="gold-divider center" style={{ marginBottom: '20px' }}></div>
          <p className="about-cta-p-luxury">Create unforgettable memories in God's Own Country.</p>
          <div className="cta-buttons about-cta-buttons-luxury">
            <a href="https://wa.me/919292004162?text=Hi!%20I%27d%20like%20to%20book%20a%20stay%20at%20Casa%20Elara%20Luxury%20Pool%20Villa.%20Please%20share%20availability%20and%20pricing." target="_blank" rel="noopener noreferrer" className="btn btn-gold about-btn-book-luxury">BOOK NOW</a>
            <Link to="/contact" className="btn btn-outline-white about-btn-contact-luxury">CONTACT US</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-deluxe">
        <div className="footer-gold-line"></div>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col" data-aos="fade-up" data-aos-delay="0">
              <img src="/logo_transparent.png" alt="Casa Elara" className="footer-logo" />
              <p>A luxury pool villa experience nestled in the heart of Wayanad, Kerala.</p>
            </div>
            <div className="footer-col" data-aos="fade-up" data-aos-delay="100">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/about#gallery">Gallery</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><a href="https://wa.me/919292004162?text=Hi!%20I%27d%20like%20to%20book%20a%20stay%20at%20Casa%20Elara%20Luxury%20Pool%20Villa.%20Please%20share%20availability%20and%20pricing." target="_blank" rel="noopener noreferrer">Book Now</a></li>
              </ul>
            </div>
            <div className="footer-col" data-aos="fade-up" data-aos-delay="200">
              <h4 className="footer-heading">Contact Us</h4>
              <ul className="footer-contact">
                <li><i data-lucide="phone"></i> <a href="tel:+919292004162">+91 9292004162</a></li>
                <li><i data-lucide="phone"></i> <a href="tel:+917306457086">+91 7306457086</a></li>
                <li><i data-lucide="phone"></i> <a href="tel:04936293328">0493 6293328</a></li>
                <li><i data-lucide="map-pin"></i> <span>Cholapuram, Pinangode, Wayanad</span></li>
                <li><i data-lucide="mail"></i> <a href="mailto:Casaelara.villa@gmail.com">Casaelara.villa@gmail.com</a></li>
              </ul>
            </div>
            <div className="footer-col" data-aos="fade-up" data-aos-delay="300">
              <h4 className="footer-heading">Follow Us</h4>
              <div className="social-icons">
                <a href="https://www.instagram.com/casa__elara" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a href="https://wa.me/919292004162" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
           <div className="footer-bottom" data-aos="fade-up" data-aos-delay="400">
            <div>&copy; 2026 Casa Elara. All rights reserved.</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <a href="https://linkedin.com/in/dinnypaulnavisc" target="_blank" rel="noopener noreferrer" className="developer-credit">Created by Green Sync Innovators</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Lightbox */}
      <div className="lightbox" id="lightbox">
        <button className="lightbox-close" aria-label="Close"><i data-lucide="x"></i></button>
        <button className="lightbox-prev" aria-label="Previous"><i data-lucide="chevron-left"></i></button>
        <button className="lightbox-next" aria-label="Next"><i data-lucide="chevron-right"></i></button>
        <div className="lightbox-counter">1 / 12</div>
        <img className="lightbox-image" src="" alt="" />
      </div>

      {/* WhatsApp Float */}
      <a href="https://wa.me/919292004162?text=Hi!%20I%27d%20like%20to%20know%20more%20about%20Casa%20Elara%20Luxury%20Pool%20Villa." target="_blank" rel="noopener noreferrer" className="whatsapp-float v4-wa-float" aria-label="Chat on WhatsApp">
        <div className="v4-wa-ring"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="var(--tropical-gold)">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
      <button className="scroll-top" id="scrollTop" aria-label="Scroll to top">
        <i data-lucide="chevron-up"></i>
      </button>

      {/* About page inline styles */}
      <style>{`
        .page-hero { position: relative; height: 650px; display: flex; align-items: center; justify-content: center; text-align: center; color: white; overflow: hidden; background-color: #032314; }
        .about-hero-slider { position: absolute !important; top: 0; left: 0; width: 100%; height: 130% !important; z-index: 0; pointer-events: none; transform: translateY(0); will-change: transform; }
        .about-hero-slider .hero-slide { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; opacity: 0; animation: kenburns 24s infinite; }
        .about-hero-overlay-luxury { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at center, rgba(200, 168, 78, 0.12) 0%, rgba(3, 35, 20, 0.85) 60%, rgba(2, 20, 12, 0.95) 100%); z-index: 1; }
        .about-hero-content { position: relative; z-index: 2; max-width: 800px; padding: 0 20px; }
        .about-hero-content .hero-title { font-family: 'Playfair Display', serif; font-size: 64px; font-weight: 700; color: #FAFDF8; text-shadow: 0 0 20px rgba(200, 168, 78, 0.45); margin-bottom: 10px; }
        .about-hero-content .hero-gold-line { width: 0; height: 2px; background: #C8A84E; margin: 15px auto 25px auto; box-shadow: 0 0 8px #C8A84E; animation: expandDivider 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 0.4s; }
        @keyframes expandDivider { to { width: 100px; } }
        .hero-kicker { display: block; font-size: 11px; letter-spacing: 5px; color: #C8A84E; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .hero-breadcrumb { font-family: 'DM Sans', sans-serif; font-size: 13px; color: rgba(255, 255, 255, 0.7); display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; }
        .story-section { display: flex; align-items: center; gap: 60px; }
        .story-text { flex: 0 0 55%; }
        .story-visual { flex: 0 0 45%; }
        .why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 50px; }
        .why-box { background: white; border-radius: 12px; padding: 32px 24px; text-align: center; box-shadow: var(--shadow-card); transition: all 0.35s ease; border-top: 0px solid var(--tropical-gold); }
        .why-box:hover { transform: translateY(-6px); box-shadow: var(--shadow-card-hover); border-top: 3px solid var(--tropical-gold); }
        .why-box .card-title { font-size: 18px; margin-bottom: 12px; }
        .ce-icon-wrap { display: block; text-align: center; margin: 15px auto 25px auto; line-height: 0; }
        .ce-icon-wrap svg { display: inline-block !important; width: 44px !important; height: 44px !important; }
        .about-why-box-luxury svg path,
        .about-why-box-luxury svg line,
        .about-why-box-luxury svg circle,
        .about-why-box-luxury svg polyline,
        .about-why-box-luxury svg polygon,
        .about-why-box-luxury svg rect {
          stroke-dasharray: none !important;
          stroke-dashoffset: 0 !important;
          transition: none !important;
        }
        .about-features-section .cursor-dot { display: none !important; }
        .about-gallery-section { padding: 100px 0; background-color: var(--cream-white); }
        .gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 280px; gap: 20px; padding: 0 30px; margin-top: 40px; }
        .gallery-item { border-radius: 16px; overflow: hidden; position: relative; cursor: pointer; box-shadow: 0 10px 25px rgba(0, 40, 20, 0.08); border: 1px solid rgba(200, 168, 78, 0.15); transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.4s ease; }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .gallery-item-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(3, 35, 20, 0.4) 0%, rgba(2, 20, 12, 0.85) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; z-index: 2; transition: opacity 0.4s ease; padding: 20px; }
        .gallery-item-overlay::before { content: ''; position: absolute; inset: 12px; border: 1px solid rgba(200, 168, 78, 0.3); border-radius: 10px; pointer-events: none; transform: scale(0.9); transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .gallery-item:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(200, 168, 78, 0.25); border-color: var(--tropical-gold); }
        .gallery-item:hover img { transform: scale(1.08); }
        .gallery-item:hover .gallery-item-overlay { opacity: 1; }
        .gallery-item:hover .gallery-item-overlay::before { transform: scale(1); }
        .overlay-text { font-family: 'Playfair Display', serif; font-size: 22px; color: #FAFDF8; font-weight: 600; letter-spacing: 1px; margin-bottom: 8px; transform: translateY(15px); transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .gallery-item:hover .overlay-text { transform: translateY(0); }
        .zoom-icon { background: rgba(200, 168, 78, 0.9); color: #032314; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transform: translateY(15px) scale(0.8); transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.3s ease; }
        .gallery-item:hover .zoom-icon { transform: translateY(0) scale(1); }
        .zoom-icon svg { width: 20px; height: 20px; stroke: currentColor; }
        .gallery-item.large { grid-row: span 2; }
        .gallery-item.wide { grid-column: span 2; }
        .gallery-toggle-btn { background: var(--tropical-gold) !important; color: #032314 !important; border: 1px solid var(--tropical-gold) !important; padding: 15px 45px !important; font-weight: 700 !important; font-size: 14px !important; letter-spacing: 2px !important; box-shadow: 0 4px 15px rgba(200, 168, 78, 0.4) !important; transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important; }
        .gallery-toggle-btn:hover { background: #032314 !important; color: var(--tropical-gold) !important; transform: translateY(-3px) scale(1.03); box-shadow: 0 8px 25px rgba(200, 168, 78, 0.5) !important; }
        .gallery-toggle-btn.expanded-state { background: transparent !important; color: var(--tropical-gold) !important; border: 2px solid var(--tropical-gold) !important; box-shadow: none !important; }
        .gallery-toggle-btn.expanded-state:hover { background: var(--tropical-gold) !important; color: #032314 !important; box-shadow: 0 8px 25px rgba(200, 168, 78, 0.3) !important; }
        .philosophy { padding: 100px 0; background: var(--pale-sage); text-align: center; }
        .cta-banner { position: relative; padding: 120px 0; text-align: center; background-image: url('/9232-anotherbedroom.jpeg'); }
        .cta-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(0, 50, 25, 0.7), rgba(0, 50, 25, 0.8)); }
        .cta-content { position: relative; z-index: 1; color: white; max-width: 600px; margin: 0 auto; }
        .cta-buttons { display: flex; gap: 20px; justify-content: center; margin-top: 40px; }
        @media (max-width: 1024px) {
          .story-section { flex-direction: column; }
          .why-grid { grid-template-columns: repeat(2, 1fr); }
          .gallery-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 240px; gap: 15px; padding: 0 15px; }
          .about-hero-new .hero-title { font-size: 52px; }
        }
        @media (max-width: 768px) {
          .why-grid { grid-template-columns: 1fr; }
          .gallery-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 180px; gap: 10px; padding: 0 10px; }
          .gallery-item.large { grid-row: span 1; }
          .gallery-item.wide { grid-column: span 1; }
          .about-hero-new .hero-title { font-size: 40px; }
          .gallery-toggle-btn { padding: 12px 35px !important; font-size: 13px !important; }
        }
        @media (max-width: 480px) {
          .gallery-grid { grid-template-columns: 1fr; grid-auto-rows: 240px; }
        }
      `}</style>
    </div>
  )
}
