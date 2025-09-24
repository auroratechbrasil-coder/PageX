// Variáveis globais
let currentBlocks = [];
let pageSettings = {
    title: "Minha Landing Page",
    headline: "Uma headline impactante aqui",
    ctaText: "Saiba Mais",
    primaryColor: "#4f46e5",
    secondaryColor: "#10b981",
    bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    animateBackground: false,
    darkMode: false
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    initializeApp();
    setupEventListeners();
    updatePreview();
});

// Função para sanitizar entradas de usuário (prevenção XSS)
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Carregar do localStorage
function loadFromLocalStorage() {
    try {
        const savedPage = localStorage.getItem('pageX_landingPage');
        const savedSettings = localStorage.getItem('pageX_settings');
        
        if (savedPage) {
            currentBlocks = JSON.parse(savedPage);
        } else {
            loadDefaultBlocks();
        }
        
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            // Validar as configurações carregadas
            if (parsedSettings && typeof parsedSettings === 'object') {
                pageSettings = {...pageSettings, ...parsedSettings};
            }
        }
    } catch (error) {
        console.error('Erro ao carregar do localStorage:', error);
        loadDefaultBlocks();
    }
}

// Salvar no localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('pageX_landingPage', JSON.stringify(currentBlocks));
        localStorage.setItem('pageX_settings', JSON.stringify(pageSettings));
        
        // Mostrar feedback de salvamento
        const saveBtn = document.getElementById('saveBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Salvo!';
        saveBtn.style.background = '#38a169';
        
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.style.background = '';
        }, 2000);
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
    }
}

// Inicializar a aplicação
function initializeApp() {
    // Configurar valores iniciais nos inputs
    document.getElementById('siteTitle').value = sanitizeInput(pageSettings.title);
    document.getElementById('siteHeadline').value = sanitizeInput(pageSettings.headline);
    document.getElementById('ctaText').value = sanitizeInput(pageSettings.ctaText);
    document.getElementById('primaryColor').value = pageSettings.primaryColor;
    document.getElementById('secondaryColor').value = pageSettings.secondaryColor;
    document.getElementById('bgGradient').value = pageSettings.bgGradient;
    document.getElementById('animateBackground').checked = pageSettings.animateBackground;
    
    // Aplicar estado do background animado
    toggleAnimatedBackground(pageSettings.animateBackground);
    
    // Aplicar modo escuro se necessário
    if (pageSettings.darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Eventos para os controles de edição
    document.getElementById('siteTitle').addEventListener('input', function() {
        pageSettings.title = sanitizeInput(this.value);
        updatePreview();
        saveToLocalStorage();
    });
    
    document.getElementById('siteHeadline').addEventListener('input', function() {
        pageSettings.headline = sanitizeInput(this.value);
        updatePreview();
        saveToLocalStorage();
    });
    
    document.getElementById('ctaText').addEventListener('input', function() {
        pageSettings.ctaText = sanitizeInput(this.value);
        updatePreview();
        saveToLocalStorage();
    });
    
    document.getElementById('primaryColor').addEventListener('input', function() {
        pageSettings.primaryColor = this.value;
        updatePreview();
        saveToLocalStorage();
    });
    
    document.getElementById('secondaryColor').addEventListener('input', function() {
        pageSettings.secondaryColor = this.value;
        updatePreview();
        saveToLocalStorage();
    });
    
    document.getElementById('bgGradient').addEventListener('change', function() {
        pageSettings.bgGradient = this.value;
        updatePreview();
        saveToLocalStorage();
    });
    
    document.getElementById('animateBackground').addEventListener('change', function() {
        pageSettings.animateBackground = this.checked;
        toggleAnimatedBackground(this.checked);
        saveToLocalStorage();
    });
    
    // Eventos para os botões de dispositivo
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const device = this.getAttribute('data-device');
            document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const previewContainer = document.getElementById('previewContainer');
            previewContainer.className = 'preview-container';
            previewContainer.classList.add('preview-' + device);
        });
    });
    
    // Eventos para os templates
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const template = this.getAttribute('data-template');
            loadTemplate(template);
            saveToLocalStorage();
        });
    });
    
    // Eventos para as paletas de cores
    document.querySelectorAll('.palette-selector').forEach(palette => {
        palette.addEventListener('click', function() {
            document.querySelectorAll('.palette-selector').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            const paletteName = this.getAttribute('data-palette');
            applyColorPalette(paletteName);
            saveToLocalStorage();
        });
    });
    
    // Evento para o botão de exportação
    document.getElementById('exportBtn').addEventListener('click', exportPage);
    
    // Evento para o botão de salvar
    document.getElementById('saveBtn').addEventListener('click', saveToLocalStorage);
    
    // Evento para o botão de toggle do painel
    document.getElementById('togglePanel').addEventListener('click', togglePanel);
    
    // Evento para o botão de tema
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Evento para o botão de menu em dispositivos móveis - CORREÇÃO AQUI
    document.getElementById('menuToggle').addEventListener('click', function() {
        const editorPanel = document.getElementById('editorPanel');
        // Remover todas as classes de estado primeiro
        editorPanel.classList.remove('collapsed');
        editorPanel.classList.toggle('active');
        
        // Garantir que o painel esteja visível quando ativo
        if (editorPanel.classList.contains('active')) {
            editorPanel.style.transform = 'translateX(0)';
        } else {
            editorPanel.style.transform = 'translateX(-100%)';
        }
    });
    
    // Configurar drag and drop
    setupDragAndDrop();
    
    // Configurar carrossel de depoimentos
    setupTestimonialCarousel();
}

// Alternar visibilidade do painel lateral - CORREÇÃO AQUI
function togglePanel() {
    const panel = document.getElementById('editorPanel');
    const toggleIcon = document.getElementById('togglePanel').querySelector('i');
    
    // Remover a classe 'active' para evitar conflitos
    panel.classList.remove('active');
    panel.classList.toggle('collapsed');
    
    if (panel.classList.contains('collapsed')) {
        panel.style.transform = 'translateX(-100%)';
        toggleIcon.className = 'fas fa-chevron-right';
    } else {
        panel.style.transform = 'translateX(0)';
        toggleIcon.className = 'fas fa-chevron-left';
    }
}

