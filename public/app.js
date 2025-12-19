const API_BASE = 'http://localhost:3000';

// Estado global
let allEvents = [];
let allProfiles = [];
let currentCategory = 'all';
let searchTerm = '';
let isAdminLoggedIn = false;
let currentPage = 1;
const EVENTS_PER_PAGE = 9;
let activeFilters = {
    instagram: '',
    type: '',
    period: '',
    category: 'all'
};

// Funções para Skeletons de Loading
function generateEventSkeletons(count = 6) {
    return Array.from({ length: count }, () => `
        <div class="skeleton-event-card">
            <div class="skeleton skeleton-event-image"></div>
            <div class="skeleton-event-content">
                <div class="skeleton skeleton-event-title"></div>
                <div class="skeleton skeleton-event-location"></div>
                <div class="skeleton skeleton-event-button"></div>
            </div>
        </div>
    `).join('');
}

function generateFeaturedSkeletons(count = 3) {
    return Array.from({ length: count }, () => `
        <div class="skeleton-featured-card">
            <div class="skeleton skeleton-featured-image"></div>
            <div class="skeleton-featured-content">
                <div class="skeleton skeleton-featured-title"></div>
                <div class="skeleton skeleton-featured-location"></div>
            </div>
        </div>
    `).join('');
}

function generateUpcomingSkeletons(count = 4) {
    return Array.from({ length: count }, () => `
        <div class="skeleton-upcoming-item">
            <div class="skeleton skeleton-upcoming-date"></div>
            <div class="skeleton-upcoming-info">
                <div class="skeleton skeleton-upcoming-title"></div>
                <div class="skeleton skeleton-upcoming-location"></div>
            </div>
        </div>
    `).join('');
}

function generateProfileSkeletons(count = 3) {
    return Array.from({ length: count }, () => `
        <div class="skeleton-event-card" style="max-width: 400px;">
            <div class="skeleton skeleton-event-image" style="height: 150px;"></div>
            <div class="skeleton-event-content">
                <div class="skeleton skeleton-event-title"></div>
                <div class="skeleton skeleton-event-location"></div>
            </div>
        </div>
    `).join('');
}

// Botão Voltar ao Topo
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Mostrar/esconder botão voltar ao topo
window.addEventListener('scroll', () => {
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    }
});

// Credenciais padrão do administrador (em produção, usar backend)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123' // Em produção, usar hash e backend
};

// Mostrar eventos pendentes
async function showPendingEvents() {
    if (!isAdminLoggedIn) {
        alert('⚠️ Você precisa estar logado como administrador!');
        toggleAdminMenu();
        return;
    }
    
    closeAdminMenu();
    document.getElementById('pending-events-modal').classList.add('show');
    await loadPendingEvents();
}

// Carregar eventos pendentes
async function loadPendingEvents() {
    const container = document.getElementById('pending-events-list');
    if (!container) {
        console.error('Container de eventos pendentes não encontrado');
        return;
    }
    
    container.innerHTML = generateEventSkeletons(3);
    
    try {
        const response = await fetch(`${API_BASE}/events/pending`);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.events || data.events.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>✅ Nenhum evento pendente</h3>
                    <p>Todos os eventos foram aprovados!</p>
                </div>
            `;
            updatePendingCount(0);
            return;
        }
        
        updatePendingCount(data.events.length);
        
        container.innerHTML = data.events.map(event => {
            const dateStr = event.date ? formatDate(event.date) : 'Data não detectada';
            const locationStr = event.location || 'Local não informado';
            const reason = !event.date ? 'Data não detectada' : 'Data no passado ou inválida';
            
            return `
                <div class="pending-event-card">
                    ${event.media_url ? `
                        <img 
                            src="${(event.media_url.includes('supabase.co/storage') ? event.media_url : (event.media_url.includes('instagram') || event.media_url.includes('fbcdn.net') || event.media_url.includes('cdninstagram.com')) ? `${API_BASE}/api/images/proxy?url=${encodeURIComponent(event.media_url)}` : event.media_url)}" 
                            data-original-url="${event.media_url || ''}"
                            alt="${escapeHtml(event.title)}" 
                            class="pending-event-image" 
                            onerror="
                                const img = this;
                                const originalUrl = img.getAttribute('data-original-url');
                                if (originalUrl && img.src.includes('/api/images/proxy')) {
                                    console.log('⚠️ Proxy falhou (pendente), tentando URL original:', originalUrl.substring(0, 80));
                                    img.src = originalUrl;
                                    img.onerror = function() { this.style.display='none'; };
                                } else {
                                    this.style.display='none';
                                }
                            "
                            onload="console.log('✅ Imagem pendente carregada');"
                        >
                    ` : ''}
                    <div class="pending-event-content">
                        <h3 class="pending-event-title">${escapeHtml(event.title || generateEventTitle(event))}</h3>
                        <div class="pending-event-info">
                            <p><strong>Motivo:</strong> ${reason}</p>
                            <p><strong>Data detectada:</strong> ${dateStr}</p>
                            <p><strong>Local:</strong> ${escapeHtml(locationStr)}</p>
                            <p><strong>Legenda original:</strong> ${escapeHtml(event.original_caption || 'N/A').substring(0, 100)}...</p>
                        </div>
                        <div class="pending-event-actions">
                            <button class="btn btn-primary" onclick="approveEvent('${event.id}')">✅ Aprovar</button>
                            <button class="btn btn-secondary" onclick="editEventDate('${event.id}', '${event.date || ''}')">✏️ Editar Data</button>
                            <button class="btn btn-danger" onclick="rejectEvent('${event.id}')">❌ Rejeitar</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h3>Erro</h3><p>${error.message}</p></div>`;
    }
}

// Atualizar contador de pendentes
async function updatePendingCount() {
    try {
        const response = await fetch(`${API_BASE}/events/pending`);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const count = data.events?.length || 0;
        const countElement = document.getElementById('pending-count');
        
        if (countElement) {
            countElement.textContent = count > 0 ? `${count} evento(s) aguardando aprovação` : 'Nenhum evento pendente';
        }
    } catch (error) {
        console.error('Erro ao atualizar contador:', error);
        const countElement = document.getElementById('pending-count');
        if (countElement) {
            countElement.textContent = 'Erro ao carregar';
        }
    }
}

// Aprovar evento
async function approveEvent(eventId) {
    if (!isAdminLoggedIn) {
        alert('⚠️ Você precisa estar logado como administrador!');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}/approve`, {
            method: 'POST'
        });
        
        if (response.ok) {
            alert('✅ Evento aprovado com sucesso!');
            await loadPendingEvents();
            loadEvents(); // Recarrega eventos principais
            updatePendingCount();
        } else {
            const data = await response.json();
            alert(`❌ Erro: ${data.error || 'Erro ao aprovar evento'}`);
        }
    } catch (error) {
        alert(`❌ Erro: ${error.message}`);
    }
}

// Rejeitar evento
async function rejectEvent(eventId) {
    if (!isAdminLoggedIn) {
        alert('⚠️ Você precisa estar logado como administrador!');
        return;
    }
    
    if (!confirm('Tem certeza que deseja rejeitar este evento?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}/reject`, {
            method: 'POST'
        });
        
        if (response.ok) {
            alert('✅ Evento rejeitado');
            await loadPendingEvents();
            updatePendingCount();
        } else {
            const data = await response.json();
            alert(`❌ Erro: ${data.error || 'Erro ao rejeitar evento'}`);
        }
    } catch (error) {
        alert(`❌ Erro: ${error.message}`);
    }
}

