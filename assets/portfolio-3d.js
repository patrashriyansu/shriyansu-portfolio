/* 3D Developer Portfolio Interactive Script - Shriyansu Patra */

// Wait for DOM & Three.js to load
document.addEventListener('DOMContentLoaded', () => {
  initThreeJS();
  initTypingEffect();
  initCard3DTilt();
  initAudioEngine();
  initSkillFilter();
  initModals();
  initContactForm();
  initNavbarScroll();
});

/* ----------------------------------------------------
   1. THREE.JS 3D BACKGROUND ENGINE
---------------------------------------------------- */
let scene, camera, renderer;
let particleSystem, floatingGeometries = [];
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

function initThreeJS() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene setup
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070b14, 0.0018);

  // Camera setup
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 40;

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x00f2fe, 2, 100);
  pointLight1.position.set(20, 20, 20);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xa855f7, 2, 100);
  pointLight2.position.set(-20, -20, -10);
  scene.add(pointLight2);

  // Create Particle Cosmos
  createParticles();

  // Create Floating 3D Cyber Geometries
  createFloatingShapes();

  // Event Listeners
  document.addEventListener('mousemove', onDocumentMouseMove);
  window.addEventListener('resize', onWindowResize);

  // Start Animation Loop
  animate();
}

function createParticles() {
  const particleCount = 1800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorCyan = new THREE.Color(0x00f2fe);
  const colorPurple = new THREE.Color(0xa855f7);
  const colorWhite = new THREE.Color(0xffffff);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 120;
    positions[i + 1] = (Math.random() - 0.5) * 120;
    positions[i + 2] = (Math.random() - 0.5) * 120;

    // Mix particle colors
    let mixedColor;
    const rand = Math.random();
    if (rand < 0.45) mixedColor = colorCyan;
    else if (rand < 0.85) mixedColor = colorPurple;
    else mixedColor = colorWhite;

    colors[i] = mixedColor.r;
    colors[i + 1] = mixedColor.g;
    colors[i + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.25,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
}

function createFloatingShapes() {
  const shapesData = [
    { geo: new THREE.IcosahedronGeometry(2.5, 1), color: 0x00f2fe, pos: [-15, 10, -10] },
    { geo: new THREE.TorusKnotGeometry(1.8, 0.4, 64, 16), color: 0xa855f7, pos: [18, -8, -15] },
    { geo: new THREE.OctahedronGeometry(2, 0), color: 0x10b981, pos: [-12, -15, -5] },
    { geo: new THREE.RingGeometry(2, 3, 16), color: 0x4facfe, pos: [14, 12, -8] },
    { geo: new THREE.IcosahedronGeometry(1.5, 0), color: 0xf59e0b, pos: [0, -18, -12] }
  ];

  shapesData.forEach(item => {
    const mat = new THREE.MeshBasicMaterial({
      color: item.color,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const mesh = new THREE.Mesh(item.geo, mat);
    mesh.position.set(...item.pos);
    mesh.userData = {
      rotSpeedX: (Math.random() - 0.5) * 0.015,
      rotSpeedY: (Math.random() - 0.5) * 0.015,
      floatSpeed: 0.001 + Math.random() * 0.002,
      initialY: item.pos[1]
    };
    scene.add(mesh);
    floatingGeometries.push(mesh);
  });
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) * 0.05;
  mouseY = (event.clientY - windowHalfY) * 0.05;
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  // Rotate particle starfield
  if (particleSystem) {
    particleSystem.rotation.y = time * 0.03;
    particleSystem.rotation.x = time * 0.015;
  }

  // Animate floating geometries
  floatingGeometries.forEach(mesh => {
    mesh.rotation.x += mesh.userData.rotSpeedX;
    mesh.rotation.y += mesh.userData.rotSpeedY;
    mesh.position.y = mesh.userData.initialY + Math.sin(time * 2) * 1.2;
  });

  // Smooth Camera Target Parallax based on Mouse & Scroll
  targetX += (mouseX - targetX) * 0.05;
  targetY += (-mouseY - targetY) * 0.05;

  const scrollY = window.scrollY || window.pageYOffset;
  const scrollOffset = scrollY * 0.015;

  camera.position.x = targetX * 0.8;
  camera.position.y = targetY * 0.8 - scrollOffset;
  camera.lookAt(0, -scrollOffset, 0);

  renderer.render(scene, camera);
}

/* ----------------------------------------------------
   2. TYPING TEXT ANIMATION
---------------------------------------------------- */
function initTypingEffect() {
  const typedSpan = document.getElementById('typed-text');
  if (!typedSpan) return;

  const phrases = [
    "Full-Stack Web Developer",
    "AI & ML Engineer",
    "Generative AI Specialist",
    "Computer Science Scholar @ ITER",
    "Data-Driven Problem Solver"
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function type() {
    const currentPhrase = phrases[phraseIdx];

    if (isDeleting) {
      typedSpan.textContent = currentPhrase.substring(0, charIdx - 1);
      charIdx--;
    } else {
      typedSpan.textContent = currentPhrase.substring(0, charIdx + 1);
      charIdx++;
    }

    let typeSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && charIdx === currentPhrase.length) {
      typeSpeed = 2200; // Pause at end of phrase
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      typeSpeed = 400; // Pause before next phrase
    }

    setTimeout(type, typeSpeed);
  }

  type();
}

/* ----------------------------------------------------
   3. 3D HOLOGRAM CARD TILT EFFECT
---------------------------------------------------- */
function initCard3DTilt() {
  const card = document.querySelector('.hologram-card');
  if (!card) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

/* ----------------------------------------------------
   4. WEB AUDIO SOUND ENGINE
---------------------------------------------------- */
let audioCtx = null;
let soundEnabled = true;

function initAudioEngine() {
  const soundToggleBtn = document.getElementById('sound-toggle');

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundToggleBtn.innerHTML = soundEnabled
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;

      showToast(soundEnabled ? "Audio Effects Enabled" : "Audio Muted", "info");
    });
  }

  // Attach hover sounds to interactive elements
  const interactiveElems = document.querySelectorAll('.btn-primary, .btn-outline, .nav-link, .project-card, .skill-badge, .social-icon-btn');
  interactiveElems.forEach(el => {
    el.addEventListener('mouseenter', () => playSound('hover'));
    el.addEventListener('click', () => playSound('click'));
  });
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (e) {
    // Audio fail silently
  }
}