// Alternar tema claro/escuro
function toggleTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const isDarkMode = document.body.classList.toggle('dark-mode');
    
    pageSettings.darkMode = isDarkMode;
    
    if (isDarkMode) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    updatePreview();
    saveToLocalStorage();
}

// Alternar background animado
function toggleAnimatedBackground(enable) {
    const bgElement = document.getElementById('animatedBackground');
    if (enable) {
        bgElement.classList.add('active');
    } else {
        bgElement.classList.remove('active');
    }
}

// Aplicar paleta de cores pré-definida
function applyColorPalette(paletteName) {
    switch(paletteName) {
        case 'default':
            pageSettings.primaryColor = '#4f46e5';
            pageSettings.secondaryColor = '#10b981';
            break;
        case 'sunset':
            pageSettings.primaryColor = '#f97316';
            pageSettings.secondaryColor = '#ec4899';
            break;
        case 'ocean':
            pageSettings.primaryColor = '#0ea5e9';
            pageSettings.secondaryColor = '#3b82f6';
            break;
        case 'neon':
            pageSettings.primaryColor = '#a855f7';
            pageSettings.secondaryColor = '#ec4899';
            break;
    }
    
    // Atualizar os controles
    document.getElementById('primaryColor').value = pageSettings.primaryColor;
    document.getElementById('secondaryColor').value = pageSettings.secondaryColor;
    
    updatePreview();
}

// Configurar sistema de drag and drop
function setupDragAndDrop() {
    const blocks = document.querySelectorAll('.block-item');
    
    blocks.forEach(block => {
        block.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.getAttribute('data-type'));
            this.classList.add('dragging');
        });
        
        block.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });
    
    const pageContent = document.getElementById('pageContent');
    
    pageContent.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('active');
    });
    
    pageContent.addEventListener('dragleave', function() {
        this.classList.remove('active');
    });
    
    pageContent.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('active');
        
        const blockType = e.dataTransfer.getData('text/plain');
        addBlock(blockType);
        saveToLocalStorage();
    });
}

// Configurar carrossel de depoimentos
function setupTestimonialCarousel() {
    // Esta função será chamada quando blocos de depoimento forem adicionados
}

// Adicionar um novo bloco
function addBlock(type) {
    // Validar o tipo de bloco
    const validBlockTypes = ['hero', 'features', 'testimonials', 'pricing', 'portfolio', 'contact', 'footer'];
    if (!validBlockTypes.includes(type)) {
        console.error('Tipo de bloco inválido:', type);
        return;
    }
    
    const newBlock = {
        id: Date.now(),
        type: type,
        settings: {}
    };
    
    currentBlocks.push(newBlock);
    updatePreview();
}

// Remover um bloco
function removeBlock(id) {
    // Validar se o ID é um número
    if (typeof id !== 'number' || isNaN(id)) {
        console.error('ID de bloco inválido:', id);
        return;
    }
    
    currentBlocks = currentBlocks.filter(block => block.id !== id);
    updatePreview();
    saveToLocalStorage();
}

// Mover um bloco
function moveBlock(id, direction) {
    // Validar se o ID é um número
    if (typeof id !== 'number' || isNaN(id)) {
        console.error('ID de bloco inválido:', id);
        return;
    }
    
    // Validar a direção
    if (direction !== 'up' && direction !== 'down') {
        console.error('Direção inválida:', direction);
        return;
    }
    
    const index = currentBlocks.findIndex(block => block.id === id);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < currentBlocks.length - 1)) {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        // Trocar os blocos de posição
        [currentBlocks[index], currentBlocks[newIndex]] = [currentBlocks[newIndex], currentBlocks[index]];
        updatePreview();
        saveToLocalStorage();
    }
}

// Carregar blocos padrão
function loadDefaultBlocks() {
    currentBlocks = [
        { id: 1, type: 'hero', settings: {} },
        { id: 2, type: 'features', settings: {} },
        { id: 3, type: 'testimonials', settings: {} },
        { id: 4, type: 'cta', settings: {} },
        { id: 5, type: 'footer', settings: {} }
    ];
}

// Carregar um template pré-definido
function loadTemplate(templateName) {
    // Validar o nome do template
    const validTemplates = ['product', 'leads', 'portfolio'];
    if (!validTemplates.includes(templateName)) {
        console.error('Template inválido:', templateName);
        return;
    }
    
    switch(templateName) {
        case 'product':
            pageSettings.title = "Produto Incrível";
            pageSettings.headline = "Descubra como nosso produto pode transformar seu negócio";
            pageSettings.ctaText = "Comprar Agora";
            pageSettings.primaryColor = "#e11d48";
            pageSettings.secondaryColor = "#ea580c";
            pageSettings.bgGradient = "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
            
            currentBlocks = [
                { id: 1, type: 'hero', settings: {} },
                { id: 2, type: 'features', settings: {} },
                { id: 3, type: 'pricing', settings: {} },
                { id: 4, type: 'testimonials', settings: {} },
                { id: 5, type: 'cta', settings: {} },
                { id: 6, type: 'footer', settings: {} }
            ];
            break;
            
        case 'leads':
            pageSettings.title = "E-Book Gratuito";
            pageSettings.headline = "Baixe nosso e-book exclusivo e aprenda os segredos do sucesso";
            pageSettings.ctaText = "Baixar Agora";
            pageSettings.primaryColor = "#2563eb";
            pageSettings.secondaryColor = "#059669";
            pageSettings.bgGradient = "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
            
            currentBlocks = [
                { id: 1, type: 'hero', settings: {} },
                { id: 2, type: 'features', settings: {} },
                { id: 3, type: 'testimonials', settings: {} },
                { id: 4, type: 'contact', settings: {} },
                { id: 5, type: 'footer', settings: {} }
            ];
            break;
            
        case 'portfolio':
            pageSettings.title = "Meu Portfólio";
            pageSettings.headline = "Designer & Desenvolvedor Web Criativo";
            pageSettings.ctaText = "Ver Trabalhos";
            pageSettings.primaryColor = "#7c3aed";
            pageSettings.secondaryColor = "#db2777";
            pageSettings.bgGradient = "linear-gradient(135deg, #fa709a 0%, #fee140 100%)";
            
            currentBlocks = [
                { id: 1, type: 'hero', settings: {} },
                { id: 2, type: 'portfolio', settings: {} },
                { id: 3, type: 'testimonials', settings: {} },
                { id: 4, type: 'contact', settings: {} },
                { id: 5, type: 'footer', settings: {} }
            ];
            break;
    }
    
    // Atualizar os controles
    document.getElementById('siteTitle').value = sanitizeInput(pageSettings.title);
    document.getElementById('siteHeadline').value = sanitizeInput(pageSettings.headline);
    document.getElementById('ctaText').value = sanitizeInput(pageSettings.ctaText);
    document.getElementById('primaryColor').value = pageSettings.primaryColor;
    document.getElementById('secondaryColor').value = pageSettings.secondaryColor;
    document.getElementById('bgGradient').value = pageSettings.bgGradient;
    
    updatePreview();
}