// Editar data do evento
async function editEventDate(eventId, currentDate) {
    if (!isAdminLoggedIn) {
        alert('⚠️ Você precisa estar logado como administrador!');
        return;
    }
    
    const newDate = prompt('Digite a nova data e hora (formato: YYYY-MM-DDTHH:mm):', currentDate || '');
    
    if (!newDate) return;
    
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                date: newDate,
                status: 'approved' // Aprova automaticamente após editar data
            })
        });
        
        if (response.ok) {
            alert('✅ Data atualizada e evento aprovado!');
            await loadPendingEvents();
            loadEvents();
            updatePendingCount();
        } else {
            const data = await response.json();
            alert(`❌ Erro: ${data.error || 'Erro ao atualizar data'}`);
        }
    } catch (error) {
        alert(`❌ Erro: ${error.message}`);
    }
}

// Alternar destaque de evento
async function toggleEventFeatured(eventId, currentFeatured) {
    if (!isAdminLoggedIn) {
        alert('⚠️ Você precisa estar logado como administrador!');
        return;
    }
    
    const newFeatured = !currentFeatured;
    
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                featured: newFeatured
            })
        });
        
        if (response.ok) {
            alert(newFeatured ? '✅ Evento marcado como destaque!' : '✅ Destaque removido do evento!');
            loadEvents(); // Recarrega para atualizar a visualização
        } else {
            const data = await response.json();
            alert(`❌ Erro: ${data.error || 'Erro ao atualizar destaque'}`);
        }
    } catch (error) {
        alert(`❌ Erro: ${error.message}`);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    checkAdminSession();
    loadEvents();
    loadProfilesForFilter(); // Carrega perfis para filtros
    loadProfiles(); // Carrega perfis para lista administrativa
    updatePendingCount(); // Atualiza contador de pendentes
    loadEventFromURL(); // Carrega evento da URL se houver
    // Atualiza contador a cada 30 segundos
    setInterval(updatePendingCount, 30000);
    
    // Registra Service Worker para PWA
    registerServiceWorker();
    
    // Verifica status das notificações
    setTimeout(checkNotificationStatus, 1000);
    
    // Mostra aviso sobre sistema automático (se não foi desabilitado)
    showSystemWarning();
});

// Registrar Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('✅ Service Worker registrado:', registration.scope);
            
            // Verifica se há atualização do service worker
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Novo service worker disponível
                        console.log('🔄 Nova versão do app disponível!');
                    }
                });
            });
            
            // Solicita permissão de notificações após registro
            requestNotificationPermission();
        } catch (error) {
            console.error('❌ Erro ao registrar Service Worker:', error);
        }
    } else {
        console.warn('⚠️ Service Worker não suportado neste navegador');
    }
}

// Solicitar permissão de notificações
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('⚠️ Notificações não suportadas neste navegador');
        return;
    }

    // Verifica se já tem permissão
    if (Notification.permission === 'granted') {
        console.log('✅ Permissão de notificações já concedida');
        await subscribeToPushNotifications();
        return;
    }

    // Se ainda não perguntou, mostra botão para solicitar
    if (Notification.permission === 'default') {
        // Não solicita automaticamente, apenas quando o usuário clicar
        showNotificationPrompt();
    }
}

// Mostrar prompt para solicitar notificações
function showNotificationPrompt() {
    // Verifica se já mostrou o prompt antes
    const promptShown = localStorage.getItem('notification-prompt-shown');
    if (promptShown === 'true') {
        return; // Já mostrou, não mostra novamente
    }

    // Cria banner para solicitar notificações (opcional, pode ser removido)
    // Por enquanto, apenas salva que pode solicitar quando necessário
}

// Solicitar permissão de notificações (chamado pelo usuário)
async function enableNotifications() {
    const statusEl = document.getElementById('notification-status');
    const buttonEl = document.getElementById('enable-notifications-btn');
    
    if (!('Notification' in window)) {
        if (statusEl) statusEl.textContent = '⚠️ Seu navegador não suporta notificações';
        alert('⚠️ Seu navegador não suporta notificações');
        return;
    }

    if (!('serviceWorker' in navigator)) {
        if (statusEl) statusEl.textContent = '⚠️ Service Worker não suportado';
        alert('⚠️ Seu navegador não suporta notificações push');
        return;
    }

    try {
        if (buttonEl) {
            buttonEl.disabled = true;
            buttonEl.textContent = '⏳ Ativando...';
        }

        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log('✅ Permissão de notificações concedida');
            await subscribeToPushNotifications();
            
            if (statusEl) {
                statusEl.textContent = '✅ Notificações ativadas! Você receberá avisos sobre novos eventos.';
                statusEl.style.color = 'var(--color-accent)';
            }
            
            if (buttonEl) {
                buttonEl.textContent = '✅ Notificações Ativadas';
                buttonEl.disabled = true;
                buttonEl.style.background = 'var(--color-bg-secondary)';
            }
            
            localStorage.setItem('notification-prompt-shown', 'true');
        } else if (permission === 'denied') {
            if (statusEl) {
                statusEl.textContent = '❌ Permissão negada. Ative nas configurações do navegador.';
                statusEl.style.color = '#e94560';
            }
            if (buttonEl) {
                buttonEl.disabled = false;
                buttonEl.textContent = '🔔 Ativar Notificações';
            }
            alert('❌ Permissão de notificações negada. Você pode ativar nas configurações do navegador.');
        } else {
            if (statusEl) {
                statusEl.textContent = 'ℹ️ Permissão não concedida';
            }
            if (buttonEl) {
                buttonEl.disabled = false;
                buttonEl.textContent = '🔔 Ativar Notificações';
            }
            console.log('ℹ️ Permissão de notificações não concedida');
        }
    } catch (error) {
        console.error('Erro ao solicitar permissão:', error);
        if (statusEl) {
            statusEl.textContent = '❌ Erro ao ativar notificações';
            statusEl.style.color = '#e94560';
        }
        if (buttonEl) {
            buttonEl.disabled = false;
            buttonEl.textContent = '🔔 Ativar Notificações';
        }
        alert('❌ Erro ao ativar notificações');
    }
}

// Verifica status das notificações ao carregar
function checkNotificationStatus() {
    if (!('Notification' in window)) return;
    
    const statusEl = document.getElementById('notification-status');
    const buttonEl = document.getElementById('enable-notifications-btn');
    
    if (Notification.permission === 'granted') {
        if (statusEl) {
            statusEl.textContent = '✅ Notificações ativadas';
            statusEl.style.color = 'var(--color-accent)';
        }
        if (buttonEl) {
            buttonEl.textContent = '✅ Notificações Ativadas';
            buttonEl.disabled = true;
            buttonEl.style.background = 'var(--color-bg-secondary)';
        }
    } else if (Notification.permission === 'denied') {
        if (statusEl) {
            statusEl.textContent = '❌ Notificações bloqueadas';
            statusEl.style.color = '#e94560';
        }
        if (buttonEl) {
            buttonEl.disabled = true;
            buttonEl.textContent = '🔔 Notificações Bloqueadas';
        }
    }
}

// Inscrever em notificações push
async function subscribeToPushNotifications() {
    if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Worker não disponível');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        
        // Verifica se já está inscrito
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
            console.log('✅ Já inscrito em notificações push');
            // Envia subscription para o servidor
            await sendSubscriptionToServer(existingSubscription);
            return;
        }

        // Obtém VAPID public key do servidor
        const response = await fetch(`${API_BASE}/notifications/vapid-public-key`);
        const data = await response.json();
        
        if (!data.publicKey) {
            console.error('❌ VAPID public key não disponível');
            return;
        }

        // Converte VAPID key para formato Uint8Array
        const publicKey = urlBase64ToUint8Array(data.publicKey);

        // Cria subscription
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey
        });

        console.log('✅ Inscrito em notificações push');
        
        // Envia subscription para o servidor
        await sendSubscriptionToServer(subscription);
        
    } catch (error) {
        console.error('❌ Erro ao inscrever em notificações push:', error);
    }
}

