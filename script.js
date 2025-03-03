document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('nameCanvas');
    const heroLogo = document.querySelector('.hero-logo');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on the hero-logo container
    canvas.width = heroLogo.clientWidth;
    canvas.height = heroLogo.clientHeight;
  
    let particles = [];
    const nameText = "RYAN YOU";
    const mouse = { x: null, y: null, radius: 150 };
  
    function createNameParticles() {
      const fontSize = canvas.width < 768 ? 120 : 180;
      ctx.font = `bold ${fontSize}px Roboto, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
  
      const textWidth = ctx.measureText(nameText).width;
      const textX = canvas.width / 2;
      const textY = canvas.height * 0.25;
  
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = textWidth * 1.5;
      tempCanvas.height = fontSize * 1.5;
  
      tempCtx.font = `bold ${fontSize}px Roboto, sans-serif`;
      tempCtx.fillStyle = 'white';
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';
      tempCtx.fillText(nameText, tempCanvas.width / 2, tempCanvas.height / 2);
  
      const data = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
      const offsetX = textX - tempCanvas.width / 2;
      const offsetY = textY - tempCanvas.height / 2;
  
      // Calculate letter positions
      const letters = nameText.split("");
      const nonSpaceLetters = letters.filter(l => l !== " ");
      const letterWidths = nonSpaceLetters.map(l => tempCtx.measureText(l).width);
      const sumLetterWidths = letterWidths.reduce((a, b) => a + b, 0);
      const spaceCount = letters.filter(l => l === " ").length;
      const totalWidth = tempCtx.measureText(nameText).width;
      const spaceWidth = (totalWidth - sumLetterWidths) / spaceCount;
  
      const letterPositions = [];
      let currentX = tempCanvas.width / 2 - totalWidth / 2;
      let nonSpaceIndex = 0;
      letters.forEach(letter => {
        if (letter === " ") {
          currentX += spaceWidth;
        } else {
          const width = letterWidths[nonSpaceIndex];
          letterPositions.push({ letter, startX: currentX, endX: currentX + width });
          currentX += width;
          nonSpaceIndex++;
        }
      });
  
      particles = [];
      for (let y = 0; y < tempCanvas.height; y += 10) {
        for (let x = 0; x < tempCanvas.width; x += 10) {
          const index = (y * tempCanvas.width + x) * 4;
          if (data[index + 3] > 128) {
            const particle = {
              x: offsetX + x,
              y: offsetY + y,
              baseX: offsetX + x,
              baseY: offsetY + y,
              size: Math.random() * 2.5 + 2,
              color: 'rgba(255, 255, 255, 0.7)',
              speed: 0.05,
              letterID: null
            };
            for (const lp of letterPositions) {
              if (x >= lp.startX && x < lp.endX) {
                particle.letterID = lp.letter;
                break;
              }
            }
            particles.push(particle);
          }
        }
      }
    }
  
    window.addEventListener('resize', function() {
      canvas.width = heroLogo.clientWidth;
      canvas.height = heroLogo.clientHeight;
      createNameParticles();
    });
  
    window.addEventListener('mousemove', function(e) {
        let rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });      
  
    window.addEventListener('mouseout', function() {
      mouse.x = null;
      mouse.y = null;
    });
  
    createNameParticles();
  
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          if (particles[i].letterID === particles[j].letterID) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 15) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        if (mouse.x && mouse.y) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouse.radius - distance) / mouse.radius;
            particle.x -= Math.cos(angle) * force * 5;
            particle.y -= Math.sin(angle) * force * 5;
          }
        }
        const dx = particle.baseX - particle.x;
        const dy = particle.baseY - particle.y;
        particle.x += dx * particle.speed;
        particle.y += dy * particle.speed;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      }
      requestAnimationFrame(animate);
    }
    animate();
  
    // Fade in grid-section when scrolled into view
    const gridSection = document.querySelector('.grid-section');
    if (gridSection) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            gridSection.classList.add('visible');
          }
        });
      }, { threshold: 0.1 });
      observer.observe(gridSection);
    }
  
    // Modal overlay functionality remains unchanged
    const modalOverlay = document.getElementById('modalOverlay');
    const modalIframe = document.getElementById('modalIframe');
    const closeModal = document.getElementById('closeModal');
  
    document.querySelectorAll('.grid-item').forEach(item => {
      if (item.tagName === 'A') {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          const projectUrl = item.getAttribute('href');
          if (projectUrl) {
            modalIframe.src = projectUrl;
            modalOverlay.classList.add('active');
          }
        });
      }
    });
  
    closeModal.addEventListener('click', function() {
      modalOverlay.classList.remove('active');
      modalIframe.src = "";
    });
  
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
        modalIframe.src = "";
      }
    });
  });
  