// Atualizar o preview em tempo real
function updatePreview() {
    const pageContent = document.getElementById('pageContent');
    if (!pageContent) {
        console.error('Elemento pageContent não encontrado');
        return;
    }
    
    pageContent.innerHTML = '';
    
    // Aplicar estilos CSS personalizados
    applyCustomStyles();
    
    // Adicionar cada bloco ao preview
    currentBlocks.forEach(block => {
        const blockElement = createBlockElement(block);
        pageContent.appendChild(blockElement);
    });
    
    // Re-inicializar carrosséis e outros componentes interativos
    initInteractiveComponents();
}

// Inicializar componentes interativos
function initInteractiveComponents() {
    // Configurar carrossel de depoimentos
    const testimonialBlocks = document.querySelectorAll('.testimonials-carousel');
    testimonialBlocks.forEach(block => {
        initTestimonialCarousel(block);
    });
    
    // Configurar formulários de contato
    const contactForms = document.querySelectorAll('.contact-form');
    contactForms.forEach(form => {
        initContactForm(form);
    });
}

// Inicializar carrossel de depoimentos
function initTestimonialCarousel(container) {
    const track = container.querySelector('.testimonials-track');
    const items = container.querySelectorAll('.testimonial-item');
    const prevBtn = container.querySelector('.carousel-prev');
    const nextBtn = container.querySelector('.carousel-next');
    
    let currentIndex = 0;
    
    if (prevBtn && nextBtn && track) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentIndex < items.length - 1) {
                currentIndex++;
                updateCarousel();
            }
        });
    }
    
    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
}

// Inicializar formulário de contato
function initContactForm(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validação simples
        let isValid = true;
        const inputs = form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            const errorElement = form.querySelector(`#error-${input.id}`);
            if (input.value.trim() === '') {
                isValid = false;
                input.style.borderColor = '#e53e3e';
                if (errorElement) errorElement.style.display = 'block';
            } else {
                input.style.borderColor = '';
                if (errorElement) errorElement.style.display = 'none';
            }
        });
        
        // Validação de email
        const emailInput = form.querySelector('input[type="email"]');
        if (emailInput && emailInput.value.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                isValid = false;
                emailInput.style.borderColor = '#e53e3e';
                const errorElement = form.querySelector(`#error-${emailInput.id}`);
                if (errorElement) {
                    errorElement.textContent = 'Por favor, insira um email válido.';
                    errorElement.style.display = 'block';
                }
            }
        }
        
        if (isValid) {
            // Simular envio bem-sucedido
            const successElement = form.querySelector('.form-success');
            if (successElement) {
                successElement.style.display = 'block';
                form.reset();
                
                setTimeout(() => {
                    successElement.style.display = 'none';
                }, 5000);
            }
        }
    });
}