// Enviar subscription para o servidor
async function sendSubscriptionToServer(subscription) {
    try {
        const response = await fetch(`${API_BASE}/notifications/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription)
        });

        if (response.ok) {
            console.log('✅ Subscription enviada para o servidor');
        } else {
            console.error('❌ Erro ao enviar subscription:', response.statusText);
        }
    } catch (error) {
        console.error('❌ Erro ao enviar subscription:', error);
    }
}

// Converter VAPID key de base64 para Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Mostrar aviso sobre sistema automático
function showSystemWarning() {
    // Verifica se o usuário optou por não mostrar novamente
    const dontShow = localStorage.getItem('dontShowSystemWarning');
    if (dontShow === 'true') {
        return;
    }
    
    // Mostra o modal após um pequeno delay
    setTimeout(() => {
        const modal = document.getElementById('system-warning-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }, 1000); // 1 segundo após carregar a página
}

// Fechar aviso do sistema
function closeSystemWarning() {
    const modal = document.getElementById('system-warning-modal');
    const checkbox = document.getElementById('dont-show-warning');
    
    if (modal) {
        modal.classList.remove('show');
    }
    
    // Salva preferência se marcado
    if (checkbox && checkbox.checked) {
        localStorage.setItem('dontShowSystemWarning', 'true');
    }
}

// Navegação de Tabs
function switchTab(tabName) {
    // Remove active de todos
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Ativa a tab correspondente
    if (tabName === 'events') {
        document.getElementById('events-tab').classList.add('active');
        document.querySelector('[data-tab="events"]')?.classList.add('active');
        loadEvents();
    } else if (tabName === 'profile') {
        document.getElementById('profiles-tab').classList.add('active');
        loadProfiles();
    } else if (tabName === 'explore' || tabName === 'tickets') {
        // Placeholder para futuras implementações
        alert('Funcionalidade em desenvolvimento!');
    }
}

// Abrir/Fechar Busca
function openSearch() {
    document.getElementById('search-bar').style.display = 'block';
    document.getElementById('search-input').focus();
}

function closeSearch() {
    document.getElementById('search-bar').style.display = 'none';
    searchTerm = '';
    document.getElementById('search-input').value = '';
    renderEvents();
}

// Menu Admin
function toggleAdminMenu() {
    // Verifica se está logado como admin
    if (!isAdminLoggedIn) {
        // Mostra modal de login
        document.getElementById('admin-login-modal').classList.add('show');
    } else {
        // Mostra menu admin
        document.getElementById('admin-menu-modal').classList.add('show');
    }
}

function closeAdminMenu() {
    document.getElementById('admin-menu-modal').classList.remove('show');
}

// Login Admin
function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value;
    
    // Verifica credenciais (em produção, fazer requisição ao backend)
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isAdminLoggedIn = true;
        // Salva no sessionStorage
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminLoginTime', Date.now().toString());
        
        // Fecha modal de login e abre menu admin
        closeModal('admin-login-modal');
        document.getElementById('admin-login-form').reset();
        
        // Mostra menu admin
        document.getElementById('admin-menu-modal').classList.add('show');
        
        // Atualiza ícone do header (opcional)
        updateAdminIcon();
    } else {
        alert('❌ Credenciais inválidas!');
    }
}

// Logout Admin
function logoutAdmin() {
    isAdminLoggedIn = false;
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminLoginTime');
    closeAdminMenu();
    updateAdminIcon();
    
    // Se estiver em uma tab admin, volta para eventos
    if (document.getElementById('profiles-tab').classList.contains('active') || 
        document.getElementById('sync-tab').classList.contains('active')) {
        switchTab('events');
    }
    
    alert('✅ Sessão administrativa encerrada');
}

// Verificar se está logado ao carregar
function checkAdminSession() {
    const loggedIn = sessionStorage.getItem('adminLoggedIn');
    const loginTime = sessionStorage.getItem('adminLoginTime');
    
    if (loggedIn === 'true' && loginTime) {
        // Verifica se a sessão não expirou (24 horas)
        const now = Date.now();
        const sessionTime = parseInt(loginTime);
        const hoursSinceLogin = (now - sessionTime) / (1000 * 60 * 60);
        
        if (hoursSinceLogin < 24) {
            isAdminLoggedIn = true;
            updateAdminIcon();
        } else {
            // Sessão expirada
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminLoginTime');
        }
    }
}

// Atualizar ícone do admin no header
function updateAdminIcon() {
    const adminBtn = document.querySelector('.icon-btn[onclick="toggleAdminMenu()"]');
    if (adminBtn) {
        if (isAdminLoggedIn) {
            adminBtn.style.color = 'var(--color-accent)';
            adminBtn.title = 'Área Administrativa (Logado)';
        } else {
            adminBtn.style.color = '';
            adminBtn.title = 'Área Administrativa';
        }
    }
}

// Alternar para tab administrativa
function switchToAdminTab(tabName) {
    // Verifica se está logado
    if (!isAdminLoggedIn) {
        alert('⚠️ Você precisa estar logado como administrador para acessar esta área!');
        toggleAdminMenu();
        return;
    }
    
    closeAdminMenu();
    
    // Remove active de todos
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Ativa a tab administrativa
    if (tabName === 'profiles') {
        document.getElementById('profiles-tab').classList.add('active');
        loadProfiles();
    } else if (tabName === 'sync') {
        document.getElementById('sync-tab').classList.add('active');
    }
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Abrir Perfil/Login
function openProfile() {
    // Verificar se usuário está logado (futuro)
    // Por enquanto, sempre mostra login
    document.getElementById('login-modal').classList.add('show');
}

// Login
function handleLogin(e) {
    e.preventDefault();
    // Placeholder - implementar autenticação futuramente
    alert('Sistema de login em desenvolvimento!');
    closeModal('login-modal');
}

function loginWithGoogle() {
    // Placeholder
    alert('Login com Google em desenvolvimento!');
}

function loginWithFacebook() {
    // Placeholder
    alert('Login com Facebook em desenvolvimento!');
}

function showRegister() {
    // Placeholder
    alert('Cadastro em desenvolvimento!');
}

// Carregar Eventos
async function loadEvents() {
    const container = document.getElementById('events-list');
    const featuredContainer = document.getElementById('featured-events');
    const upcomingContainer = document.getElementById('upcoming-events');

    container.innerHTML = generateEventSkeletons(6);
    featuredContainer.innerHTML = generateFeaturedSkeletons(3);
    upcomingContainer.innerHTML = generateUpcomingSkeletons(4);

    try {
        // Carrega perfis para filtros se ainda não foram carregados
        if (allProfiles.length === 0) {
            await loadProfilesForFilter();
        }

        // Busca todos os eventos (sem limite de paginação do backend)
        // Usa status=all para garantir que todos os eventos sejam retornados
        // Aumenta o limite para buscar todos os eventos de uma vez (1000 é o máximo do Supabase)
        const response = await fetch(`${API_BASE}/events?status=all&limit=1000`);
        const data = await response.json();

        if (!data.events || data.events.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhum evento encontrado</h3>
                    <p>Cadastre perfis do Instagram ou crie eventos manualmente</p>
                </div>
            `;
            return;
        }

        allEvents = data.events;
        console.log(`📊 Total de eventos recebidos do backend: ${allEvents.length}`);
        console.log(`📊 Total no pagination: ${data.pagination?.total || 'N/A'}`);
        renderEvents();
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar eventos</h3><p>${error.message}</p></div>`;
    }
}

// Renderizar eventos com filtros
function renderEvents() {
    console.log(`🔍 Renderizando eventos. Total antes dos filtros: ${allEvents.length}`);
    let filteredEvents = [...allEvents];

    // Aplica filtro de categoria
    if (activeFilters.category !== 'all') {
        const categoryKeywords = {
            'baladas': ['balada', 'festa', 'dj', 'música', 'samba', 'forró'],
            'barzinhos': ['bar', 'happy hour', 'chopp', 'cerveja', 'restaurante', 'cultura'],
            'catolicos': ['católico', 'igreja', 'missa', 'religioso', 'cristão', 'santa'],
            'gastronomia': ['comida', 'restaurante', 'culinária', 'gastronomia', 'chef']
        };

        const keywords = categoryKeywords[activeFilters.category] || [];
        filteredEvents = filteredEvents.filter(event => {
            const searchableText = (event.title + ' ' + event.description).toLowerCase();
            return keywords.some(keyword => searchableText.includes(keyword));
        });
    }

    // Filtro por Instagram
    if (activeFilters.instagram) {
        filteredEvents = filteredEvents.filter(event => 
            event.profile_id === activeFilters.instagram
        );
    }

    // Filtro por tipo
    if (activeFilters.type) {
        filteredEvents = filteredEvents.filter(event => 
            event.type === activeFilters.type
        );
    }

    // Filtro por período
    if (activeFilters.period) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        filteredEvents = filteredEvents.filter(event => {
            if (!event.date) return false;
            const eventDate = new Date(event.date);
            
            switch (activeFilters.period) {
                case 'today':
                    return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
                case 'week':
                    return eventDate >= weekStart;
                case 'month':
                    return eventDate >= monthStart;
                case 'future':
                    return eventDate >= now;
                default:
                    return true;
            }
        });
    }

    // Filtro por busca
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredEvents = filteredEvents.filter(event => {
            const searchableText = (event.title + ' ' + event.description + ' ' + (event.location || '') + ' ' + (event.profile?.username || '')).toLowerCase();
            return searchableText.includes(searchLower);
        });
    }

    console.log(`🔍 Total após filtros: ${filteredEvents.length}`);

    if (filteredEvents.length === 0) {
        document.getElementById('events-list').innerHTML = `
            <div class="empty-state">
                <h3>Nenhum evento encontrado</h3>
                <p>Tente ajustar os filtros ou a busca</p>
            </div>
        `;
        return;
    }

    // Eventos em foco: primeiro os marcados como featured, depois os últimos publicados no Instagram
    const featuredEvents = filteredEvents
        .filter(e => e.featured === true)
        .sort((a, b) => {
            // Ordena por published_at (data de publicação no Instagram), senão por date, senão por created_at
            const dateA = a.published_at ? new Date(a.published_at).getTime() : 
                         (a.date ? new Date(a.date).getTime() : new Date(a.created_at).getTime());
            const dateB = b.published_at ? new Date(b.published_at).getTime() : 
                         (b.date ? new Date(b.date).getTime() : new Date(b.created_at).getTime());
            return dateB - dateA; // Mais recentes primeiro
        });
    
    // Se não houver eventos em destaque, pega os últimos 4 publicados no Instagram
    const latestEvents = filteredEvents
        .filter(e => !e.featured)
        .sort((a, b) => {
            const dateA = a.published_at ? new Date(a.published_at).getTime() : 
                         (a.date ? new Date(a.date).getTime() : new Date(a.created_at).getTime());
            const dateB = b.published_at ? new Date(b.published_at).getTime() : 
                         (b.date ? new Date(b.date).getTime() : new Date(b.created_at).getTime());
            return dateB - dateA;
        })
        .slice(0, 4 - featuredEvents.length);
    
    const eventsToShow = [...featuredEvents, ...latestEvents].slice(0, 4);
    
    if (eventsToShow.length > 0) {
        renderFeaturedEvents(eventsToShow);
        // Inicializa controles do carrossel após renderizar
        setTimeout(() => initCarousel('featured-events'), 100);
    }

    // Próximos eventos (excluindo os em foco) - eventos com data futura
    const upcomingEvents = filteredEvents
        .filter(e => !eventsToShow.find(f => f.id === e.id))
        .filter(e => e.date && new Date(e.date) >= new Date())
        .sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateA - dateB; // Mais próximos primeiro
        })
        .slice(0, 4);
    
    if (upcomingEvents.length > 0) {
        renderUpcomingEvents(upcomingEvents);
    }

    // Todos os outros eventos
    const otherEvents = filteredEvents
        .filter(e => !eventsToShow.find(f => f.id === e.id) && !upcomingEvents.find(u => u.id === e.id));
    
    renderEventsGrid(otherEvents);
}

// Renderizar eventos em foco (carrossel) - formato Instagram
function renderFeaturedEvents(events) {
    const container = document.getElementById('featured-events');
    
    container.innerHTML = events.map(event => {
        const dateStr = event.date ? formatDateShort(event.date) : formatDateShort(event.created_at);
        const locationStr = event.location || '';
        const cleanLocation = locationStr.replace(/Batatais-SP/gi, '').replace(/Batatais/gi, '').trim().replace(/^,\s*/, '');
        const username = event.profile?.username || 'batataistem';
        const profileInitials = username.substring(0, 2).toUpperCase();
        
        return `
            <div class="featured-event-card" onclick="showEventDetails('${event.id}')">
                ${event.media_url ? `
                    <img 
                        src="${(event.media_url.includes('instagram') || event.media_url.includes('fbcdn.net') || event.media_url.includes('cdninstagram.com')) ? `${API_BASE}/api/images/proxy?url=${encodeURIComponent(event.media_url)}` : event.media_url}" 
                        data-original-url="${event.media_url || ''}"
                        alt="${escapeHtml(event.title)}" 
                        class="featured-event-image" 
                        loading="lazy" 
                        onerror="
                            const img = this;
                            const originalUrl = img.getAttribute('data-original-url');
                            if (originalUrl && img.src.includes('/api/images/proxy')) {
                                console.log('⚠️ Proxy falhou (featured), tentando URL original:', originalUrl.substring(0, 80));
                                img.src = originalUrl;
                                img.onerror = function() { this.style.display='none'; };
                            } else {
                                this.style.display='none';
                            }
                        "
                        onload="console.log('✅ Imagem featured carregada:', this.src.substring(0, 80));"
                    >
                ` : ''}
                <div class="featured-event-content">
                    <h3 class="featured-event-title">${escapeHtml(event.title || generateEventTitle(event))}</h3>
                    ${cleanLocation ? `<div class="featured-event-location">📍 ${escapeHtml(cleanLocation)}</div>` : ''}
                    <button class="featured-event-cta" onclick="event.stopPropagation(); showEventDetails('${event.id}')">Ver Detalhes →</button>
                </div>
            </div>
        `;
    }).join('');
}

// Renderizar próximos eventos
function renderUpcomingEvents(events) {
    const container = document.getElementById('upcoming-events');
    
    container.innerHTML = events.map(event => {
        const dateStr = event.date ? formatDateShort(event.date) : formatDateShort(event.created_at);
        let locationStr = event.location || '';
        if (locationStr) {
            locationStr = locationStr.replace(/Batatais-SP/gi, '').replace(/Batatais/gi, '').trim();
            locationStr = locationStr.replace(/^,\s*/, '').replace(/\s*,\s*$/, '');
        }
        
        return `
            <div class="upcoming-event-item" onclick="showEventDetails('${event.id}')">
                <div class="upcoming-event-date">${dateStr}</div>
                <div class="upcoming-event-info">
                    <div class="upcoming-event-title">${escapeHtml(event.title || generateEventTitle(event))}</div>
                    ${locationStr ? `<div class="upcoming-event-location">📍 ${escapeHtml(locationStr)}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Renderizar grade de eventos com paginação
function renderEventsGrid(events) {
    const container = document.getElementById('events-list');
    
    if (events.length === 0) {
        container.innerHTML = '<p class="loading">Nenhum evento adicional para exibir</p>';
        // Remove paginação se não houver eventos
        const paginationContainer = document.getElementById('events-pagination');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        return;
    }

    // Calcula paginação
    const totalPages = Math.ceil(events.length / EVENTS_PER_PAGE);
    
    // Ajusta página atual se necessário
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }

    // Pega eventos da página atual
    const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
    const endIndex = startIndex + EVENTS_PER_PAGE;
    const eventsToShow = events.slice(startIndex, endIndex);

    // Renderiza eventos
    const eventsHTML = eventsToShow.map(event => {
        const dateStr = event.date ? formatDateShort(event.date) : formatDateShort(event.created_at);
        const locationStr = event.location || '';
        const cleanLocation = locationStr.replace(/Batatais-SP/gi, '').replace(/Batatais/gi, '').trim().replace(/^,\s*/, '');
        const tags = extractTags(event.description);
        
        // Função para obter URL da imagem usando proxy se necessário
        const getImageUrl = (url) => {
            if (!url) return null;
            // Se for URL do Supabase Storage, usa diretamente (não precisa de proxy)
            if (url.includes('supabase.co/storage')) {
                return url;
            }
            // Se for URL do Instagram, usa proxy para evitar CORS
            if (url.includes('instagram') || url.includes('fbcdn.net') || url.includes('cdninstagram.com')) {
                return `${API_BASE}/api/images/proxy?url=${encodeURIComponent(url)}`;
            }
            return url;
        };
        
        const imageUrl = getImageUrl(event.media_url);
        const originalUrl = event.media_url; // URL original para fallback
        
        return `
            <div class="event-card" onclick="showEventDetails('${event.id}')">
                <div class="event-card-image-wrapper">
                    ${imageUrl ? `
                        <img 
                            src="${imageUrl}" 
                            data-original-url="${originalUrl || ''}"
                            alt="${escapeHtml(event.title)}" 
                            class="event-card-image" 
                            loading="lazy" 
                            onerror="
                                const img = this;
                                const originalUrl = img.getAttribute('data-original-url');
                                if (originalUrl && img.src.includes('/api/images/proxy')) {
                                    console.log('⚠️ Proxy falhou, tentando URL original:', originalUrl.substring(0, 80));
                                    img.src = originalUrl;
                                    img.onerror = function() {
                                        this.style.display='none';
                                        this.parentElement.innerHTML='<div style=\\'padding:2rem;text-align:center;color:var(--color-text-secondary);\\'>Imagem não disponível</div>';
                                    };
                                } else {
                                    this.style.display='none';
                                    this.parentElement.innerHTML='<div style=\\'padding:2rem;text-align:center;color:var(--color-text-secondary);\\'>Imagem não disponível</div>';
                                }
                            "
                            onload="console.log('✅ Imagem carregada:', this.src.substring(0, 80));"
                        >
                    ` : '<div style="padding:2rem;text-align:center;color:var(--color-text-secondary);">Sem imagem</div>'}
                </div>
                <div class="event-card-content">
                    <h3 class="event-card-title">${escapeHtml(event.title || generateEventTitle(event))}</h3>
                    ${cleanLocation ? `<div class="event-card-location">📍 ${escapeHtml(cleanLocation)}</div>` : ''}
                    ${tags.length > 0 ? `
                        <div class="event-card-tags">
                            ${tags.map(tag => `<span class="event-card-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class="event-card-cta">
                        <button class="btn-details" onclick="event.stopPropagation(); showEventDetails('${event.id}')">Ver Detalhes →</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = eventsHTML;

    // Renderiza controles de paginação
    renderPagination(totalPages, events.length);
}

// Renderizar controles de paginação
function renderPagination(totalPages, totalEvents) {
    const paginationContainer = document.getElementById('events-pagination');
    if (!paginationContainer) {
        return;
    }

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '<div class="pagination">';
    
    // Botão Anterior
    paginationHTML += `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="goToPage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Anterior
        </button>
    `;

    // Números de página
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Primeira página se não estiver visível
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    // Páginas visíveis
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }

    // Última página se não estiver visível
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    // Botão Próximo
    paginationHTML += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="goToPage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            Próximo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>
    `;

    // Informação de resultados
    const startEvent = (currentPage - 1) * EVENTS_PER_PAGE + 1;
    const endEvent = Math.min(currentPage * EVENTS_PER_PAGE, totalEvents);
    paginationHTML += `
        <div class="pagination-info">
            Mostrando ${startEvent}-${endEvent} de ${totalEvents} eventos
        </div>
    `;

    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// Navegar para página específica
function goToPage(page) {
    if (page < 1) return;
    
    currentPage = page;
    
    // Re-renderiza os eventos (mantém os filtros)
    renderEvents();
    
    // Scroll suave para o topo da lista de eventos
    const eventsSection = document.querySelector('.all-events-section');
    if (eventsSection) {
        eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Extrair tags da descrição
function extractTags(description) {
    if (!description) return [];
    
    const tags = [];
    const text = description.toLowerCase();
    
    if (text.includes('música') || text.includes('ao vivo') || text.includes('show')) {
        tags.push('🎵 Música');
    }
    if (text.includes('chopp') || text.includes('cerveja') || text.includes('happy hour')) {
        tags.push('🍻 Happy Hour');
    }
    if (text.includes('samba') || text.includes('forró') || text.includes('pagode')) {
        tags.push('🎶 Samba');
    }
    if (text.includes('balada') || text.includes('festa')) {
        tags.push('🎉 Festa');
    }
    if (text.includes('católico') || text.includes('igreja') || text.includes('missa')) {
        tags.push('⛪ Religioso');
    }
    
    return tags.slice(0, 3);
}

// Filtro por categoria
function filterByCategory(category) {
    activeFilters.category = category;
    
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
        if (chip.dataset.category === category) {
            chip.classList.add('active');
        }
    });
    
    // Reset para primeira página ao filtrar
    currentPage = 1;
    renderEvents();
}

// Aplicar filtros avançados
function applyFilters() {
    activeFilters.instagram = document.getElementById('filter-instagram').value;
    activeFilters.type = document.getElementById('filter-type').value;
    activeFilters.period = document.getElementById('filter-period').value;
    
    // Reset para primeira página ao aplicar filtros
    currentPage = 1;
    renderEvents();
}

// Limpar filtros
function clearFilters() {
    activeFilters = {
        instagram: '',
        type: '',
        period: '',
        category: 'all'
    };
    
    document.getElementById('filter-instagram').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-period').value = '';
    
    // Reset para primeira página
    currentPage = 1;
    filterByCategory('all');
}

// Toggle painel de filtros
function toggleFilters() {
    const content = document.getElementById('filters-content');
    const icon = document.querySelector('.filter-toggle-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▲';
    } else {
        content.style.display = 'none';
        icon.textContent = '▼';
    }
}

// Busca
function handleSearch() {
    const input = document.getElementById('search-input');
    searchTerm = input.value.trim();
    // Reset para primeira página ao buscar
    currentPage = 1;
    renderEvents();
}

// Carregar Perfis para o filtro e lista administrativa
async function loadProfilesForFilter() {
    try {
        const response = await fetch(`${API_BASE}/profiles`);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();

        if (!data.profiles || data.profiles.length === 0) {
            // Se não houver perfis, limpa o select
            const filterSelect = document.getElementById('filter-instagram');
            if (filterSelect) {
                filterSelect.innerHTML = '<option value="">Todos os perfis</option>';
            }
            console.log('ℹ️  Nenhum perfil encontrado para filtros');
            return;
        }

        // Salva perfis globalmente
        allProfiles = data.profiles;
        console.log(`✅ ${data.profiles.length} perfil(is) carregado(s) para filtros`);

        // Popula o select de filtros
        const filterSelect = document.getElementById('filter-instagram');
        if (filterSelect) {
            // Salva o valor atual se houver
            const currentValue = filterSelect.value;
            
            filterSelect.innerHTML = '<option value="">Todos os perfis</option>';
            data.profiles.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile.id;
                option.textContent = `@${escapeHtml(profile.username)}`;
                filterSelect.appendChild(option);
            });
            
            // Restaura o valor anterior se ainda existir
            if (currentValue) {
                const optionExists = Array.from(filterSelect.options).some(opt => opt.value === currentValue);
                if (optionExists) {
                    filterSelect.value = currentValue;
                }
            }
        } else {
            console.warn('⚠️  Select de filtros não encontrado');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar perfis para filtro:', error);
        const filterSelect = document.getElementById('filter-instagram');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">Erro ao carregar perfis</option>';
        }
    }
}

// Carregar Perfis (para lista administrativa)
async function loadProfiles() {
    const container = document.getElementById('profiles-list');

    if (!container) {
        // Se não estiver na tab de perfis, apenas carrega para filtros
        await loadProfilesForFilter();
        return;
    }

    // Mostra skeletons apenas se estiver na tab de perfis
    if (document.getElementById('profiles-tab')?.classList.contains('active')) {
        container.innerHTML = generateProfileSkeletons(3);
    }

    try {
        const response = await fetch(`${API_BASE}/profiles`);
        const data = await response.json();

        if (!data.profiles || data.profiles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhum perfil cadastrado</h3>
                    <p>Cadastre perfis do Instagram para começar o monitoramento</p>
                </div>
            `;
            // Ainda assim, tenta carregar para filtros
            await loadProfilesForFilter();
            return;
        }

        // Salva perfis globalmente
        allProfiles = data.profiles;

        // Popula o select de filtros
        await loadProfilesForFilter();

        // Renderiza a lista administrativa
        container.innerHTML = data.profiles.map(profile => `
            <div class="card">
                <div class="card-title">@${escapeHtml(profile.username)}</div>
                <div class="card-meta">
                    <span>🆔 ID: ${escapeHtml(profile.instagram_id)}</span>
                    <span>🔗 <a href="${escapeHtml(profile.url)}" target="_blank" style="color: var(--color-accent);">${escapeHtml(profile.url)}</a></span>
                    <span>📊 Eventos: ${profile._count?.events || 0}</span>
                    <span>🕒 Cadastrado em ${formatDate(profile.created_at)}</span>
                </div>
                <div style="margin-top: var(--spacing-md);">
                    <button class="btn btn-primary" onclick="deleteProfile('${profile.id}')">Deletar</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar perfis</h3><p>${error.message}</p></div>`;
        // Tenta carregar para filtros mesmo com erro
        await loadProfilesForFilter();
    }
}

// Criar Evento
async function createEvent(e) {
    e.preventDefault();

    const eventData = {
        title: document.getElementById('event-title').value,
        description: document.getElementById('event-description').value,
        date: document.getElementById('event-date').value || null,
        location: document.getElementById('event-location').value || null,
        media_url: document.getElementById('event-media-url').value || null,
        source_url: document.getElementById('event-source-url').value || null
    };

    try {
        const response = await fetch(`${API_BASE}/events/manual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ Evento criado com sucesso!');
            closeModal('event-modal');
            document.getElementById('event-form').reset();
            loadEvents();
        } else {
            alert(`❌ Erro: ${data.error || 'Erro ao criar evento'}`);
        }
    } catch (error) {
        alert(`❌ Erro: ${error.message}`);
    }
}

// Buscar Instagram ID
async function findInstagramId() {
    const username = document.getElementById('profile-username').value.trim();
    const resultDiv = document.getElementById('id-search-result');
    
    if (!username) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<span style="color: var(--color-accent);">⚠️ Digite o username primeiro</span>';
        return;
    }

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<span style="color: var(--color-text-primary);">⏳ Buscando ID...</span>';

    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.instagram.com/${username}/`)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        const html = data.contents;
        const idMatch = html.match(/"id":"(\d+)"/);
        
        if (idMatch && idMatch[1]) {
            const instagramId = idMatch[1];
            document.getElementById('profile-instagram-id').value = instagramId;
            resultDiv.innerHTML = `<span style="color: #4ade80;">✅ ID encontrado: ${instagramId}</span>`;
        } else {
            throw new Error('ID não encontrado');
        }
    } catch (error) {
        resultDiv.innerHTML = `
            <span style="color: var(--color-accent);">
                ⚠️ Não foi possível buscar automaticamente.<br>
                <small>Use uma ferramenta online: <a href="https://codeofaninja.com/tools/find-instagram-user-id/" target="_blank" style="color: var(--color-accent);">Buscar ID aqui</a></small>
            </span>
        `;
    }
}

// Criar Perfil
async function createProfile(e) {
    e.preventDefault();
    
    // Verifica se está logado
    if (!isAdminLoggedIn) {
        alert('⚠️ Você precisa estar logado como administrador para criar perfis!');
        closeModal('profile-modal');
        toggleAdminMenu();
        return;
    }

    const profileData = {
        username: document.getElementById('profile-username').value,
        instagram_id: document.getElementById('profile-instagram-id').value,
        url: document.getElementById('profile-url').value
    };

    try {
        const response = await fetch(`${API_BASE}/profiles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ Perfil cadastrado com sucesso!');
            closeModal('profile-modal');
            document.getElementById('profile-form').reset();
            loadProfiles();
        } else {
            alert(`❌ Erro: ${data.error || 'Erro ao cadastrar perfil'}`);
        }
    } catch (error) {
        alert(`❌ Erro: ${error.message}`);
    }
}

// Deletar Perfil
async function deleteProfile(id) {
    // Verifica se está logado
    if (!isAdminLoggedIn) {
        alert('⚠️ Você precisa estar logado como administrador para deletar perfis!');
        toggleAdminMenu();
        return;
    }
    
    if (!confirm('Tem certeza que deseja deletar este perfil?')) return;

    try {
        const response = await fetch(`${API_BASE}/profiles/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('✅ Perfil deletado com sucesso!');
            loadProfiles();
        } else {
            const data = await response.json();
            alert(`❌ Erro: ${data.error || 'Erro ao deletar perfil'}`);
        }
    } catch (error) {
        alert(`❌ Erro: ${error.message}`);
    }
}

// Sincronizar Perfis
async function syncProfiles() {
    // Verifica se está logado
    if (!isAdminLoggedIn) {
        alert('⚠️ Você precisa estar logado como administrador para sincronizar!');
        toggleAdminMenu();
        return;
    }
    
    const resultDiv = document.getElementById('sync-result');
    resultDiv.className = 'sync-result';
    resultDiv.innerHTML = '⏳ Sincronizando...';

    try {
        const response = await fetch(`${API_BASE}/instagram/sync`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            resultDiv.className = 'sync-result success';
            resultDiv.innerHTML = `
                <strong>✅ Sincronização concluída!</strong><br>
                Perfis processados: ${data.result.profilesProcessed}<br>
                Eventos criados: ${data.result.eventsCreated}<br>
                ${data.result.errors.length > 0 ? `Erros: ${data.result.errors.length}` : ''}
            `;
            loadEvents();
        } else {
            throw new Error(data.error || 'Erro na sincronização');
        }
    } catch (error) {
        resultDiv.className = 'sync-result error';
        resultDiv.innerHTML = `<strong>❌ Erro:</strong> ${error.message}`;
    }
}

// Modais
function showCreateEventModal() {
    // Verifica se está logado para criar eventos (opcional - pode remover se quiser que qualquer um crie)
    // if (!isAdminLoggedIn) {
    //     alert('⚠️ Você precisa estar logado como administrador para criar eventos!');
    //     toggleAdminMenu();
    //     return;
    // }
    document.getElementById('event-modal').classList.add('show');
}

function showCreateProfileModal() {
    // Verifica se está logado
    if (!isAdminLoggedIn) {
        alert('⚠️ Você precisa estar logado como administrador para criar perfis!');
        toggleAdminMenu();
        return;
    }
    document.getElementById('profile-modal').classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        // Restaura scroll do body
        document.body.style.overflow = '';
        document.body.style.position = '';
    }
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
            // Restaura scroll do body
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
    });
}