/* ----------------------------------------------------
   5. SKILLS FILTER SYSTEM
---------------------------------------------------- */
function initSkillFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-category-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
          card.style.display = 'block';
          card.style.animation = 'slideInRight 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ----------------------------------------------------
   6. MODAL DIALOG CONTROLLER
---------------------------------------------------- */
function initModals() {
  const modalOverlays = document.querySelectorAll('.modal-overlay');
  const closeBtns = document.querySelectorAll('.modal-close');

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalOverlays.forEach(overlay => overlay.classList.remove('active'));
    });
  });

  modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // Project Modal Triggers
  const projectBtns = document.querySelectorAll('[data-project-target]');
  projectBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projId = btn.getAttribute('data-project-target');
      const targetModal = document.getElementById(`modal-${projId}`);
      if (targetModal) targetModal.classList.add('active');
    });
  });

  // Resume Modal Trigger
  const resumeBtn = document.getElementById('view-resume-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const resumeModal = document.getElementById('modal-resume');
      if (resumeModal) resumeModal.classList.add('active');
    });
  }
}

/* ----------------------------------------------------
   7. REAL EMAIL CONTACT FORM CONTROLLER
---------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !email || !message) {
      showToast("Please fill out all fields before submitting.", "error");
      return;
    }

    // UI Loading State
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spin-loader" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
      </svg>
      Sending Email...
    `;

    try {
      // 1. Try sending AJAX email via FormSubmit API
      const response = await fetch("https://formsubmit.co/ajax/patrashriyansu@gmail.com", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message,
          _subject: `⚡ New Portfolio Message from ${name}`,
          _template: "table"
        })
      });

      const result = await response.json();

      if (response.ok && (result.success === "true" || result.success === true)) {
        showToast(`Message sent successfully to patrashriyansu@gmail.com!`, "success");
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        return;
      }
    } catch (err) {
      console.warn("AJAX email send fallback:", err);
    }

    // 2. Direct Form Submit Fallback
    try {
      showToast("Dispatching message to patrashriyansu@gmail.com...", "info");
      // Submit form directly to FormSubmit endpoint
      form.action = "https://formsubmit.co/patrashriyansu@gmail.com";
      form.method = "POST";
      form.submit();
    } catch (err) {
      // 3. Fallback: Mailto client link
      const mailtoUrl = `mailto:patrashriyansu@gmail.com?subject=${encodeURIComponent(`Portfolio Message from ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
      window.location.href = mailtoUrl;
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    }
  });
}

/* ----------------------------------------------------
   8. NAVBAR SCROLL OBSERVER & TOASTS
---------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Highlight active section nav link
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile drawer menu toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinksList = document.querySelector('.nav-links');
  if (mobileToggle && navLinksList) {
    mobileToggle.addEventListener('click', () => {
      navLinksList.classList.toggle('mobile-open');
    });
  }
}

function showToast(message, type = "info") {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 8v4M12 16h.01"></path>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