// Aplicar estilos personalizados com base nas configurações
function applyCustomStyles() {
    let styleElement = document.getElementById('customStyles');
    
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'customStyles';
        document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
        :root {
            --primary-color: ${pageSettings.primaryColor};
            --secondary-color: ${pageSettings.secondaryColor};
        }
        
        .hero-block {
            background: ${pageSettings.bgGradient};
        }
        
        .cta-button, .template-btn, .export-btn, .menu-toggle, .carousel-control, .save-btn {
            background: ${pageSettings.primaryColor};
        }
        
        .cta-button:hover, .template-btn:hover, .export-btn:hover, .menu-toggle:hover, .carousel-control:hover, .save-btn:hover {
            background: ${adjustColor(pageSettings.primaryColor, -20)};
        }
        
        .cta-block {
            background: ${pageSettings.primaryColor};
        }
        
        .feature-icon, .contact-icon, .social-link:hover {
            color: ${pageSettings.primaryColor};
        }
        
        .device-btn.active {
            color: ${pageSettings.primaryColor};
        }
        
        .control-group h3 {
            color: ${pageSettings.primaryColor};
        }
        
        .logo, .theme-toggle, .toggle-panel {
            color: ${pageSettings.primaryColor};
        }
        
        .pricing-plan.featured {
            border-color: ${pageSettings.primaryColor};
        }
        
        .save-btn {
            background: ${pageSettings.secondaryColor};
        }
        
        .save-btn:hover {
            background: ${adjustColor(pageSettings.secondaryColor, -20)};
        }
    `;
}

// Ajustar cor (clarear ou escurecer)
function adjustColor(hex, amount) {
    // Validar se é uma cor hexadecimal válida
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
        console.error('Cor hexadecimal inválida:', hex);
        return '#4f46e5'; // Cor padrão de fallback
    }
    
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Criar elemento de bloco para o preview
function createBlockElement(block) {
    const blockContainer = document.createElement('div');
    blockContainer.className = 'block-container';
    blockContainer.setAttribute('data-block-id', block.id);
    
    let blockContent = '';
    
    switch(block.type) {
        case 'hero':
            blockContent = `
                <section class="hero-block">
                    <h1 class="hero-title">${sanitizeInput(pageSettings.title)}</h1>
                    <p class="hero-headline">${sanitizeInput(pageSettings.headline)}</p>
                    <button class="cta-button">${sanitizeInput(pageSettings.ctaText)}</button>
                </section>
            `;
            break;
            
        case 'features':
            blockContent = `
                <section class="features-block">
                    <h2 class="features-title">Nossos Diferenciais</h2>
                    <div class="features-grid">
                        <div class="feature-item">
                            <div class="feature-icon"><i class="fas fa-rocket"></i></div>
                            <h3 class="feature-title">Rápido e Eficiente</h3>
                            <p class="feature-description">Nossa solução é otimizada para performance máxima.</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon"><i class="fas fa-lightbulb"></i></div>
                            <h3 class="feature-title">Inovador</h3>
                            <p class="feature-description">Tecnologia de ponta para resultados excepcionais.</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon"><i class="fas fa-shield-alt"></i></div>
                            <h3 class="feature-title">Confiável</h3>
                            <p class="feature-description">Segurança e estabilidade garantidas para seu negócio.</p>
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'testimonials':
            blockContent = `
                <section class="testimonials-block">
                    <h2 class="testimonials-title">O que nossos clientes dizem</h2>
                    <div class="testimonials-carousel">
                        <div class="testimonials-track">
                            <div class="testimonial-item">
                                <p class="testimonial-text">"Esta solução transformou completamente meu negócio. Incrível!"</p>
                                <p class="testimonial-author">- João Silva, CEO da Empresa X</p>
                            </div>
                            <div class="testimonial-item">
                                <p class="testimonial-text">"Simplesmente fantástico! A equipe adotou rapidamente e os resultados foram imediatos."</p>
                                <p class="testimonial-author">- Maria Santos, Diretora de Marketing</p>
                            </div>
                            <div class="testimonial-item">
                                <p class="testimonial-text">"O retorno sobre investimento foi evidente já no primeiro mês de uso."</p>
                                <p class="testimonial-author">- Pedro Costa, Gerente de Projetos</p>
                            </div>
                        </div>
                        <div class="carousel-controls">
                            <button class="carousel-control carousel-prev">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="carousel-control carousel-next">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'pricing':
            blockContent = `
                <section class="pricing-block">
                    <h2 class="pricing-title">Nossos Planos</h2>
                    <div class="pricing-grid">
                        <div class="pricing-plan">
                            <h3 class="plan-name">Básico</h3>
                            <div class="plan-price">R$ 49<span>/mês</span></div>
                            <ul class="plan-features">
                                <li>5 Páginas</li>
                                <li>1GB de Armazenamento</li>
                                <li>Suporte por Email</li>
                                <li>Relatórios Básicos</li>
                            </ul>
                            <button class="cta-button">Assinar Agora</button>
                        </div>
                        <div class="pricing-plan featured">
                            <h3 class="plan-name">Profissional</h3>
                            <div class="plan极速电玩城-price">R$ 99<span>/mês</span></div>
                            <ul class="plan-features">
                                <li>20 Páginas</li>
                                <li>5GB de Armazenamento</li>
                                <li>Suporte Prioritário</li>
                                <li>Relatórios Avançados</li>
                                <li>SEO Básico</li>
                            </ul>
                            <button class="cta-button">Assinar Agora</button>
                        </div>
                        <div class="pricing-plan">
                            <h3 class="plan-name">Empresarial</h3>
                            <div class="plan-price">R$ 199<span>/mês</span></div>
                            <ul class="plan-features">
                                <li>Páginas Ilimitadas</li>
                                <li>20GB de Armazenamento</li>
                                <li>Suporte 24/7</li>
                                <极速电玩城li>Relatórios Personalizados</li>
                                <li>SEO Avançado</li>
                            </ul>
                            <button class="cta-button">Assinar Agora</button>
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'portfolio':
            blockContent = `
                <section class="portfolio-block">
                    <h2 class="portfolio-title">Nossos Trabalhos</h2>
                    <div class="portfolio-grid">
                        <div class="portfolio-item">
                            <img src="https://via.placeholder.com/400x300/4f46e5/ffffff?text=Projeto+1" alt="Projeto 1" class="portfolio-image">
                            <div class="portfolio-overlay">
                                <h3 class="portfolio-item-title">Design de Interface</h3>
                                <p class="portfolio-item-desc">UI/UX design para aplicativo mobile</p>
                            </div>
                        </div>
                        <div class="portfolio-item">
                            <img src="https://via.placeholder.com/400x300/10b981/ffffff?text=Projeto+2" alt="Projeto 2" class="portfolio-image">
                            <div class="portfolio-overlay">
                                <h3 class="portfolio-item-title">Website Corporativo</h3>
                                <p class="portfolio-item-desc">Site responsivo para empresa de tecnologia</p>
                            </div>
                        </div>
                        <div class="portfolio-item">
                            <img src="https://via.placeholder.com/400x300/f97316/ffffff?text=极速电玩城Projeto+3" alt="Projeto 3" class="portfolio-image">
                            <div class="portfolio-overlay">
                                <h3 class="portfolio-item-title">Identidade Visual</h3>
                                <p class="portfolio-item-desc">Branding completo para startup</p>
                            </div>
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'contact':
            blockContent = `
                <section class="contact-block">
                    <h2 class="contact-title">Entre em Contato</h2>
                    <div class="contact-container">
                        <div class="contact-info">
                            <div class="contact-info-item">
                                <div class="contact-icon">
                                    <i class="fas fa-map-marker-alt"></i>
                                </div>
                                <div class="contact-text">
                                    <h4>Endereço</h4>
                                    <p>Av. Paulista, 1000, São Paulo - SP</p>
                                </div>
                            </div>
                            <div class="contact-info-item">
                                <div class="contact-icon">
                                    <i class="fas fa-phone"></i>
                                </div>
                                <div class="contact-text">
                                    <h4>Telefone</h4>
                                    <p>(11) 99999-9999</p>
                                </div>
                            </极速电玩城div>
                            <div class="contact-info-item">
                                <div class="contact-icon">
                                    <i class="fas fa-envelope"></i>
                                </div>
                                <div class="contact-text">
                                    <h4>Email</h4>
                                    <p>contato@empresa.com</p>
                                </div>
                            </div>
                        </div>
                        <form class="contact-form">
                            <div class="form-group">
                                <label for="contact-name">Nome</label>
                                <input type="text" id="contact-name" required>
                                <div class="form-error" id="error-contact-name">Por favor, insira seu nome.</div>
                            </div>
                            <div class="form-group">
                                <label for="contact-email">Email</label>
                                <input type="email" id="contact-email" required>
                                <div class="form-error" id="error-contact-email">Por favor, insira um email válido.</div>
                            </div>
                            <div class="form-group">
                                <label for="contact-message">Mensagem</label>
                                <textarea id="contact-message" required></textarea>
                                <div class="form-error" id="error-contact-message">Por favor, insira sua mensagem.</div>
                            </div>
                            <button type="submit" class="cta-button">Enviar Mensagem</button>
                            <div class="form-success">Sua mensagem foi enviada com sucesso!</div>
                        </form>
                    </div>
                </section>
            `;
            break;
            
        case 'footer':
            blockContent = `
                <footer class="footer-block">
                    <div class="footer-content">
                        <div class="footer-about">
                            <div class="footer-logo">${sanitizeInput(pageSettings.title)}</div>
                            <p class="footer-desc">Criamos soluções incríveis para transformar seu negócio e alcançar resultados excepcionais.</p>
                            <div class="social-links">
                                <a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a>
                                <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                                <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
                                <a href="#" class="social-link"><i class="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>
                        <div class="footer-links-column">
                            <h3 class="footer-heading">Links Rápidos</h3>
                            <ul class="footer-links">
                                <li><a href="#">Início</a></li>
                                <li><a href="#">Sobre</a></li>
                                <li><a href="#">Serviços</a></li>
                                <li><a href="#">Portfólio</a></li>
                                <li><a href="#">Contato</极速电玩城></li>
                            </ul>
                        </div>
                        <div class="footer-links-column">
                            <h3 class="footer-heading">Serviços</h3>
                            <ul class="footer-links">
                                <li><a href="#">Web Design</a></li>
                                <li><a href="#">Desenvolvimento</a></li>
                                <li><a href="#">Marketing Digital</a></li>
                                <li><a href="#">SEO</a></li>
                                <li><a href="#">Branding</a></li>
                            </ul>
                        </div>
                        <div class="footer-links-column">
                            <h3 class="footer-heading">Suporte</极速电玩城>
                            <ul class="footer-links">
                                <li><a href="#">FAQ</a></li>
                                <li><a href="#">Termos de Uso</a></li>
                                <li><a href="#">Política de Privacidade</a></li>
                                <li><极速电玩城a href="#">Cookies</a></li>
                                <li><a href="#">Ajuda</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; ${new Date().getFullYear()} ${sanitizeInput(pageSettings.title)}. Todos os direitos reservados.</p>
                    </div>
                </footer>
            `;
            break;
    }
    
    blockContainer.innerHTML = blockContent;
    
    // Adicionar botões de ação
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'block-actions';
    actionsDiv.innerHTML = `
        <button onclick="moveBlock(${block.id}, 'up')" title="Mover para cima"><i class="fas fa-arrow-up"></i></button>
        <button onclick="moveBlock(${block.id}, 'down')" title="Mover para baixo"><i class="fas fa-arrow-down"></i></button>
        <button onclick="removeBlock(${block.id})" title="Remover bloco"><i class="fas fa-trash"></i></button>
    `;
    
    blockContainer.appendChild(actionsDiv);
    
    return blockContainer;
}

// Exportar a página como ZIP
function exportPage() {
    try {
        const zip = new JSZip();
        
        // Gerar HTML
        const htmlContent = generateHTML();
        zip.file("index.html", htmlContent);
        
        // Gerar CSS
        const cssContent = generateCSS();
        zip.file("style.css", cssContent);
        
        // Criar e baixar o ZIP
        zip.generateAsync({type:"blob"}).then(function(content) {
            saveAs(content, "landing-page.zip");
        });
    } catch (error) {
        console.error('Erro ao exportar a página:', error);
        alert('Erro ao exportar a página. Verifique o console para mais detalhes.');
    }
}

// Gerar HTML para exportação
function generateHTML() {
    let blocksHTML = '';
    
    currentBlocks.forEach(block => {
        switch(block.type) {
            case 'hero':
                blocksHTML += `
                <section class="hero-block">
                    <h1 class="hero-title">${sanitizeInput(pageSettings.title)}</h1>
                    <p class="hero-headline">${sanitizeInput(pageSettings.headline)}</p>
                    <a href="#" class="cta-button">${sanitizeInput(pageSettings.ctaText)}</a>
                </section>
                `;
                break;
                
            case 'features':
                blocksHTML += `
                <section class="features-block">
                    <h2 class="features-title">Nossos Diferenciais</极速电玩城>
                    <div class="features-grid">
                        <div class="feature-item">
                            <div class="feature-icon"><i class="fas fa-rocket"></i></div>
                            <h3 class="feature-title">Rápido e Eficiente</h3>
                            <p class="feature-description">Nossa solução é otimizada para performance máxima.</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon"><i class="fas fa-lightbulb"></i></div>
                            <h3 class="feature-title">Inovador</h3>
                            <p class="feature-description">Tecnologia de ponta para resultados excepcionais.</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon"><i class="fas fa-shield-alt"></i></div>
                            <h3 class="feature-title">Confiável</h3>
                            <p class="feature-description">Segurança e estabilidade garantidas para seu negócio.</p>
                        </div>
                    </div>
                </section>
                `;
                break;
                
            case 'testimonials':
                blocksHTML += `
                <section class="testimonials-block">
                    <h2 class="testimonials-title">O que nossos clientes dizem</h2>
                    <div class="testimonials-carousel">
                        <div class="testimonials-track">
                            <div class="testimonial-item">
                                <p class="testimonial-text">"Esta solução transformou completamente meu negócio. Incrível!"</p>
                                <p class="testimonial-author">- João Silva, CEO da Empresa X</p>
                            </div>
                            <div class="testimonial-item">
                                <p class="testimonial-text">"Simplesmente fantástico! A equipe adotou rapidamente e os resultados foram imediatos."</p>
                                <p class="testimonial-author">- Maria Santos, Diretora de Marketing</p>
                            </div>
                            <div class="testimonial-item">
                                <p class="testimonial-text">"O retorno sobre investimento foi evidente já no primeiro mês de uso."</p>
                                <p class="testimonial-author">- Pedro Costa, Gerente de Projetos</p>
                            </极速电玩城div>
                        </div>
                        <div class="carousel-controls">
                            <button class="carousel-control carousel-prev">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="carousel-control carousel-next">
                                <i class="fas fa-chevron-right"></极速电玩城>
                            </button>
                        </div>
                    </div>
                </section>
                `;
                break;
                
            case 'pricing':
                blocksHTML += `
                <section class="pricing-block">
                    <h2 class="pricing-title">Nossos Planos</h2>
                    <div class="pricing-grid">
                        <div class="极速电玩城pricing-plan">
                            <h3 class="plan-name">Básico</h3>
                            <div class="plan-price">R$ 49<span>/mês</span></div>
                            <ul class="plan-features">
                                <li>5 Páginas</li>
                                <li>1GB de Armazenamento</li>
                                <li>Suporte por Email</li>
                                <li>Relatórios Básicos</li>
                            </ul>
                            <a href="#" class="cta-button">Assinar Agora</a>
                        </div>
                        <div class="pricing-plan featured">
                            <h3 class="plan-name">Profissional</h3>
                            <div class="plan-price">R$ 99<span>/mês</span></div>
                            <ul class="plan-features">
                                <li>20 Páginas</li>
                                <li>5GB de Armazenamento</li>
                                <li>Suporte Prioritário</li>
                                <li>Relatórios Avançados</li>
                                <li>SEO Básico</li>
                            </ul>
                            <a href="#" class="cta-button">Assinar Agora</a>
                        </div>
                        <div class="pricing-plan">
                            <h3 class="plan-name">Empresarial</h3>
                            <div class="plan-price">R$ 199<span>/mês</span></div>
                            <ul class="plan-features">
                                <li>Páginas Ilimitadas</li>
                                <li>20GB de Armazenamento</li>
                                <li>Suporte 24/极速电玩城7</li>
                                <li>Relatórios Personalizados</li>
                                <li>SEO Avançado</li>
                            </ul>
                            <a href="#" class="cta-button">Assinar Agora</a>
                        </极速电玩城div>
                    </极速电玩城div>
                </section>
                `;
                break;
                
            case 'portfolio':
                blocksHTML += `
                <section class="portfolio-block">
                    <h2 class="portfolio-title">Nossos Trabalhos</h2>
                    <div class="portfolio-grid">
                        <div class="portfolio-item">
                            <img src="https://via.placeholder.com/400x300/4f46e5/ffffff?text=Projeto+1" alt="Projeto 1" class="portfolio-image">
                            <div class="portfolio-overlay">
                                <h3 class="portfolio-item-title">Design de Interface</h3>
                                <p class="portfolio-item-desc">UI/UX design para aplicativo mobile</p>
                            </div>
                        </div>
                        <div class="portfolio-item">
                            <img src="https://via.placeholder.com/400x300/10b981/ffffff?text=Projeto+2" alt="Projeto 2" class="portfolio-image">
                            <div class="portfolio-overlay">
                                <h3 class="portfolio-item-title">Website Corporativo</h3>
                                <p class="portfolio-item-desc">Site responsivo para empresa de tecnologia</p>
                            </div>
                        </div>
                        <div class="portfolio-item">
                            <img src="https://via.placeholder.com/400x300/f97316/ffffff?text=Projeto+3" alt="Projeto 3" class="portfolio-image">
                            <div class="portfolio-overlay">
                                <h3 class="portfolio-item-title">Identidade Visual</h3>
                                <p class="portfolio-item-desc">Branding completo para startup</p>
                            </div>
                        </div>
                    </div>
                </section>
                `;
                break;
                
            case 'contact':
                blocksHTML += `
                <section class="contact-block">
                    <h2 class="contact-title">Entre em Contato</h2>
                    <div class="contact-container">
                        <div class="contact-info">
                            <div class="contact-info-item">
                                <div class="contact-icon">
                                    <i class="fas fa-map-marker-alt"></i>
                                </div>
                                <div class="contact-text">
                                    <h4>Endereço</h4>
                                    <p>Av. Paulista, 1000, São Paulo - SP</p>
                                </div>
                            </div>
                            <div class="contact-info-item">
                                <div class="contact-icon">
                                    <i class="fas fa-phone"></i>
                                </div>
                                <div class="contact-text">
                                    <h4>Telefone</h4>
                                    <p>(11) 99999-9999</p>
                                </div>
                            </div>
                            <div class="contact-info-item">
                                <div class="contact-icon">
                                    <i class="fas fa-envelope"></i>
                                </div>
                                <div class="contact-text">
                                    <h4>Email</h4>
                                    <p>contato@empresa.com</p>
                                </div>
                            </div>
                        </div>
                        <form class="contact-form">
                            <div class="form-group">
                                <label for="contact-name">Nome</label>
                                <input type="text" id="contact-name" required>
                                <div class="form-error" id极速电玩城="error-contact-name">Por favor, insira seu nome.</div>
                            </div>
                            <div class="form-group">
                                <label for="contact-email">Email</label>
                                <input type="email" id="contact-email" required>
                                <div class="form-error" id="error-contact-email">Por favor, insira um email válido.</div>
                            </div>
                            <div class="form-group">
                                <label for="contact-message">Mensagem</label>
                                <textarea id="contact-message" required></textarea>
                                <div class="form-error" id="error-contact-message">Por favor, insira sua mensagem.</div>
                            </div>
                            <button type="submit" class="cta-button">Enviar Mensagem</button>
                            <div class="form-success">Sua mensagem foi enviada com sucesso!</div>
                        </form>
                    </div>
                </section>
                `;
                break;
                
            case 'footer':
                blocksHTML += `
                <footer class="footer-block">
                    <div class="footer-content">
                        <div class="footer-about">
                            <div class="footer-logo">${sanitizeInput(pageSettings.title)}</div>
                            <p class="footer-desc">Criamos soluções incríveis para transformar seu negócio e alcançar resultados excepcionais.</p>
                            <div class="social-links">
                                <a href="#" class="social-link"><极速电玩城i class="fab fa-facebook-f"></i></a>
                                <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                                <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
                                <a href="#" class="social-link"><i class="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>
                        <div class="footer-links-column">
                            <h3 class="footer-heading">Links Rápidos</h3>
                            <ul class="footer-links">
                                <li><a href="#">Início</a></li>
                                <li><a href="#">Sobre</a></li>
                                <li><a href="#">Serviços</a></li>
                                <li><a href="#">Portfólio</a></li>
                                <li><a href="#">Contato</a></li>
                            </ul>
                        </div>
                        <div class="footer-links-column">
                            <h3 class="footer-heading">Serviços</h3>
                            <ul class="footer-links">
                                <li><a href="#">Web Design</a></li>
                                <li><a href="#">Desenvolvimento</a></li>
                                <li><a href="#">Marketing Digital</a></li>
                                <li><a href="#">SEO</a></极速电玩城>
                                <li><a href="#">Branding</a></li>
                            </ul>
                        </div>
                        <div class="footer-links-column">
                            <h3 class="footer-heading">Suporte</h3>
                            <ul class="footer-links">
                                <li><a href="#">FAQ</a></li>
                                <li><a href="#">Termos de Uso</a></li>
                                <li><a href="#">Política de Privacidade</a></li>
                                <li><a href="#">Cookies</a></li>
                                <li><a href="#">Ajuda</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; ${new Date().getFullYear()} ${sanitizeInput(pageSettings.title)}. Todos os direitos reservados.</p>
                    </div>
                </footer>
                `;
                break;
        }
    });
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sanitizeInput(pageSettings.title)}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="page-content">
        ${blocksHTML}
    </div>
    <script>
        // Script para o carrossel de depoimentos
        document.addEventListener('DOMContentLoaded', function() {
            const carousels = document.querySelectorAll('.testimonials-carousel');
            
            carousels.forEach(carousel => {
                const track = carousel.querySelector('.testimonials-track');
                const items = carousel.querySelectorAll('.testimonial-item');
                const prevBtn = carousel.querySelector('.carousel-prev');
                const nextBtn = carousel.querySelector('.carousel-next');
                
                let currentIndex = 0;
                
                if (prevBtn && nextBtn) {
                    prevBtn.addEventListener('click', () => {
                        if (currentIndex > 0) {
                            currentIndex--;
                            updateCarousel();
                        }
                    });
                    
                    nextBtn.addEventListener('click', ()极速电玩城 => {
                        if (currentIndex < items.length - 1) {
                            currentIndex++;
                            updateCarousel();
                        }
                    });
                }
                
                function updateCarousel() {
                    track.style.transform = \`translateX(-\${currentIndex * 100}%)\`;
                }
            });
            
            // Script para o formulário de contato
            const contactForms = document.querySelectorAll('.contact-form');
            
            contactForms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    let isValid = true;
                    const inputs = form.querySelectorAll('input, textarea');
                    
                    inputs.forEach(input => {
                        const errorElement = form.querySelector(\`#error-\${input.id}\`);
                        if (input.value.trim() === '') {
                            isValid = false;
                            input.style.borderColor = '#e53e3e';
                            if (errorElement) errorElement.style.display = 'block';
                        } else {
                            input.style.borderColor = '';
                            if (errorElement) errorElement.style.display = 'none';
                        }
                    });
                    
                    const emailInput = form.querySelector('input[type="email"]');
                    if (emailInput && emailInput.value.trim() !== '') {
                        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                        if (!emailRegex.test(emailInput.value)) {
                            isValid = false;
                            emailInput.style.borderColor = '#e53e3e';
                            const errorElement = form.querySelector(\`#error-\${emailInput.id}\`);
                            if (errorElement) {
                                errorElement.textContent = 'Por favor, insira um email válido.';
                                errorElement.style.display = 'block';
                            }
                        }
                    }
                    
                    if (isValid) {
                        const successElement = form.querySelector('.form-success');
                        if (successElement) {
                            successElement.style.display = 'block';
                            form.reset();
                            
                            setTimeout(() => {
                                successElement.style.display = 'none';
                            }, 5000);
                        }
                    }
                });
            });
        });
    </script>
</body>
</html>`;
}