// Controle do Carrossel
function scrollCarousel(carouselId, direction) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    const cardWidth = carousel.querySelector('.featured-event-card')?.offsetWidth || 0;
    const gap = 16; // Espaçamento entre cards (var(--spacing-md))
    const scrollAmount = cardWidth + gap;
    
    carousel.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
    
    // Atualiza estado dos botões após um pequeno delay
    setTimeout(() => updateCarouselButtons(carouselId), 300);
}

function updateCarouselButtons(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    const prevBtn = carousel.parentElement?.querySelector('.carousel-prev');
    const nextBtn = carousel.parentElement?.querySelector('.carousel-next');
    
    if (!prevBtn || !nextBtn) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = carousel;
    const isAtStart = scrollLeft <= 10;
    const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 10;
    
    prevBtn.disabled = isAtStart;
    nextBtn.disabled = isAtEnd;
}

// Observa mudanças no carrossel para atualizar botões
function initCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    // Atualiza botões quando o carrossel é renderizado
    setTimeout(() => updateCarouselButtons(carouselId), 100);
    
    // Atualiza botões ao fazer scroll
    carousel.addEventListener('scroll', () => updateCarouselButtons(carouselId));
    
    // Atualiza botões ao redimensionar
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => updateCarouselButtons(carouselId), 200);
    });
}

