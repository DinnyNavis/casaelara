import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Contact() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const formRef = useRef(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // AOS + Lucide init
  useEffect(() => {
    if (window.AOS) {
      window.AOS.init({ duration: 600, easing: 'ease-out-cubic', once: true, offset: 60 })
    }
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, [])

  // Re-run lucide after formSubmitted changes (icon in submit button changes)
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons()
  }, [formSubmitted])

  // Navbar scroll + hero parallax
  useEffect(() => {
    const navbarWrapper = document.getElementById('navbar-wrapper')
    const parallax = document.querySelector('.hero-bg-parallax')

    function onScroll() {
      const scrollY = window.pageYOffset
      if (navbarWrapper) {
        if (scrollY > 1) navbarWrapper.classList.add('scrolled')
        else navbarWrapper.classList.remove('scrolled')
      }
      if (parallax) {
        if (window.innerWidth > 768) {
          parallax.style.transform = 'translateY(' + (-scrollY * 0.2) + 'px)'
          parallax.style.backgroundPosition = ''
        } else {
          parallax.style.transform = 'none'
          const shift = 30 + scrollY * 0.04
          parallax.style.backgroundPosition = 'center ' + shift + '%'
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll-to-top button
  useEffect(() => {
    const scrollTopBtn = document.getElementById('scrollTop')
    if (!scrollTopBtn) return

    function onScroll() {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 500)
    }
    function onClick() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    scrollTopBtn.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('scroll', onScroll)
      scrollTopBtn.removeEventListener('click', onClick)
    }
  }, [])

  // Mobile menu
  useEffect(() => {
    const hamburger = document.getElementById('hamburger')
    const mobileMenu = document.getElementById('mobile-menu')
    if (!hamburger || !mobileMenu) return

    function onHamburgerClick() {
      mobileMenu.classList.toggle('open')
      hamburger.classList.toggle('active')
    }
    function onLinkClick() {
      mobileMenu.classList.remove('open')
      hamburger.classList.remove('active')
    }

    hamburger.addEventListener('click', onHamburgerClick)
    const links = mobileMenu.querySelectorAll('.nav-link')
    links.forEach(link => link.addEventListener('click', onLinkClick))
    return () => {
      hamburger.removeEventListener('click', onHamburgerClick)
      links.forEach(link => link.removeEventListener('click', onLinkClick))
    }
  }, [])

  // Footer gold line observer
  useEffect(() => {
    const footerDeluxe = document.querySelector('.footer-deluxe')
    if (!footerDeluxe) return
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) footerDeluxe.classList.add('aos-animate')
    }, { threshold: 0.1 })
    obs.observe(footerDeluxe)
    return () => obs.disconnect()
  }, [])

  // Custom cursor (desktop only)
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

    const interactables = document.querySelectorAll('a, button, .feature-card')
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

  async function handleFormSubmit(e) {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setErrorMsg('Please fill all fields before sending.')
      return
    }

    setLoading(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const res = await fetch(`${apiUrl}/api/contact/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message })
      })
      const data = await res.json()

      if (data.success) {
        setFormSubmitted(true)
        setSuccessMsg('Your message has been sent successfully. We will contact you soon.')
        setName('')
        setEmail('')
        setPhone('')
        setMessage('')
        setTimeout(() => {
          setFormSubmitted(false)
          setSuccessMsg('')
        }, 3000)
      } else {
        setErrorMsg('Unable to send your message right now. Please try again later.')
      }
    } catch {
      setErrorMsg('Unable to send your message right now. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-contact">

      {/* Navigation */}
      <div className="navbar-wrapper" id="navbar-wrapper">
        <nav id="navbar" className="navbar">
          <div className="container nav-container">
            <Link to="/" className="nav-logo">
              <img src="/logo_transparent.png" alt="Casa Elara" />
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/about" className="nav-link">About Us</Link>
              <Link to="/contact" className="nav-link active">Contact</Link>
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
        <Link to="/contact" className="nav-link active">Contact</Link>
        <a href="https://wa.me/919292004162?text=Hi!%20I%27d%20like%20to%20book%20a%20stay%20at%20Casa%20Elara%20Luxury%20Pool%20Villa.%20Please%20share%20availability%20and%20pricing." target="_blank" rel="noopener noreferrer" className="btn btn-primary nav-btn btn-ripple">Book Now</a>
      </div>

      {/* Hero */}
      <header className="contact-hero-luxury page-hero">
        <div className="hero-bg-parallax"></div>
        <div className="hero-overlay"></div>
        <div className="contact-hero-content" data-aos="fade-up">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <i data-lucide="chevron-right" style={{ width: '12px', height: '12px', opacity: 0.5 }}></i>
            <span>Contact</span>
          </div>
          <span className="hero-kicker">CASA ELARA CONTACT</span>
          <h1 className="hero-title">Get in Touch</h1>
          <div className="hero-gold-line"></div>
          <p className="hero-subtitle">We'd love to host you at Casa Elara</p>
          <p className="hero-small-line">Reach out for bookings, special requests, directions, or a peaceful stay in Wayanad.</p>
        </div>
      </header>

      {/* Contact Intro */}
      <section className="contact-intro-section" data-aos="fade-up">
        <div className="container">
          <span className="section-label">CONTACT DETAILS</span>
          <h2 className="section-heading">We're Here to Help</h2>
          <div className="gold-divider center" style={{ margin: '15px auto 25px auto' }}></div>
          <p>Whether you're planning a family getaway, a peaceful retreat, or a special celebration, our team is ready to help you plan a memorable stay at Casa Elara.</p>
        </div>
      </section>

      {/* Contact Cards & Form */}
      <section className="contact-main-layout">
        <div className="container contact-grid">

          {/* Left Col: Cards */}
          <div className="contact-left-col" data-aos="fade-right">

            {/* Call Us */}
            <div className="contact-card-luxury">
              <div className="card-icon">
                <i data-lucide="phone"></i>
              </div>
              <div className="card-content">
                <h3>Call Us</h3>
                <p>+91 9292004162<br />+91 7306457086<br />0493 6293328</p>
                <a href="tel:+919292004162">Call Now <i data-lucide="arrow-right" style={{ width: '14px', height: '14px' }}></i></a>
              </div>
            </div>

            {/* Email Us */}
            <div className="contact-card-luxury">
              <div className="card-icon">
                <i data-lucide="mail"></i>
              </div>
              <div className="card-content">
                <h3>Email Us</h3>
                <p>Casaelara.villa@gmail.com</p>
                <a href="mailto:Casaelara.villa@gmail.com">Send Email <i data-lucide="arrow-right" style={{ width: '14px', height: '14px' }}></i></a>
              </div>
            </div>

            {/* Visit Us */}
            <div className="contact-card-luxury">
              <div className="card-icon">
                <i data-lucide="map-pin"></i>
              </div>
              <div className="card-content">
                <h3>Visit Us</h3>
                <p>Cholapuram, Pinangode,<br />Vengapally, Wayanad,<br />Kerala</p>
                <a href="https://maps.app.goo.gl/srXo3uNwVfYzPQtB7" target="_blank" rel="noopener noreferrer">Get Directions <i data-lucide="arrow-right" style={{ width: '14px', height: '14px' }}></i></a>
              </div>
            </div>

          </div>

          {/* Right Col: Form */}
          <div className="contact-right-col" data-aos="fade-left">
            <div className="contact-form-luxury">
              <h3>Send a Message</h3>
              <p className="form-sub">Share your details and we'll get back to you soon.</p>
              <div className="gold-divider center"></div>

              <form id="contactForm" ref={formRef} onSubmit={handleFormSubmit}>
                <div className="form-group-luxury">
                  <label htmlFor="contactName">Your Name</label>
                  <input
                    type="text"
                    id="contactName"
                    className="form-control"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className="form-group-luxury">
                  <label htmlFor="contactEmail">Email Address</label>
                  <input
                    type="email"
                    id="contactEmail"
                    className="form-control"
                    placeholder="john@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group-luxury">
                  <label htmlFor="contactPhone">Phone Number</label>
                  <input
                    type="tel"
                    id="contactPhone"
                    className="form-control"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group-luxury">
                  <label htmlFor="contactMessage">Your Message</label>
                  <textarea
                    id="contactMessage"
                    className="form-control"
                    placeholder="Tell us about your stay plans..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-submit-luxury"
                  disabled={loading || formSubmitted}
                  style={formSubmitted ? { background: '#C8A84E' } : {}}
                >
                  {formSubmitted ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span>Message Sent!</span>
                    </>
                  ) : loading ? (
                    'SENDING...'
                  ) : (
                    <>
                      SEND MESSAGE{' '}
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </>
                  )}
                </button>

                {successMsg && (
                  <p style={{ marginTop: '14px', color: '#2d7a4a', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }}>
                    {successMsg}
                  </p>
                )}
                {errorMsg && (
                  <p style={{ marginTop: '14px', color: '#c0392b', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }}>
                    {errorMsg}
                  </p>
                )}

                <span className="form-note">We usually respond as soon as possible.</span>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* Map Section */}
      <section className="map-section-luxury" data-aos="fade-up">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-label">OUR LOCATION</span>
            <h2 className="section-heading">Find Us in Wayanad</h2>
            <div className="gold-divider center" style={{ margin: '15px auto 25px auto' }}></div>
            <p className="section-sub">Casa Elara is nestled in the calm surroundings of Pinangode, Wayanad.</p>
            <p className="section-sub-small">A peaceful escape surrounded by greenery, quiet roads, and the charm of Kerala's hill country.</p>
          </div>

          <div className="map-experience-wrapper">
            <div className="map-card-wrapper">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3907.8452063551747!2d76.02844327585!3d11.610812942757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba60e7a9a9a9a9b%3A0x1234567890abcdef!2sCasa%20Elara%20Luxury%20Pool%20Villa!5e0!3m2!1sen!2sin!4v1716000000000!5m2!1sen!2sin"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Casa Elara Location Map"
              ></iframe>

              {/* Location Info Overlay Card */}
              <div className="location-overlay-card" data-aos="fade-right" data-aos-delay="200">
                <span className="overlay-label">PRIVATE POOL VILLA</span>
                <h3>Casa Elara</h3>
                <p>Cholapuram, Pinangode<br />Vengapally, Wayanad, Kerala</p>
                <a href="https://maps.app.goo.gl/srXo3uNwVfYzPQtB7" target="_blank" rel="noopener noreferrer" className="overlay-action">
                  <i data-lucide="map-pin"></i> GET DIRECTIONS
                </a>
              </div>
            </div>
          </div>

          {/* Location Highlights */}
          <div className="location-highlights" data-aos="fade-up" data-aos-delay="300">
            <div className="highlight-card">
              <div className="highlight-icon">
                <i data-lucide="leaf"></i>
              </div>
              <h4>Peaceful Location</h4>
              <p>Calm surroundings away from the rush.</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">
                <i data-lucide="navigation"></i>
              </div>
              <h4>Easy Directions</h4>
              <p>Reach us conveniently through Pinangode, Wayanad.</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">
                <i data-lucide="trees"></i>
              </div>
              <h4>Nature Around</h4>
              <p>Surrounded by greenery and quiet village charm.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Strip */}
      <div className="quick-contact-strip" data-aos="fade-up">
        <div className="strip-container">
          <a href="tel:+919292004162" className="strip-item">
            <div className="icon-box"><i data-lucide="phone"></i></div>
            <div className="strip-text">
              <h4>Call Us</h4>
              <p>+91 9292004162</p>
            </div>
          </a>
          <a href="https://wa.me/919292004162" target="_blank" rel="noopener noreferrer" className="strip-item">
            <div className="icon-box"><i data-lucide="message-circle"></i></div>
            <div className="strip-text">
              <h4>WhatsApp</h4>
              <p>Message us</p>
            </div>
          </a>
          <a href="https://maps.app.goo.gl/srXo3uNwVfYzPQtB7" target="_blank" rel="noopener noreferrer" className="strip-item">
            <div className="icon-box"><i data-lucide="map-pin"></i></div>
            <div className="strip-text">
              <h4>Directions</h4>
              <p>Get map route</p>
            </div>
          </a>
        </div>
      </div>

      {/* CTA Section */}
      <section className="contact-cta-section" data-aos="fade-up">
        <div className="container">
          <span className="cta-kicker">PLAN YOUR ESCAPE</span>
          <h2>Ready to Plan Your Stay?</h2>
          <div className="gold-divider center"></div>
          <p className="cta-subtitle">Let Casa Elara welcome you to a peaceful private villa experience in Wayanad.</p>
          <p className="cta-supporting">Perfect for family getaways, quiet retreats, and memorable celebrations.</p>
          <div className="cta-btns">
            <a href="https://wa.me/919292004162" target="_blank" rel="noopener noreferrer" className="btn btn-gold">BOOK NOW</a>
            <a href="https://wa.me/919292004162" target="_blank" rel="noopener noreferrer" className="btn btn-outline">CONTACT ON WHATSAPP</a>
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
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a href="https://wa.me/919292004162" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom" data-aos="fade-up" data-aos-delay="400">
            <div>&copy; 2024 Casa Elara. All rights reserved.</div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a href="https://wa.me/919292004162?text=Hi!%20I%27d%20like%20to%20know%20more%20about%20Casa%20Elara%20Luxury%20Pool%20Villa." target="_blank" rel="noopener noreferrer" className="whatsapp-float v4-wa-float" aria-label="Chat on WhatsApp">
        <div className="v4-wa-ring"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="var(--tropical-gold)">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* Scroll to Top */}
      <button className="scroll-top" id="scrollTop" aria-label="Scroll to top">
        <i data-lucide="chevron-up"></i>
      </button>

    </div>
  )
}