// Gerar CSS para exportação
function generateCSS() {
    return `/* Reset e estilos base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif;
}

:root {
    --primary-color: ${pageSettings.primaryColor};
    --secondary-color: ${pageSettings.secondaryColor};
    --text-color: #2d3748;
    --text-light: #718096;
    --bg-color: #f9fafb;
    --radius: 16px;
    --radius-sm: 10px;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    overflow-x: hidden;
}

.page-content {
    width: 100%;
    max-width: 1200px;
    margin: 极速电玩城 auto;
    min-height: 100vh;
    background: white;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-radius: var(--radius);
    overflow: hidden;
}

/* Estilos para os blocos da landing page */
.hero-block {
    padding: 120px 20px;
    text-align: center;
    background: ${pageSettings.bgGradient};
    color: white;
    position: relative;
    overflow: hidden;
}

.hero-block::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
}

.hero-block > * {
    position: relative;
    z-index: 2;
}

.hero-title {
    font-size: 3.5rem;
    margin-bottom: 20极速电玩城;
    font-weight: 800;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-headline {
    font-size: 1.5rem;
    margin-bottom: 40px;
    font-weight: 300;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
}

.cta-button {
    display: inline-block;
    padding: 16px 35px;
    background: var(--primary-color);
    color: white;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
    border: none;
    cursor: pointer;
}

.cta-button:hover {
    background: ${adjustColor(pageSettings.primaryColor, -20)};
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(67, 56, 202, 0.5);
}

.features-block {
    padding: 100px 20px;
    background: #f9fafb;
}

.features-title {
    text-align: center;
    font-size: 2.8rem;
    margin-bottom: 60px;
    color: var(--primary-color);
    font-weight: 700;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
}

.feature-item {
    text-align: center;
    padding: 40px 30px;
    border-radius: var(--radius);
    background: white;
    transition: all 0.3s cubic-bezier(0.4, 极速电玩城, 0.2, 1);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.feature-item:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 25px;
    color: var(--primary-color);
}

.feature-title {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: var(--primary-color);
    font-weight: 600;
}

.feature-description {
    color: var(--text-light);
    line-height: 1.6;
}

.testimonials-block {
    padding: 100px 20极速电玩城;
    background: #f3f4f6;
}

.testimonials-title {
    text-align: center;
    font-size: 2.8rem;
    margin-bottom: 60px;
    color: var(--极速电玩城primary-color);
    font-weight: 700;
}

.testimonials-carousel {
    position: relative;
    overflow: hidden;
}

.testimonials-track {
    display: flex;
    transition: transform 0.5s ease;
}

.testimonial-item {
    flex: 0 0 100%;
    background: white;
    padding: 40px 30px;
    border-radius: var(--radius);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin: 0 15px;
}

.testimonial-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.testimonial-text {
    font-style: italic;
    margin-bottom: 25px;
    color: var(--text-color);
    line-height: 1.6;
    font-size: 1.1rem;
}

.testimonial-author {
    font-weight: 600;
    color: var(--primary-color);
}

.carousel-controls {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 30px;
}

.carousel-control {
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-control:hover {
    background: ${adjustColor(pageSettings.primaryColor, -20)};
    transform: scale(1.1);
}

/* Pricing Section */
.pricing-block {
    padding: 100px 20px;
    background: #f9fafb;
}

.pricing-title {
    text-align: center;
    font-size: 2.8rem;
    margin-bottom: 60px;
    color: var(--primary-color);
    font-weight: 700;
}

.pricing极速电玩城-grid {
    display: grid;
    grid-template-columns: repeat(3, 1极速电玩城);
    gap: 30px;
}

.pricing-plan {
    background: white;
    border-radius: var(--radius);
    padding: 40px 30px;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.pricing-plan.featured {
    transform: scale(1.05);
    border: 2px solid var(--primary-color);
    box-shadow: 0 10px 25px rgba(79, 70, 229, 0.2);
}

.pricing-plan:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.pricing-plan.featured:hover {
    transform: scale(1极速电玩城.05) translateY(-10px);
}

.plan-name {
    font-size: 1.5rem;
    color: var(--primary-color);
    margin-bottom: 15px;
    font-weight: 600;
}

.plan-price {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 20px;
}

.plan-price span {
    font-size: 1rem;
    color: var(--text-light);
}

.plan-features {
    list-style: none;
    margin-bottom: 30px;
}

.plan-features li {
    padding: 8px 0;
    color: var(--text-color);
    border-bottom: 1px solid #e2e8f0;
}

.plan-features li:last-child {
    border-bottom: none;
}

/* Portfolio Section */
.portfolio-block {
    padding: 100px 20px;
    background: #f3f4f6;
}

.portfolio-title {
    text-align: center;
    font-size: 2.8rem;
    margin-bottom: 60px;
    color: var(--primary-color);
    font-weight: 700;
}

.portfolio-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
}

.portfolio-item {
    position: relative;
    border-radius: var(--radius);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    height: 300px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.portfolio-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.portfolio-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.portfolio-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 20px;
}

.portfolio-item:hover .portfolio-overlay {
    opacity: 1;
}

.portfolio-item:hover .极速电玩城portfolio-image {
    transform: scale(1.1);
}

.portfolio-item-title {
    color: white;
    font-size: 1.5rem;
    margin-bottom: 10px;
    font-weight: 600;
    transform: translateY(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transition-delay: 0.1s;
}

.portfolio-item-desc {
    color: #e2e8f0;
    text-align: center;
    transform: translateY(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transition-delay: 0.2s;
}

.portfolio-item:hover .portfolio-item-title,
.portfolio-item:hover .portfolio-item-desc {
    transform: translateY(0);
}

/* Contact Section */
.contact-block {
    padding: 100px 20px;
    background: #f9fafb;
}

.contact-title {
    text-align: center;
    font-size: 2.8rem;
    margin-bottom: 60px;
    color: var(--primary-color);
    font-weight: 极速电玩城;
}

.contact-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 50px;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.contact-info极速电玩城-item {
    display: flex;
    align-items: center;
    gap: 15px;
}

.contact-icon {
    width: 50px;
    height: 50px;
    background: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
}

.contact-text h4 {
    color: var(--primary-color);
    margin-bottom: 5px;
}

.contact-form {
    background: white;
    padding: 30px;
    border-radius: var(--radius);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-color);
    font-weight: 500;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #e2e8f0;
    border-radius: var(--radius-sm);
    background: white;
    color: var(--text-color);
    transition: all 极速电玩城.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.form-group textarea {
    min-height: 120px;
    resize: vertical;
}

.form-error {
    color: #e53e3e;
    font-size: 0.85rem;
    margin-top: 5px;
    display: none;
}

.form-success {
    background: #38a169;
    color: white;
    padding: 15px;
    border-radius: var(--radius-sm);
    margin-top: 20px;
    display: none;
    text-align: center;
}

/* Footer Section */
.footer-block {
    padding: 60px 20px 30极速电玩城;
    background: #1极速电玩城2937;
    color: white;
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;
    margin-bottom: 40px;
}

.footer-logo {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 15px;
    color: white;
}

.footer-desc {
    color: #a0aec0;
    line-height: 1.6;
    margin-bottom: 20px;
}

.footer-heading {
    font-size: 极速电玩城.2rem;
    font-weight: 600;
    margin-bottom: 20px;
    color: white;
}

.footer-links {
    list-style: none;
}

.footer-links极速电玩城 li {
    margin-bottom: 10px;
}

.footer-links a {
    color: #a0aec0;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.footer-links a:hover {
    color: white;
}

.social-links {
    display: flex;
    gap: 15px;
}

.social-link {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.social-link:hover {
    background: var(--primary-color);
    transform: translateY(-3px);
}

.footer-bottom {
    text-align: center;
    padding-top: 30px;
    border-top: 1px solid #2d3748;
    color: #a0aec0;
}

/* Responsividade */
@media (max-width: 1200px) {
    .features-grid,
    .testimonials-grid,
    .pricing-grid,
    .portfolio-grid,
    .footer-content {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .contact-container {
        grid-template-columns: 1fr;
        gap: 30px;
    }
}

@media (max-width: 768px) {
    .features-grid,
    .testimonials-grid,
    .pricing-grid,
    .portfolio-grid,
    .footer-content {
        grid-template-columns: 1fr;
    }
    
    .hero-title {
        font-size: 2.5rem;
    }
    
    .features-title,
    .testimonials-title,
    .pricing-title,
    .portfolio-title,
    .contact-title,
    .cta-block-title {
        font-size: 2.2rem;
    }
    
    .page-content {
        box-shadow: none;
        border-radius: 0;
    }
}`;
    }