// Utilitários
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Gerar título para evento quando não tiver título
function generateEventTitle(event) {
    if (!event) return 'Evento em Batatais-SP';
    
    // Tenta usar local primeiro
    if (event.location) {
        const location = event.location.replace(/@/g, '').replace(/_/g, ' ');
        return `Evento em ${location} - Batatais-SP`;
    }
    
    // Tenta usar perfil do Instagram
    if (event.profile?.username) {
        const username = event.profile.username.replace(/_/g, ' ');
        return `Evento em ${username} - Batatais-SP`;
    }
    
    // Tenta usar data
    if (event.date) {
        const date = new Date(event.date);
        const dateStr = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
        return `Evento em ${dateStr} - Batatais-SP`;
    }
    
    // Fallback genérico
    return 'Evento em Batatais-SP';
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateShort(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Mostrar detalhes do evento
async function showEventDetails(eventId) {
    console.log('showEventDetails chamado com ID:', eventId);
    
    if (!eventId) {
        alert('ID do evento não fornecido');
        return;
    }
    
    // Log para debug de imagens
    console.log('🔍 Buscando dados do evento para debug...');
    
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.event) {
            alert('Evento não encontrado');
            return;
        }
        
        const event = data.event;
        const dateStr = event.date ? formatDate(event.date) : 'Data não informada';
        const locationStr = event.location || 'Local não informado';
        
        // Log para debug de imagens
        console.log('📸 Dados do evento recebidos:', {
            id: event.id,
            title: event.title,
            hasMediaUrl: !!event.media_url,
            mediaUrlLength: event.media_url?.length || 0,
            mediaUrlPreview: event.media_url ? event.media_url.substring(0, 150) + '...' : 'N/A',
            mediaUrlComplete: event.media_url ? (event.media_url.length > 200 ? 'Sim' : 'Pode estar truncada') : 'N/A',
            mediaUrlStartsWith: event.media_url ? event.media_url.substring(0, 50) : 'N/A'
        });
        
        const username = event.profile?.username || 'batataistem';
        const profileInitials = username.substring(0, 2).toUpperCase();
        
        // Função para obter URL da imagem usando proxy se necessário
        const getImageUrlForDetails = (url) => {
            if (!url) return null;
            // Se for URL do Supabase Storage, usa diretamente (não precisa de proxy)
            if (url.includes('supabase.co/storage')) {
                return url;
            }
            // Se for URL do Instagram, usa proxy para evitar CORS
            if (url.includes('instagram') || url.includes('fbcdn.net') || url.includes('cdninstagram.com')) {
                return `${API_BASE}/api/images/proxy?url=${encodeURIComponent(url)}`;
            }
            return url;
        };
        
        const imageUrlForDetails = getImageUrlForDetails(event.media_url);
        const originalUrlForDetails = event.media_url; // URL original para fallback
        
        const modalContent = document.getElementById('event-details-content');
        modalContent.innerHTML = `
            ${imageUrlForDetails ? `
                <div class="event-details-image">
                    <img 
                        src="${imageUrlForDetails}" 
                        data-original-url="${originalUrlForDetails || ''}"
                        alt="${escapeHtml(event.title)}" 
                        onerror="
                            const img = this;
                            const originalUrl = img.getAttribute('data-original-url');
                            if (originalUrl && img.src.includes('/api/images/proxy')) {
                                console.log('⚠️ Proxy falhou (detalhes), tentando URL original:', originalUrl.substring(0, 150));
                                img.src = originalUrl;
                                img.onerror = function() {
                                    this.parentElement.innerHTML='<div style=\\'padding:2rem;text-align:center;color:var(--color-text-secondary);\\'><p>Imagem não disponível</p><p style=\\'font-size:0.8em;margin-top:0.5rem;opacity:0.7;\\'>URL pode ter expirado ou estar bloqueada</p></div>';
                                };
                            } else {
                                this.parentElement.innerHTML='<div style=\\'padding:2rem;text-align:center;color:var(--color-text-secondary);\\'><p>Imagem não disponível</p><p style=\\'font-size:0.8em;margin-top:0.5rem;opacity:0.7;\\'>URL pode ter expirado ou estar bloqueada</p></div>';
                            }
                        "
                        onload="console.log('✅ Imagem detalhes carregada:', this.src.substring(0, 150));"
                    >
                </div>
            ` : '<div class="event-details-image" style="background:var(--color-bg-tertiary);display:flex;align-items:center;justify-content:center;color:var(--color-text-secondary);">Sem imagem</div>'}
            <div class="event-details-sidebar">
                <div class="event-details-header">
                    <div class="event-details-profile">
                        <div class="event-details-profile-avatar">${profileInitials}</div>
                        <div class="event-details-profile-username">@${escapeHtml(username)}</div>
                    </div>
                    <div class="event-details-title">
                        <span class="username">@${escapeHtml(username)}</span>
                        <span>${escapeHtml(event.title || generateEventTitle(event))}</span>
                    </div>
                </div>
                ${event.description ? `
                    <div class="event-details-description">
                        <div class="event-details-text">${escapeHtml(event.description).replace(/\n/g, '<br>')}</div>
                    </div>
                ` : ''}
                <div class="event-details-meta">
                    <div class="event-details-meta-item">
                        <span class="meta-icon">📅</span>
                        <span>${dateStr}</span>
                    </div>
                    <div class="event-details-meta-item">
                        <span class="meta-icon">📍</span>
                        <span>${escapeHtml(locationStr)}</span>
                    </div>
                </div>
                <div class="event-details-actions">
                    <div class="share-buttons">
                        <button class="btn btn-share btn-whatsapp" onclick="shareEvent('${event.id}', 'whatsapp', '${escapeHtml(event.title)}', '${escapeHtml(locationStr)}', '${dateStr}')" title="Compartilhar no WhatsApp">
                            📱 WhatsApp
                        </button>
                        <button class="btn btn-share btn-link" onclick="copyEventLink('${event.id}')" title="Copiar link">
                            🔗 Copiar Link
                        </button>
                    </div>
                    ${isAdminLoggedIn ? `
                        <div class="admin-actions" style="margin-top: var(--spacing-md); display: flex; gap: var(--spacing-sm); flex-wrap: wrap;">
                            <button class="btn btn-secondary" onclick="toggleEventFeatured('${event.id}', ${event.featured || false}); closeModal('event-details-modal');">
                                ${event.featured ? '⭐ Remover Destaque' : '⭐ Marcar como Destaque'}
                            </button>
                            <button class="btn btn-primary" onclick="editEvent('${event.id}')" style="flex: 1;">
                                ✏️ Editar
                            </button>
                            <button class="btn btn-danger" onclick="confirmDeleteEvent('${event.id}')" style="flex: 1;">
                                🗑️ Excluir
                            </button>
                        </div>
                    ` : ''}
                    ${event.source_url ? `
                        <a href="${event.source_url}" target="_blank" class="btn btn-secondary">
                            📷 Ver Post Original no Instagram
                        </a>
                    ` : ''}
                    <button class="btn btn-primary" onclick="alert('Sistema de compra de ingressos em desenvolvimento!')">
                        🎫 Comprar Ingresso
                    </button>
                    <button class="btn btn-secondary" onclick="alert('Sistema de reservas em desenvolvimento!')">
                        📞 Reservar Mesa
                    </button>
                </div>
            </div>
        `;
        
        const modal = document.getElementById('event-details-modal');
        modal.classList.add('show');
        
        // Bloqueia scroll do body no mobile quando modal está aberto
        if (window.innerWidth <= 768) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        alert(`Erro ao carregar detalhes: ${error.message}`);
    }
}

