/**
 * capa.js — Splash Screen / Capa de Entrada
 * Teca Capital EdTech
 * 
 * Responsabilidade: Animações de partículas, interações
 * com botões e redirecionamento para a plataforma principal.
 */

(function() {
    'use strict';

    // ============================================
    // 1. SISTEMA DE PARTÍCULAS (Canvas)
    // ============================================

    const canvas = document.getElementById('particlesCanvas');
    const ctx = canvas.getContext('2d');

    let particles = [];
    let mouseX = 0;
    let mouseY = 0;
    let animationFrame;

    /**
     * Configura o tamanho do canvas
     */
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    /**
     * Cria uma partícula
     */
    function createParticle() {
        const isMobile = window.innerWidth < 768;
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * (isMobile ? 1.5 : 2.5) + 0.5,
            speedX: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
            speedY: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
            opacity: Math.random() * 0.5 + 0.15,
            connectionRadius: isMobile ? 80 : 120,
            color: Math.random() > 0.5 ? '214, 174, 100' : '100, 200, 255',
        };
    }

    /**
     * Inicializa as partículas
     */
    function initParticles(count) {
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(createParticle());
        }
    }

    /**
     * Desenha as partículas e as conexões
     */
    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenhar linhas de conexão
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDist = particles[i].connectionRadius || 120;

                if (distance < maxDist) {
                    const alpha = (1 - distance / maxDist) * 0.2;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(214, 174, 100, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Desenhar as partículas
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(214, 174, 100, ${p.opacity})`;
            ctx.fill();

            // Brilho suave
            if (p.size > 1.5) {
                ctx.shadowColor = 'rgba(214, 174, 100, 0.1)';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        // Atualizar posições
        for (const p of particles) {
            p.x += p.speedX;
            p.y += p.speedY;

            // Interação com o mouse
            if (mouseX !== 0 && mouseY !== 0) {
                const dx = p.x - mouseX;
                const dy = p.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (1 - dist / 150) * 0.02;
                    p.x += dx * force;
                    p.y += dy * force;
                }
            }

            // Rebater nas bordas
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        }

        animationFrame = requestAnimationFrame(drawParticles);
    }

    /**
     * Inicia o sistema de partículas
     */
    function startParticles() {
        const count = Math.min(
            Math.floor((canvas.width * canvas.height) / 12000),
            120
        );
        initParticles(count);
        drawParticles();
    }

    /**
     * Para o sistema de partículas
     */
    function stopParticles() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    // ============================================
    // 2. EVENTOS DO MOUSE / TOQUE
    // ============================================

    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    function handleTouchMove(e) {
        const touch = e.touches[0];
        if (touch) {
            mouseX = touch.clientX;
            mouseY = touch.clientY;
        }
    }

    function handleMouseLeave() {
        mouseX = 0;
        mouseY = 0;
    }

    // ============================================
    // 3. INTERAÇÕES DOS BOTÕES
    // ============================================

    const btnSim = document.getElementById('btnSim');
    const btnNao = document.getElementById('btnNao');
    const btnVoltar = document.getElementById('btnVoltar');
    const responseMessage = document.getElementById('responseMessage');
    const actions = document.querySelector('.actions');
    const questionWrapper = document.querySelector('.question-wrapper');

    /**
     * Ação do botão "SIM" — Redireciona para a plataforma principal
     * Nota: Como agora é um link <a>, o redirecionamento é nativo.
     * Mantemos apenas o feedback visual.
     */
    function handleSimClick(e) {
        // Efeito visual de clique
        btnSim.style.transform = 'scale(0.95)';
        btnSim.style.opacity = '0.8';
        
        setTimeout(() => {
            btnSim.style.transform = '';
            btnSim.style.opacity = '';
        }, 200);

        // O redirecionamento é feito pelo href do link
        // Adicionamos um pequeno delay para o efeito visual
        e.preventDefault();
        setTimeout(() => {
            window.location.href = btnSim.getAttribute('href');
        }, 300);
    }

    /**
     * Ação do botão "NÃO"
     */
    function handleNao() {
        // Esconder os elementos principais
        if (actions) actions.style.display = 'none';
        if (questionWrapper) questionWrapper.style.display = 'none';
        btnNao.style.display = 'none';

        // Mostrar mensagem de resposta
        if (responseMessage) {
            responseMessage.classList.add('visible');
            
            // Scroll suave para a mensagem (mobile)
            if (window.innerWidth < 768) {
                responseMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // Efeito de partículas (destacar)
        particles.forEach(p => {
            p.opacity = Math.min(p.opacity + 0.2, 0.8);
        });
    }

    /**
     * Ação do botão "Voltar"
     */
    function handleVoltar() {
        // Ocultar mensagem
        if (responseMessage) {
            responseMessage.classList.remove('visible');
        }

        // Mostrar os elementos novamente
        if (actions) actions.style.display = '';
        if (questionWrapper) questionWrapper.style.display = '';
        if (btnNao) btnNao.style.display = '';

        // Restaurar partículas
        particles.forEach(p => {
            p.opacity = Math.max(p.opacity - 0.2, 0.15);
        });
    }

    // ============================================
    // 4. INICIALIZAÇÃO
    // ============================================

    function init() {
        // Configurar canvas
        resizeCanvas();

        // Iniciar partículas
        startParticles();

        // Eventos de redimensionamento
        window.addEventListener('resize', () => {
            resizeCanvas();
            stopParticles();
            startParticles();
        });

        // Eventos do mouse
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        // Eventos de toque (mobile)
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchstart', handleTouchMove, { passive: true });

        // Eventos dos botões
        if (btnSim) {
            btnSim.addEventListener('click', handleSimClick);
            btnSim.addEventListener('touchstart', (e) => {
                // Prevenir double-tap zoom em mobile
                e.preventDefault();
                handleSimClick(e);
            }, { passive: false });
        }

        if (btnNao) {
            btnNao.addEventListener('click', handleNao);
        }

        if (btnVoltar) {
            btnVoltar.addEventListener('click', handleVoltar);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (btnSim && !btnSim.disabled) {
                    btnSim.click();
                }
            }
            if (e.key === 'Escape') {
                if (responseMessage && responseMessage.classList.contains('visible')) {
                    handleVoltar();
                }
            }
        });

        console.log('🚀 Teca Capital EdTech — Splash Screen carregada');
        console.log('📱 Versão: 1.0.0');
        console.log('💡 Pressione ENTER para começar ou ESC para sair da mensagem');
    }

    // ============================================
    // 5. CLEANUP
    // ============================================

    function cleanup() {
        stopParticles();
        window.removeEventListener('resize', resizeCanvas);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchstart', handleTouchMove);
        
        if (btnSim) btnSim.removeEventListener('click', handleSimClick);
        if (btnNao) btnNao.removeEventListener('click', handleNao);
        if (btnVoltar) btnVoltar.removeEventListener('click', handleVoltar);

        console.log('🧹 Splash Screen — cleanup realizado');
    }

    // ============================================
    // 6. EXPOR (para depuração)
    // ============================================

    // Iniciar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exportar funções para depuração
    window.__splash = {
        init,
        cleanup,
        startParticles,
        stopParticles,
        particles,
    };

})();