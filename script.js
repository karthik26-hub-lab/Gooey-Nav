// --- Configuration ---
const config = {
  animationTime: 600,
  particleCount: 15,
  particleDistances: [90, 10],
  particleR: 100,
  timeVariance: 300,
  colors: [1, 2, 3, 1, 2, 3, 1, 4], // Maps to CSS vars --color-1, --color-2, etc.
  initialActiveIndex: 0
};

// --- DOM Elements ---
const container = document.getElementById('nav-container');
const navList = document.getElementById('nav-list');
const filterEffect = document.getElementById('filter-effect');
const textEffect = document.getElementById('text-effect');
const listItems = navList.querySelectorAll('li');

let activeIndex = config.initialActiveIndex;

// --- Helper Functions ---
const noise = (n = 1) => n / 2 - Math.random() * n;

const getXY = (distance, pointIndex, totalPoints) => {
  const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
  return [distance * Math.cos(angle), distance * Math.sin(angle)];
};

const createParticle = (i, t, d, r) => {
  let rotate = noise(r / 10);
  return {
    start: getXY(d[0], config.particleCount - i, config.particleCount),
    end: getXY(d[1] + noise(7), config.particleCount - i, config.particleCount),
    time: t,
    scale: 1 + noise(0.2),
    color: config.colors[Math.floor(Math.random() * config.colors.length)],
    rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
  };
};

const makeParticles = element => {
  const d = config.particleDistances;
  const r = config.particleR;
  const bubbleTime = config.animationTime * 2 + config.timeVariance;
  element.style.setProperty('--time', `${bubbleTime}ms`);

  for (let i = 0; i < config.particleCount; i++) {
    const t = config.animationTime * 2 + noise(config.timeVariance * 2);
    const p = createParticle(i, t, d, r);
    element.classList.remove('active');

    setTimeout(() => {
      const particle = document.createElement('span');
      const point = document.createElement('span');
      
      particle.classList.add('particle');
      particle.style.setProperty('--start-x', `${p.start[0]}px`);
      particle.style.setProperty('--start-y', `${p.start[1]}px`);
      particle.style.setProperty('--end-x', `${p.end[0]}px`);
      particle.style.setProperty('--end-y', `${p.end[1]}px`);
      particle.style.setProperty('--time', `${p.time}ms`);
      particle.style.setProperty('--scale', `${p.scale}`);
      particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
      particle.style.setProperty('--rotate', `${p.rotate}deg`);

      point.classList.add('point');
      particle.appendChild(point);
      element.appendChild(particle);
      
      requestAnimationFrame(() => {
        element.classList.add('active');
      });
      
      setTimeout(() => {
        try {
          element.removeChild(particle);
        } catch {
          // Ignore if already removed
        }
      }, t);
    }, 30);
  }
};

const updateEffectPosition = element => {
  if (!container || !filterEffect || !textEffect) return;
  const containerRect = container.getBoundingClientRect();
  const pos = element.getBoundingClientRect();

  const styles = {
    left: `${pos.x - containerRect.x}px`,
    top: `${pos.y - containerRect.y}px`,
    width: `${pos.width}px`,
    height: `${pos.height}px`
  };
  
  Object.assign(filterEffect.style, styles);
  Object.assign(textEffect.style, styles);
  textEffect.innerText = element.innerText;
};

// --- Event Handlers ---
const handleClick = (e, index) => {
  e.preventDefault();
  const liEl = e.currentTarget.parentElement;
  
  if (activeIndex === index) return;

  // Update active classes
  listItems[activeIndex].classList.remove('active');
  liEl.classList.add('active');
  activeIndex = index;

  updateEffectPosition(liEl);

  // Clear existing particles
  const particles = filterEffect.querySelectorAll('.particle');
  particles.forEach(p => filterEffect.removeChild(p));

  // Restart text animation
  textEffect.classList.remove('active');
  void textEffect.offsetWidth; // Trigger reflow
  textEffect.classList.add('active');

  // Trigger gooey particle effect
  makeParticles(filterEffect);
};

// --- Initialization ---
listItems.forEach((li, index) => {
  const anchor = li.querySelector('a');
  
  anchor.addEventListener('click', (e) => handleClick(e, index));
  
  anchor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e, index);
    }
  });
});

// Set initial position after layout
setTimeout(() => {
  if (listItems[activeIndex]) {
    updateEffectPosition(listItems[activeIndex]);
    textEffect.classList.add('active');
  }
}, 50);

// Handle resize
const resizeObserver = new ResizeObserver(() => {
  if (listItems[activeIndex]) {
    updateEffectPosition(listItems[activeIndex]);
  }
});
resizeObserver.observe(container);