// Compartilhar evento
function shareEvent(eventId, platform, title, location, date) {
    // URL especial para compartilhamento com meta tags Open Graph
    const shareUrl = `${window.location.origin}/evento/${eventId}`;
    const text = `🎉 ${title}\n📅 ${date}\n📍 ${location}\n\nVeja mais detalhes: ${shareUrl}`;
    
    let finalUrl = '';
    
    switch(platform) {
        case 'whatsapp':
            finalUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(finalUrl, '_blank');
            break;
        case 'facebook':
            // Facebook vai buscar as meta tags Open Graph da URL /evento/:id
            finalUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
            window.open(finalUrl, '_blank', 'width=600,height=400');
            break;
        case 'twitter':
            finalUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
            window.open(finalUrl, '_blank', 'width=600,height=400');
            break;
    }
}

// Copiar link do evento
function copyEventLink(eventId) {
    // URL especial para compartilhamento com meta tags Open Graph
    const url = `${window.location.origin}/evento/${eventId}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            alert('✅ Link copiado! Cole onde quiser compartilhar.');
        }).catch(() => {
            fallbackCopyTextToClipboard(url);
        });
    } else {
        fallbackCopyTextToClipboard(url);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert('✅ Link copiado! Cole onde quiser compartilhar.');
    } catch (err) {
        alert('❌ Não foi possível copiar o link. Tente manualmente: ' + text);
    }
    
    document.body.removeChild(textArea);
}

// Carregar evento específico da URL
function loadEventFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event');
    
    if (eventId) {
        showEventDetails(eventId);
    }
}

// Editar evento - abre modal com dados preenchidos
async function editEvent(eventId) {
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`);
        const data = await response.json();
        
        if (!data.event) {
            alert('Evento não encontrado');
            return;
        }
        
        const event = data.event;
        
        // Preenche o formulário de edição
        document.getElementById('edit-event-id').value = event.id;
        document.getElementById('edit-event-title').value = event.title || '';
        document.getElementById('edit-event-description').value = event.description || '';
        
        // Formata data para datetime-local
        if (event.date) {
            const date = new Date(event.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            document.getElementById('edit-event-date').value = `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
            document.getElementById('edit-event-date').value = '';
        }
        
        document.getElementById('edit-event-location').value = event.location || '';
        document.getElementById('edit-event-media-url').value = event.media_url || '';
        document.getElementById('edit-event-source-url').value = event.source_url || '';
        
        // Fecha modal de detalhes e abre modal de edição
        closeModal('event-details-modal');
        document.getElementById('edit-event-modal').classList.add('show');
    } catch (error) {
        console.error('Erro ao carregar evento para edição:', error);
        alert(`Erro ao carregar evento: ${error.message}`);
    }
}

// Atualizar evento
async function updateEvent(e) {
    e.preventDefault();
    
    const eventId = document.getElementById('edit-event-id').value;
    const eventData = {
        title: document.getElementById('edit-event-title').value,
        description: document.getElementById('edit-event-description').value,
        date: document.getElementById('edit-event-date').value || null,
        location: document.getElementById('edit-event-location').value || null,
        media_url: document.getElementById('edit-event-media-url').value || null,
        source_url: document.getElementById('edit-event-source-url').value || null
    };
    
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Evento atualizado com sucesso!');
            closeModal('edit-event-modal');
            document.getElementById('edit-event-form').reset();
            loadEvents(); // Recarrega a lista de eventos
        } else {
            alert(`❌ Erro: ${data.error || 'Erro ao atualizar evento'}`);
        }
    } catch (error) {
        alert(`❌ Erro: ${error.message}`);
    }
}

// Confirmar exclusão de evento
async function confirmDeleteEvent(eventId) {
    try {
        // Busca o título do evento para mostrar na confirmação
        const response = await fetch(`${API_BASE}/events/${eventId}`);
        const data = await response.json();
        const eventTitle = data.event?.title || 'este evento';
        
        if (confirm(`⚠️ Tem certeza que deseja excluir o evento "${eventTitle}"?\n\nEsta ação não pode ser desfeita!`)) {
            await deleteEvent(eventId);
        }
    } catch (error) {
        // Se não conseguir buscar o título, ainda permite excluir
        if (confirm(`⚠️ Tem certeza que deseja excluir este evento?\n\nEsta ação não pode ser desfeita!`)) {
            await deleteEvent(eventId);
        }
    }
}

// Excluir evento
async function deleteEvent(eventId) {
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Evento excluído com sucesso!');
            closeModal('event-details-modal');
            loadEvents(); // Recarrega a lista de eventos
        } else {
            alert(`❌ Erro: ${data.error || 'Erro ao excluir evento'}`);
        }
    } catch (error) {
        alert(`❌ Erro: ${error.message}`);
    }
}
