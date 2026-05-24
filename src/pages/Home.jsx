import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  useEffect(() => {
    // Load AOS and Lucide from CDN scripts (already in index.html via unpkg)
    // Re-initialize after route change
    if (window.AOS) {
      window.AOS.init({
        duration: 600,
        easing: 'ease-out-cubic',
        once: true,
        offset: 60,
        disable: false
      })
    }
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, [])

  useEffect(() => {
    // 1. Loading Screen (V4 Redesign)
    const loaderSplit = document.getElementById('page-loader')
    if (!sessionStorage.getItem('casa-elara-loaded-v4')) {
      sessionStorage.setItem('casa-elara-loaded-v4', 'true')
      const loaderTitle = document.getElementById('loader-title')
      if (loaderTitle) {
        loaderTitle.innerHTML = ''
        const titleText = 'C A S A   E L A R A'
        titleText.split('').forEach((char, i) => {
          const span = document.createElement('span')
          span.innerHTML = char === ' ' ? '&nbsp;' : char
          span.style.animationDelay = `${0.5 + i * 0.08}s`
          loaderTitle.appendChild(span)
        })
      }
      // All animations finish at ~3.0s (subtitle ends at 2.2s + 0.8s)
      // Wait 900ms after everything is visible, then split-close (0.8s), then hide
      const t = setTimeout(() => {
        if (loaderSplit) {
          loaderSplit.classList.add('split-active')
          setTimeout(() => {
            if (loaderSplit) loaderSplit.style.display = 'none'
          }, 900)
        }
      }, 3900)
      return () => clearTimeout(t)
    } else {
      if (loaderSplit) loaderSplit.style.display = 'none'
    }
  }, [])

  useEffect(() => {
    // 2. Gold Divider Line Animation
    const dividers = document.querySelectorAll('.section-divider')
    let dividerObserver
    if (dividers.length > 0) {
      dividerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated')
            dividerObserver.unobserve(entry.target)
          }
        })
      }, { threshold: 0.1 })
      dividers.forEach(d => dividerObserver.observe(d))
    }

    // 3. Icon Stroke Animation
    const featureCards = document.querySelectorAll('.feature-card, .why-box')
    let iconObserver
    if (featureCards.length > 0) {
      iconObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animated')
            }, index * 100)
            iconObserver.unobserve(entry.target)
          }
        })
      }, { threshold: 0.1 })
      featureCards.forEach(card => iconObserver.observe(card))
    }

    // 4. Counter Stats Animation
    function animateCounter(element, target, duration = 2000) {
      let start = 0
      const startTime = performance.now()
      function update(currentTime) {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = Math.floor(eased * target)
        element.textContent = current + (element.dataset.suffix || '')
        if (progress < 1) {
          requestAnimationFrame(update)
        } else {
          element.textContent = target + (element.dataset.suffix || '')
        }
      }
      requestAnimationFrame(update)
    }

    const statsSection = document.querySelector('.stats-section')
    let statsObserver
    let statsCounted = false
    if (statsSection) {
      statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !statsCounted) {
          statsCounted = true
          statsSection.classList.add('animate-stats')
          document.querySelectorAll('.stat-number').forEach(el => {
            animateCounter(el, parseInt(el.dataset.target), 2200)
          })
        }
      }, { threshold: 0.3 })
      statsObserver.observe(statsSection)
    }

    return () => {
      if (dividerObserver) dividerObserver.disconnect()
      if (iconObserver) iconObserver.disconnect()
      if (statsObserver) statsObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    // 5. Navbar Scroll Behavior
    const navbar = document.getElementById('navbar')
    const navbarWrapper = document.getElementById('navbar-wrapper')
    const heroSlider = document.querySelector('.hero-slider')
    const hero = document.querySelector('.hero')

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

    if (navbar && hero) {
      window.addEventListener('scroll', onScroll)
    }

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // 6. Scroll-to-Top Button
    const scrollTopBtn = document.getElementById('scrollTop')
    function onScroll() {
      if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 500)
    }
    function onClickTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    if (scrollTopBtn) {
      window.addEventListener('scroll', onScroll)
      scrollTopBtn.addEventListener('click', onClickTop)
    }
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (scrollTopBtn) scrollTopBtn.removeEventListener('click', onClickTop)
    }
  }, [])

  useEffect(() => {
    // 7. Mobile Menu
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
      mobileMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu)
      })
    }
    return () => {
      if (hamburger) hamburger.removeEventListener('click', onHamburger)
      if (mobileMenu) {
        mobileMenu.querySelectorAll('.nav-link').forEach(link => {
          link.removeEventListener('click', closeMenu)
        })
      }
    }
  }, [])

  useEffect(() => {
    // 8. Testimonial Carousel
    const testiViewport = document.querySelector('.v4-testi-viewport')
    const track = document.getElementById('testi-track')
    const prevBtn = document.querySelector('.v4-testi-prev')
    const nextBtn = document.querySelector('.v4-testi-next')
    const dotsContainer = document.getElementById('testi-dots')

    if (!track || !testiViewport || !dotsContainer) return

    track.style.animation = 'none'
    const cards = track.querySelectorAll('.v4-testi-card')
    if (!cards.length) return

    let currentIndex = 0
    const totalItems = cards.length - 1
    const isMobile = () => window.innerWidth <= 768

    function getOffset(index) {
      if (isMobile()) {
        return `translateX(-${index * 100}%)`
      }
      const cardWidth = cards[0].offsetWidth + 30
      return `translateX(-${index * cardWidth}px)`
    }

    dotsContainer.innerHTML = ''
    for (let i = 0; i < totalItems; i++) {
      const dot = document.createElement('div')
      dot.className = `v4-dot ${i === 0 ? 'active' : ''}`
      dot.addEventListener('click', () => goToSlide(i))
      dotsContainer.appendChild(dot)
    }
    const dots = dotsContainer.querySelectorAll('.v4-dot')

    function updateDots() {
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex % totalItems))
    }
    function goToSlide(index) {
      currentIndex = index
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      track.style.transform = getOffset(currentIndex)
      updateDots()
    }
    function nextSlide() {
      currentIndex++
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      track.style.transform = getOffset(currentIndex)
      if (currentIndex >= totalItems) {
        setTimeout(() => {
          track.style.transition = 'none'
          currentIndex = 0
          track.style.transform = getOffset(0)
        }, 500)
      }
      updateDots()
    }
    function prevSlide() {
      if (currentIndex <= 0) {
        track.style.transition = 'none'
        currentIndex = totalItems
        track.style.transform = getOffset(currentIndex)
        track.offsetHeight
      }
      currentIndex--
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      track.style.transform = getOffset(currentIndex)
      updateDots()
    }

    const onNext = () => { nextSlide(); clearInterval(autoSlide); autoSlide = setInterval(nextSlide, 5000) }
    const onPrev = () => { prevSlide(); clearInterval(autoSlide); autoSlide = setInterval(nextSlide, 5000) }
    if (nextBtn) nextBtn.addEventListener('click', onNext)
    if (prevBtn) prevBtn.addEventListener('click', onPrev)

    let autoSlide = setInterval(nextSlide, 5000)

    const wrapper = document.querySelector('.v4-testi-wrapper')
    const pauseFn = () => clearInterval(autoSlide)
    const resumeFn = () => { autoSlide = setInterval(nextSlide, 5000) }
    if (wrapper) {
      wrapper.addEventListener('mouseenter', pauseFn)
      wrapper.addEventListener('mouseleave', resumeFn)
    }

    return () => {
      clearInterval(autoSlide)
      if (nextBtn) nextBtn.removeEventListener('click', onNext)
      if (prevBtn) prevBtn.removeEventListener('click', onPrev)
      if (wrapper) {
        wrapper.removeEventListener('mouseenter', pauseFn)
        wrapper.removeEventListener('mouseleave', resumeFn)
      }
    }
  }, [])

  useEffect(() => {
    // 9. Custom Cursor
    if (window.innerWidth <= 768) return
    const cursorDot = document.createElement('div')
    cursorDot.classList.add('cursor-dot')
    document.body.appendChild(cursorDot)
    let cursorX = window.innerWidth / 2
    let cursorY = window.innerHeight / 2
    let dotX = cursorX
    let dotY = cursorY
    let animId

    const onMouseMove = (e) => { cursorX = e.clientX; cursorY = e.clientY }
    document.addEventListener('mousemove', onMouseMove)

    function animateCursor() {
      dotX += (cursorX - dotX) * 0.2
      dotY += (cursorY - dotY) * 0.2
      cursorDot.style.left = `${dotX}px`
      cursorDot.style.top = `${dotY}px`
      animId = requestAnimationFrame(animateCursor)
    }
    animateCursor()

    const interactables = document.querySelectorAll('a, button, .feature-card, .room-image')
    const enterFn = () => {
      cursorDot.style.width = '16px'
      cursorDot.style.height = '16px'
      cursorDot.style.backgroundColor = 'var(--tropical-gold)'
      cursorDot.style.boxShadow = '0 0 15px rgba(200, 168, 78, 0.8)'
    }
    const leaveFn = () => {
      cursorDot.style.width = '8px'
      cursorDot.style.height = '8px'
      cursorDot.style.backgroundColor = 'var(--lush-green)'
      cursorDot.style.boxShadow = '0 0 10px rgba(26, 122, 76, 0.8)'
    }
    interactables.forEach(el => {
      el.addEventListener('mouseenter', enterFn)
      el.addEventListener('mouseleave', leaveFn)
    })

    return () => {
      cancelAnimationFrame(animId)
      document.removeEventListener('mousemove', onMouseMove)
      if (cursorDot.parentNode) document.body.removeChild(cursorDot)
    }
  }, [])

  useEffect(() => {
    // 10. Split Text Animations
    const ctaHeadline = document.getElementById('cta-headline')
    if (ctaHeadline) {
      const text = ctaHeadline.innerText
      const words = text.split(' ')
      ctaHeadline.innerHTML = ''
      words.forEach((word, index) => {
        const span = document.createElement('span')
        span.innerText = word + ' '
        span.className = 'split-word'
        const centerIndex = Math.floor(words.length / 2)
        const dist = Math.abs(index - centerIndex)
        span.style.transitionDelay = `${0.1 + dist * 0.1}s`
        ctaHeadline.appendChild(span)
      })
    }

    const welcomeHeading = document.getElementById('welcome-heading')
    if (welcomeHeading) {
      const text = welcomeHeading.innerText
      const words = text.split(' ')
      welcomeHeading.innerHTML = ''
      words.forEach((word, index) => {
        const span = document.createElement('span')
        span.innerText = word + ' '
        span.className = 'split-word'
        span.style.transitionDelay = `${0.1 + index * 0.1}s`
        welcomeHeading.appendChild(span)
      })
    }

    const heroHeadline = document.getElementById('hero-headline')
    if (heroHeadline) {
      const text = heroHeadline.innerText
      heroHeadline.innerHTML = ''
      text.split('').forEach((char, index) => {
        const span = document.createElement('span')
        span.innerText = char === ' ' ? ' ' : char
        span.className = 'char'
        span.style.animationDelay = `${0.8 + index * 0.1}s`
        heroHeadline.appendChild(span)
      })
    }
  }, [])

  useEffect(() => {
    // 11. Footer Gold Line
    const footerDeluxe = document.querySelector('.footer-deluxe')
    let footerObserver
    if (footerDeluxe) {
      footerObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          footerDeluxe.classList.add('aos-animate')
        }
      }, { threshold: 0.1 })
      footerObserver.observe(footerDeluxe)
    }
    return () => { if (footerObserver) footerObserver.disconnect() }
  }, [])

  useEffect(() => {
    // 12. V5 Testimonial Stars Observer
    const starContainers = document.querySelectorAll('.v5-stars-container')
    let starsObserver
    if (starContainers.length > 0) {
      starsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate')
          } else {
            entry.target.classList.remove('animate')
          }
        })
      }, { threshold: 0.2 })
      starContainers.forEach(container => starsObserver.observe(container))
    }
    return () => { if (starsObserver) starsObserver.disconnect() }
  }, [])

  useEffect(() => {
    // Re-init AOS and Lucide after DOM ready
    const timer = setTimeout(() => {
      if (window.AOS) {
        window.AOS.init({
          duration: 600,
          easing: 'ease-out-cubic',
          once: true,
          offset: 60,
          disable: false
        })
        window.AOS.refresh()
      }
      if (window.lucide) {
        window.lucide.createIcons()
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Loading Screen */}
      <div className="loader-split-container" id="page-loader">
        <div className="loader-half loader-top"></div>
        <div className="loader-half loader-bottom"></div>
        <div className="shimmer-particles"></div>
        <div className="loader-content-v4">
          <div className="loader-ring-v4-wrapper">
            <svg className="loader-ring-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" />
            </svg>
            <img src="/logo_transparent.png" alt="Casa Elara" className="loader-logo-v4" />
          </div>
          <div className="loader-title-v4" id="loader-title"></div>
          <div className="loader-subtitle-v4">L U X U R Y &nbsp; P O O L &nbsp; V I L L A</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="navbar-wrapper" id="navbar-wrapper">
        <nav id="navbar" className="navbar">
          <div className="container nav-container">
            <Link to="/" className="nav-logo">
              <img src="/logo_transparent.png" alt="Casa Elara" />
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link active">Home</Link>
              <Link to="/about" className="nav-link">About Us</Link>
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
        <Link to="/about" className="nav-link">About Us</Link>
        <Link to="/contact" className="nav-link">Contact</Link>
        <a href="https://wa.me/919292004162?text=Hi!%20I%27d%20like%20to%20book%20a%20stay%20at%20Casa%20Elara%20Luxury%20Pool%20Villa.%20Please%20share%20availability%20and%20pricing." target="_blank" rel="noopener noreferrer" className="btn btn-primary nav-btn btn-ripple">Book Now</a>
      </div>

      {/* Section 1: Hero */}
      <header className="hero">
        <div className="hero-slider">
          <div className="hero-slide" style={{ backgroundImage: "url('/9301-wholeresortview.PNG')" }}></div>
          <div className="hero-slide" style={{ backgroundImage: "url('/9283-poolview.jpeg')" }}></div>
          <div className="hero-slide" style={{ backgroundImage: "url('/9284wholepoolview.jpeg')" }}></div>
          <div className="hero-slide" style={{ backgroundImage: "url('/9286-wholepoolsideview.jpeg')" }}></div>
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="script-hero" data-aos="fade-up" data-aos-duration="1200" data-aos-easing="ease-out">Welcome to</div>
          <h1 className="heading-hero" id="hero-headline">Casa Elara</h1>
          <div className="sub-hero mb-3" data-aos="fade-right" data-aos-delay="2500" data-aos-duration="1000">LUXURY POOL VILLA</div>
          <p className="pull-quote mb-4 text-shimmer" data-aos="fade-up" data-aos-delay="3000" data-aos-duration="2000" style={{ color: 'var(--soft-gold)' }}>Your Private Paradise in Wayanad</p>
          <div data-aos="zoom-in-up" data-aos-delay="3500" data-aos-duration="1000">
            <a href="#welcome" className="btn btn-explore">Explore Our Villa</a>
          </div>
        </div>
        <div className="v6-scroll-indicator">
          <i data-lucide="chevron-down" className="v6-scroll-arrow"></i>
          <span className="v6-scroll-text">S C R O L L &nbsp; D O W N</span>
        </div>
      </header>

      <div className="wave-divider wave-sage">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0,0 C320,120 420,120 720,60 C1020,0 1120,0 1440,60 L1440,120 L0,120 Z" fill="var(--pale-sage)"></path></svg>
      </div>

      {/* Section 2: Welcome */}
      <section id="welcome" className="bg-sage-pattern">
        <div className="container welcome-section">
          <div className="welcome-text v5-welcome-text">
            <span className="section-label v5-welcome-label" data-aos="fade-in" data-aos-duration="800">— WELCOME TO PARADISE —</span>
            <h2 className="section-heading v5-welcome-heading" id="welcome-heading">Experience Luxury Amidst Nature</h2>
            <div className="section-divider animated-underline v5-welcome-line" data-aos="fade-right" data-aos-delay="400"></div>

            <div className="paradise-intro" data-aos="fade-up" data-aos-delay="500">
              <span className="intro-label">Luxury • Nature • Privacy</span>
              <h2>Where Luxury Meets Nature</h2>
              <div className="gold-divider"></div>
              <p>
                Discover a peaceful private pool villa surrounded by the calm beauty of Wayanad,
                crafted for comfort, privacy, and unforgettable memories.
              </p>
              <div className="intro-highlights">
                <div className="intro-highlight">
                  <span>✦</span>
                  <p>Private Pool Villa</p>
                </div>
                <div className="intro-highlight">
                  <span>✦</span>
                  <p>Scenic Wayanad Stay</p>
                </div>
                <div className="intro-highlight">
                  <span>✦</span>
                  <p>Peaceful Luxury Escape</p>
                </div>
              </div>
              <div className="intro-quote">
                "A private paradise where every stay feels personal."
              </div>
            </div>

            <p className="v5-p" data-aos="fade-up" data-aos-delay="600">Nestled in the lush hills of Wayanad, Casa Elara is born from a dream to offer an unparalleled luxury resort experience. Here, modern elegance meets the wild, pristine beauty of the Western Ghats.</p>
            <p className="v5-p" data-aos="fade-up" data-aos-delay="800">Surrounded by rolling tea estates and dense forests, our luxury pool villa offers a serene escape from the everyday. Breathe in the crisp mountain air and let nature soothe your soul.</p>
            <p className="v5-p" data-aos="fade-up" data-aos-delay="1000">Our philosophy is simple: personalised hospitality where every detail is curated for your comfort, ensuring memories that last a lifetime.</p>
            <div className="animated-blockquote v5-blockquote" data-aos="fade-left" data-aos-delay="1200">
              <p className="pull-quote v5-quote-text">"Where the Western Ghats meet pure luxury"</p>
            </div>
          </div>
          <div className="welcome-visual" data-aos="fade-left" data-aos-duration="1200" data-aos-delay="200">
            <div className="v5-image-wrapper">
              <div className="v5-shadow-card"></div>
              <svg className="v5-leaf-deco" viewBox="0 0 24 24" fill="none" stroke="var(--lush-green)" strokeWidth="1.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>
              <img src="/9283-poolview.jpeg" alt="Welcome to Casa Elara" className="v5-welcome-img" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Highlights */}
      <section className="bg-forest-bokeh">
        <div className="container">
          <div className="text-center">
            <span className="section-label" data-aos="fade-up" style={{ color: 'var(--tropical-gold)' }}>— WHAT WE OFFER —</span>
            <h2 className="section-heading" data-aos="fade-up" data-aos-delay="100" style={{ color: 'var(--pure-white)' }}>The Casa Elara Experience</h2>
            <div className="section-divider center animated-underline" data-aos="fade-up" data-aos-delay="200"></div>
          </div>
          <div className="highlights-grid">
            <div className="feature-card glass-card" data-aos="fade-up" data-aos-delay="0">
              <div className="highlight-icon">
                <i data-lucide="waves" className="icon-line" style={{ width: '44px', height: '44px', stroke: '#C8A84E', strokeWidth: '1.5px' }}></i>
              </div>
              <h3 className="card-title">Private Infinity Pool</h3>
              <p className="card-desc">Dive into crystal clear waters with a stunning mountain backdrop.</p>
            </div>
            <div className="feature-card glass-card" data-aos="fade-up" data-aos-delay="150">
              <div className="highlight-icon">
                <i data-lucide="mountain" className="icon-line" style={{ width: '44px', height: '44px', stroke: '#C8A84E', strokeWidth: '1.5px' }}></i>
              </div>
              <h3 className="card-title">Breathtaking Views</h3>
              <p className="card-desc">Western Ghats panorama and misty mornings from your balcony.</p>
            </div>
            <div className="feature-card glass-card" data-aos="fade-up" data-aos-delay="300">
              <div className="highlight-icon">
                <i data-lucide="bed-double" className="icon-line" style={{ width: '44px', height: '44px', stroke: '#C8A84E', strokeWidth: '1.5px' }}></i>
              </div>
              <h3 className="card-title">Luxury Suites</h3>
              <p className="card-desc">Premium furnishings and modern amenities for supreme comfort.</p>
            </div>
            <div className="feature-card glass-card" data-aos="fade-up" data-aos-delay="450">
              <div className="highlight-icon">
                <i data-lucide="utensils-crossed" className="icon-line" style={{ width: '44px', height: '44px', stroke: '#C8A84E', strokeWidth: '1.5px' }}></i>
              </div>
              <h3 className="card-title">Curated Dining</h3>
              <p className="card-desc">Authentic Kerala cuisine prepared with fresh local ingredients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Stats */}
      <div className="wave-divider wave-stats-top" style={{ marginTop: '-60px', position: 'relative', zIndex: 2 }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0,120 C320,0 420,0 720,60 C1020,120 1120,120 1440,60 L1440,0 L0,0 Z" fill="var(--deep-forest)"></path></svg>
      </div>
      <section className="stats-section parallax-bg">
        <div className="stats-overlay-v6"></div>
        <div className="container v6-stats-container">
          <div className="v6-stats-intro" data-aos="fade-in" data-aos-duration="1000">
            <span className="v6-intro-line">—</span> Where Wayanad's Wild Soul Meets Refined Living <span className="v6-intro-line">—</span>
          </div>
          <div className="stats-grid v4-stats" id="stats-container">
            <div className="stat-item v4-stat-item">
              <div className="stat-number v4-stat-number" data-target="7" data-suffix="+">0</div>
              <div className="v4-stat-divider"></div>
              <div className="v6-stat-label">Luxury Rooms</div>
              <div className="v6-stat-sublabel">Elegantly designed for comfort</div>
            </div>
            <div className="stat-item v4-stat-item">
              <div className="stat-number v4-stat-number" data-target="1" data-suffix="">0</div>
              <div className="v4-stat-divider"></div>
              <div className="v6-stat-label">Private Pool</div>
              <div className="v6-stat-sublabel">Your exclusive infinity escape</div>
            </div>
            <div className="stat-item v4-stat-item">
              <div className="stat-number v4-stat-number" data-target="2" data-suffix="+">0</div>
              <div className="v4-stat-divider"></div>
              <div className="v6-stat-label">Acres of Greenery</div>
              <div className="v6-stat-sublabel">Surrounded by Wayanad forest</div>
            </div>
            <div className="stat-item v4-stat-item">
              <div className="stat-number v4-stat-number" data-target="100" data-suffix="+">0</div>
              <div className="v4-stat-divider"></div>
              <div className="v6-stat-label">Happy Guests</div>
              <div className="v6-stat-sublabel">And memories made forever</div>
            </div>
          </div>
        </div>
      </section>
      <div className="wave-divider wave-cream" style={{ position: 'relative', zIndex: 2, transform: 'scaleY(-1)', marginTop: '-1px' }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0,120 C320,0 420,0 720,60 C1020,120 1120,120 1440,60 L1440,0 L0,0 Z" fill="var(--cream-white)"></path></svg>
      </div>

      {/* Section 5: Rooms */}
      <section className="bg-cream">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-label" data-aos="fade-up">— OUR SPACES —</span>
            <h2 className="section-heading" data-aos="fade-up" data-aos-delay="100">Rooms &amp; Suites</h2>
            <div className="section-divider center" data-aos="fade-up" data-aos-delay="200"></div>
          </div>

          <div className="room-row">
            <div className="room-image room-warm" data-aos="fade-right">
              <img src="/9233-anotherbedrromwithattractive.jpeg" alt="Master Suite" loading="lazy" />
              <div className="room-overlay">
                <span className="room-overlay-text">View Room &rarr;</span>
              </div>
            </div>
            <div className="room-info" data-aos="fade-left">
              <span className="section-label" style={{ letterSpacing: '5px', fontSize: '11px' }}>— MASTER SUITE —</span>
              <h3 className="sub-heading" style={{ fontSize: '28px', color: 'var(--charcoal)' }}>The Royal Retreat</h3>
              <p className="card-desc mb-3">Experience the pinnacle of luxury in our master suite, featuring expansive windows overlooking the valley, a private seating area, and elegant handcrafted decor.</p>
              <div className="amenities-row">
                <div className="amenity"><i data-lucide="snowflake"></i><span>AC</span></div>
                <div className="amenity"><i data-lucide="wifi"></i><span>WiFi</span></div>
                <div className="amenity"><i data-lucide="monitor"></i><span>TV</span></div>
                <div className="amenity"><i data-lucide="thermometer-sun"></i><span>Hot Water</span></div>
              </div>
              <a href="#" className="view-link animated-arrow">View Details <i data-lucide="arrow-right" className="arrow-icon"></i></a>
            </div>
          </div>

          <div className="room-row reverse">
            <div className="room-image room-warm" data-aos="fade-left">
              <img src="/9243-goodbedroom.jpeg" alt="Deluxe Room" loading="lazy" />
              <div className="room-overlay">
                <span className="room-overlay-text">View Room &rarr;</span>
              </div>
            </div>
            <div className="room-info" data-aos="fade-right">
              <span className="section-label" style={{ letterSpacing: '5px', fontSize: '11px' }}>— DELUXE ROOM —</span>
              <h3 className="sub-heading" style={{ fontSize: '28px', color: 'var(--charcoal)' }}>Modern Comfort</h3>
              <p className="card-desc mb-3">Our deluxe rooms blend contemporary styling with traditional Kerala accents, featuring lavish bathrooms and all modern conveniences for a relaxing stay.</p>
              <div className="amenities-row">
                <div className="amenity"><i data-lucide="snowflake"></i><span>AC</span></div>
                <div className="amenity"><i data-lucide="wifi"></i><span>WiFi</span></div>
                <div className="amenity"><i data-lucide="monitor"></i><span>TV</span></div>
                <div className="amenity"><i data-lucide="thermometer-sun"></i><span>Hot Water</span></div>
              </div>
              <a href="#" className="view-link">View Details <i data-lucide="arrow-right" className="arrow-icon"></i></a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Testimonials */}
      <section className="bg-cream-botanical v4-testi-bg">
        <div className="container">
          <div className="text-center">
            <span className="section-label" data-aos="fade-up" style={{ color: '#6B8F7B' }}>— TESTIMONIALS —</span>
            <h2 className="section-heading v4-stagger-words" id="testi-headline" style={{ color: 'var(--deep-forest)' }}>What Our Guests Say</h2>
            <div className="section-divider center animated-underline" data-aos="fade-up" data-aos-delay="200"></div>
          </div>
          <div className="testimonials mt-5 v4-testi-wrapper" data-aos="fade-up" data-aos-delay="300">
            <button className="v4-testi-nav v4-testi-prev"><i data-lucide="chevron-left"></i></button>
            <div className="v4-testi-viewport">
              <div className="testi-track" id="testi-track">
                <div className="testi-card v4-testi-card">
                  <div className="v4-quote-mark">"</div>
                  <div className="stars v5-stars-container">
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star final-star"></i>
                  </div>
                  <p className="testi-text v4-testi-text">"The most serene experience we've ever had. The pool overlooking the mountains at sunset was absolutely magical."</p>
                  <div className="v4-testi-author">Rahul &amp; Priya M.</div>
                  <div className="v4-testi-location">Mumbai</div>
                </div>
                <div className="testi-card v4-testi-card">
                  <div className="v4-quote-mark">"</div>
                  <div className="stars v5-stars-container">
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star final-star"></i>
                  </div>
                  <p className="testi-text v4-testi-text">"Exquisite food, impeccable service, and a property that takes your breath away. Will definitely return!"</p>
                  <div className="v4-testi-author">James T.</div>
                  <div className="v4-testi-location">London</div>
                </div>
                <div className="testi-card v4-testi-card">
                  <div className="v4-quote-mark">"</div>
                  <div className="stars v5-stars-container">
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star final-star"></i>
                  </div>
                  <p className="testi-text v4-testi-text">"A hidden gem in Wayanad. The attention to detail in the rooms and the warmth of the staff made our anniversary special."</p>
                  <div className="v4-testi-author">Ananya S.</div>
                  <div className="v4-testi-location">Bangalore</div>
                </div>
                <div className="testi-card v4-testi-card">
                  <div className="v4-quote-mark">"</div>
                  <div className="stars v5-stars-container">
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star"></i>
                    <i data-lucide="star" className="v5-star final-star"></i>
                  </div>
                  <p className="testi-text v4-testi-text">"The most serene experience we've ever had. The pool overlooking the mountains at sunset was absolutely magical."</p>
                  <div className="v4-testi-author">Rahul &amp; Priya M.</div>
                  <div className="v4-testi-location">Mumbai</div>
                </div>
              </div>
            </div>
            <button className="v4-testi-nav v4-testi-next"><i data-lucide="chevron-right"></i></button>
          </div>
          <div className="v4-testi-dots" id="testi-dots"></div>
        </div>
      </section>

      <div className="wave-divider wave-forest-clean">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0,120 C320,0 420,0 720,60 C1020,120 1120,120 1440,60 L1440,0 L0,0 Z" fill="var(--deep-forest)"></path></svg>
      </div>

      {/* Section 7: Location */}
      <section className="location-section bg-forest-clean v4-location-bg">
        <div className="container location-container">
          <div className="location-map v4-map" data-aos="zoom-in" data-aos-duration="1500">
            <div className="map-wrapper v4-map-wrapper">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3905.789178229971!2d76.012574!3d11.597621!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba673b06e8b4e77%3A0xc3f8e5f6e8574ab5!2sChangangara%2C%20Pinangode%2C%20Vythiri%2C%20Wayanad%2C%20Kerala!5e0!3m2!1sen!2sin!4v1715694212345!5m2!1sen!2sin" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Casa Elara Location"></iframe>
              <div className="sonar-ring v4-sonar-ring"></div>
            </div>
          </div>
          <div className="location-text v4-location-text" data-aos="fade-left">
            <i data-lucide="leaf" style={{ color: 'var(--tropical-gold)', marginBottom: '12px', width: '24px', height: '24px' }}></i><br />
            <span className="section-label" style={{ color: '#6B8F7B', letterSpacing: '8px' }}>— FIND US —</span>
            <h2 className="section-heading" style={{ color: 'white', marginBottom: '24px' }}>Nestled in the Heart of Wayanad</h2>
            <p className="mb-4" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <a href="https://maps.app.goo.gl/FYJbZS6r25NtbVXb6" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--tropical-gold)', marginTop: '2px' }}><i data-lucide="map-pin"></i></a>
              <span id="v4-address-typing">
                <span className="address-line">Cholapuram, Pinangode,</span><br />
                <span className="address-line">Kalpetta, Wayanad, Kerala,</span><br />
                <span className="address-line">India</span>
              </span>
            </p>
            <div className="v4-distances">
              <div className="v4-dist-item"><i data-lucide="arrow-right-circle" style={{ color: 'var(--tropical-gold)', width: '16px', height: '16px' }}></i> 84 km from Calicut Airport</div>
              <div className="v4-dist-item"><i data-lucide="arrow-right-circle" style={{ color: 'var(--tropical-gold)', width: '16px', height: '16px' }}></i> 8 km from Kalpetta Town</div>
              <div className="v4-dist-item"><i data-lucide="arrow-right-circle" style={{ color: 'var(--tropical-gold)', width: '16px', height: '16px' }}></i> 12 km from Banasura Sagar Dam</div>
            </div>
            <a href="https://maps.app.goo.gl/FYJbZS6r25NtbVXb6" target="_blank" rel="noopener noreferrer" className="btn v4-btn-directions mt-4">
              Get Directions <i data-lucide="external-link" style={{ width: '16px', height: '16px', marginLeft: '8px' }}></i>
            </a>
          </div>
        </div>
      </section>

      {/* Section 8: CTA Banner */}
      <section className="cta-banner parallax-bg">
        <div className="cta-overlay cta-overlay-green"></div>
        <div className="container cta-content" data-aos="fade-up">
          <h2 className="section-heading split-text" id="cta-headline" style={{ color: 'white', marginBottom: '16px', textShadow: '0 2px 8px rgba(0,0,0,0.3)', fontSize: '44px' }}>Book Your Stay at Casa Elara</h2>
          <div className="cta-buttons">
            <a href="https://wa.me/919292004162?text=Hi!%20I%27d%20like%20to%20book%20a%20stay%20at%20Casa%20Elara%20Luxury%20Pool%20Villa.%20Please%20share%20availability%20and%20pricing." target="_blank" rel="noopener noreferrer" className="btn btn-gold shimmer-hover" style={{ color: 'var(--deep-forest)' }}>Book Now</a>
            <Link to="/contact" className="btn btn-outline-gold shimmer-hover" style={{ color: 'white', borderColor: 'var(--tropical-gold)' }}>Contact Us</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-deluxe">
        <div className="footer-gold-line"></div>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col" data-aos="fade-up" data-aos-delay="0">
              <img src="/logo_transparent.png" alt="Casa Elara" className="footer-logo" loading="lazy" />
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

      {/* WhatsApp Float */}
      <a href="https://wa.me/919292004162?text=Hi!%20I%27d%20like%20to%20know%20more%20about%20Casa%20Elara%20Luxury%20Pool%20Villa." target="_blank" rel="noopener noreferrer" className="whatsapp-float v4-wa-float" aria-label="Chat on WhatsApp">
        <div className="v4-wa-ring"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="var(--tropical-gold)">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* Scroll to Top */}
      <button className="scroll-top" id="scrollTop" aria-label="Scroll to top">
        <i data-lucide="chevron-up"></i>
      </button>

      {/* Home page inline styles */}
      <style>{`
        .welcome-section { display: flex; align-items: center; gap: 60px; position: relative; }
        .welcome-text { flex: 0 0 55%; }
        .welcome-visual { flex: 0 0 45%; position: relative; }
        .highlights-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; margin-top: 48px; }
        .feature-card { background: var(--pure-white); border-radius: var(--radius-md); padding: 40px 30px; text-align: center; box-shadow: var(--shadow-card); transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94); position: relative; overflow: hidden; border-top: 0px solid var(--tropical-gold); }
        .feature-card::before { content: ''; position: absolute; top: 0; left: 50%; width: 0; height: 3px; background: var(--tropical-gold); transition: width 0.3s ease, left 0.3s ease; }
        .feature-card:hover::before { width: 100%; left: 0; }
        .feature-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-card-hover); }
        .highlight-icon { margin: 0 auto 20px; display: flex; justify-content: center; }
        .stats-section { background-image: url('/9214_livingroomwithstairs.jpeg'); position: relative; padding: 100px 0; color: white; }
        .stats-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 50, 25, 0.75); }
        .stats-grid { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; }
        .stat-item { border-right: 1px solid rgba(255, 255, 255, 0.2); }
        .stat-item:last-child { border-right: none; }
        .stat-number { font-family: 'Playfair Display', serif; font-size: 56px; color: var(--tropical-gold); font-weight: 700; line-height: 1; margin-bottom: 8px; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
        .stat-label { font-size: 14px; text-transform: uppercase; letter-spacing: 3px; }
        .room-row { display: flex; align-items: center; gap: 60px; margin-bottom: 80px; }
        .room-row.reverse { flex-direction: row-reverse; }
        .room-image { flex: 0 0 50%; border-radius: 16px; box-shadow: var(--shadow-image); overflow: hidden; }
        .room-image img { width: 100%; display: block; }
        .room-info { flex: 0 0 50%; }
        .view-link { color: var(--lush-green); font-weight: 500; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; }
        .testimonials { overflow: hidden; position: relative; padding: 40px 0; }
        .testi-track { display: flex; transition: transform 0.5s ease; gap: 30px; }
        .testi-card { min-width: calc(33.333% - 20px); background: white; border-radius: 16px; padding: 36px; box-shadow: var(--shadow-card); position: relative; transition: all 0.3s ease; }
        .testi-card:hover { transform: scale(1.03); box-shadow: var(--shadow-card-hover); }
        .testi-text { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 18px; line-height: 1.7; position: relative; z-index: 1; margin-bottom: 20px; }
        .stars { display: flex; gap: 2px; margin-bottom: 10px; }
        .testi-author { font-weight: 500; color: var(--deep-forest); }
        .testi-location { font-size: 13px; color: var(--muted-green-gray); }
        .location-section { padding: 100px 0; background: var(--deep-forest); color: white; }
        .location-container { display: flex; align-items: center; gap: 60px; }
        .location-map { flex: 0 0 50%; }
        .location-map iframe { width: 100%; height: 400px; border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.3); border: none; }
        .location-text { flex: 0 0 50%; }
        .cta-banner { position: relative; padding: 120px 0; text-align: center; background-image: url('/9214_livingroomwithstairs.jpeg'); }
        .cta-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(0, 50, 25, 0.7), rgba(0, 50, 25, 0.8)); }
        .cta-content { position: relative; z-index: 1; color: white; max-width: 860px; margin: 0 auto; padding: 0 20px; }
        .cta-buttons { display: flex; gap: 20px; justify-content: center; margin-top: 40px; }
        @media (max-width: 1024px) {
          .welcome-section, .room-row { flex-direction: column !important; }
          .highlights-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 40px; }
          .stat-item { border: none; }
          .testi-card { min-width: calc(100%); }
          .location-container { flex-direction: column-reverse; }
        }
        @media (max-width: 768px) {
          .highlights-grid { grid-template-columns: 1fr; }
        }
        .developer-credit { color: rgba(255, 255, 255, 0.7); text-decoration: none; transition: color 0.3s ease; font-size: 14px; }
        .developer-credit:hover { color: var(--tropical-gold); }
      `}</style>
    </>
  )
}
