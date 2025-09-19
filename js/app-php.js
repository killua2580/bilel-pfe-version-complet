// app.js - Gestion de la navigation et fonctionnalités générales (PHP API Version)

// Variables globales
let currentUser = null;
let api = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialiser l'API PHP
    try {
        // Charger d'abord le fichier API
        await loadScript('js/api.js');
        api = window.gymPowerAPI;
        console.log('PHP API initialized successfully');
    } catch (error) {
        console.error('Failed to initialize PHP API:', error);
        alert('Erreur de connexion à la base de données');
        return;
    }
    
    // Exposer gymPower globalement pour compatibilité
    window.gymPower = {
        showPage,
        showMainApp,
        showAuthPage,
        loadDashboard,
        participateInTournament,
        currentUser: () => getCurrentUser(),
        api: api // Direct API access
    };
    
    // Vérifier s'il y a une session sauvegardée
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            window.currentUser = currentUser;
            showMainApp();
        } catch (e) {
            console.error('Error parsing saved user data:', e);
            localStorage.removeItem('currentUser');
            showAuthPage();
        }
    } else {
        showAuthPage();
    }
    
    // Gestion de la navigation
    setupNavigation();
});

// Fonction pour charger un script dynamiquement
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ...existing code... (keeping all the navigation and UI functions)

// Fonction pour obtenir l'utilisateur actuel
function getCurrentUser() {
    return currentUser;
}

// Fonction pour afficher une page
function showPage(pageId) {
    // Cacher toutes les pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));
    
    // Afficher la page demandée
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        
        // Charger le contenu spécifique de la page
        switch(pageId) {
            case 'home':
                loadDashboard();
                break;
            case 'tournaments':
                loadTournaments();
                break;
            case 'profile':
                loadProfile();
                break;
            case 'admin':
                if (window.loadAdminPanel) {
                    loadAdminPanel();
                }
                break;
        }
    }
}

// Afficher l'application principale
function showMainApp() {
    document.getElementById('auth').classList.add('hidden');
    document.getElementById('main-header').classList.remove('hidden');
    
    // Vérifier si l'utilisateur est admin
    if (currentUser && (currentUser.email === 'admin@admin.com' || currentUser.isAdmin)) {
        document.getElementById('admin-nav').classList.remove('hidden');
    }
    
    showPage('home');
}

// Afficher la page d'authentification
function showAuthPage() {
    document.getElementById('auth').classList.remove('hidden');
    document.getElementById('main-header').classList.add('hidden');
    
    // Cacher toutes les autres pages
    const pages = document.querySelectorAll('.page:not(#auth)');
    pages.forEach(page => page.classList.add('hidden'));
}

// Charger le tableau de bord
async function loadDashboard() {
    if (!api) return;
    
    try {
        // Charger les tournois
        const { data: tournaments, error: tournamentsError } = await api.getTournaments();
        
        if (tournamentsError) {
            console.error('Error loading tournaments:', tournamentsError);
            return;
        }
        
        // Séparer les tournois par statut
        const availableTournaments = tournaments.filter(t => t.time_status === 'upcoming');
        const upcomingTournaments = tournaments.filter(t => t.time_status === 'current');
        const pastTournaments = tournaments.filter(t => t.time_status === 'past');
        
        // Afficher les tournois disponibles
        displayTournamentList('available-tournaments', availableTournaments, true);
        
        // Afficher les tournois à venir
        displayTournamentList('upcoming-tournaments', upcomingTournaments, false);
        
        // Afficher les tournois passés
        displayTournamentList('past-tournaments', pastTournaments, false);
        
        // Charger les notifications
        if (currentUser) {
            loadNotifications();
        }
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Afficher une liste de tournois
function displayTournamentList(containerId, tournaments, showJoinButton = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (tournaments.length === 0) {
        container.innerHTML = '<p class="empty-message">Aucun tournoi pour le moment</p>';
        return;
    }
    
    container.innerHTML = tournaments.map(tournament => `
        <div class="tournament-item">
            <h4>${tournament.name}</h4>
            <p class="tournament-description">${tournament.description || 'Pas de description'}</p>
            <p class="tournament-date">Date: ${formatDate(tournament.date)}</p>
            <p class="tournament-participants">${tournament.participant_count || 0} participant(s)</p>
            ${showJoinButton ? `
                <button class="btn btn-sm btn-primary" onclick="participateInTournament('${tournament.id}')">
                    Participer
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Fonction pour participer à un tournoi
async function participateInTournament(tournamentId) {
    const user = getCurrentUser();
    if (!user) {
        alert('Veuillez vous connecter pour participer à un tournoi');
        return;
    }
    
    try {
        const { data, error } = await api.participateInTournament(tournamentId, user.id);
        
        if (error) {
            if (error.includes('already a participant')) {
                alert('Vous êtes déjà inscrit à ce tournoi !');
            } else {
                throw new Error(error);
            }
        } else {
            alert('Inscription réussie au tournoi !');
            loadDashboard(); // Recharger le tableau de bord
        }
    } catch (error) {
        console.error('Error joining tournament:', error);
        alert('Erreur lors de l\'inscription au tournoi');
    }
}

// Charger les tournois
async function loadTournaments() {
    if (!api) return;
    
    const container = document.getElementById('tournaments-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Chargement des tournois...</div>';
    
    try {
        const { data: tournaments, error } = await api.getTournaments();
        
        if (error) {
            container.innerHTML = '<p class="error">Erreur lors du chargement des tournois</p>';
            return;
        }
        
        if (tournaments.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>Aucun tournoi</h3><p>Aucun tournoi disponible pour le moment.</p></div>';
            return;
        }
        
        container.innerHTML = tournaments.map(tournament => `
            <div class="card tournament-card">
                <div class="tournament-header">
                    <h3>${tournament.name}</h3>
                    <span class="tournament-status ${tournament.status}">${tournament.status}</span>
                </div>
                <div class="tournament-content">
                    <p class="tournament-description">${tournament.description || 'Pas de description'}</p>
                    <div class="tournament-info">
                        <p><strong>Date:</strong> ${formatDate(tournament.date)}</p>
                        <p><strong>Participants:</strong> ${tournament.participant_count || 0}</p>
                        <p><strong>Statut:</strong> ${tournament.time_status}</p>
                    </div>
                    ${tournament.time_status === 'upcoming' ? `
                        <button class="btn btn-primary" onclick="participateInTournament('${tournament.id}')">
                            Participer
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading tournaments:', error);
        container.innerHTML = '<p class="error">Erreur lors du chargement des tournois</p>';
    }
}

// Charger le profil
async function loadProfile() {
    if (!currentUser) return;
    
    // Remplir les informations du profil
    document.getElementById('profile-name').textContent = `${currentUser.first_name} ${currentUser.last_name}`;
    document.getElementById('profile-email').textContent = currentUser.email;
    
    // Remplir les champs du formulaire
    document.getElementById('profile-firstname').value = currentUser.first_name || '';
    document.getElementById('profile-lastname').value = currentUser.last_name || '';
    document.getElementById('profile-weight').value = currentUser.weight || '';
    document.getElementById('profile-age').value = currentUser.age || '';
    
    // Afficher la photo si disponible
    if (currentUser.photo) {
        document.getElementById('profile-image').src = currentUser.photo;
    }
}

// Charger les notifications
async function loadNotifications() {
    if (!api || !currentUser) return;
    
    const container = document.getElementById('notifications-list');
    if (!container) return;
    
    try {
        const { data: notifications, error } = await api.getNotifications(currentUser.id);
        
        if (error) {
            console.error('Error loading notifications:', error);
            return;
        }
        
        if (notifications.length === 0) {
            container.innerHTML = '<p class="empty-message">Aucune notification</p>';
            return;
        }
        
        container.innerHTML = notifications.slice(0, 5).map(notification => `
            <div class="notification-item ${notification.is_read ? 'read' : 'unread'}">
                <h5>${notification.title}</h5>
                <p>${notification.message}</p>
                <small>${formatDate(notification.created_at)}</small>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Fonction pour formater les dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Gestion de la navigation
function setupNavigation() {
    // Gestion des liens de navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            
            if (href === '#logout') {
                logout();
            } else {
                const pageId = href.replace('#', '');
                showPage(pageId);
                
                // Mettre à jour l'état actif
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

// Déconnexion
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuthPage();
}

// Fonction de recherche pour les tournois
function searchTournaments(query) {
    const tournamentCards = document.querySelectorAll('.tournament-card');
    
    tournamentCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('.tournament-description').textContent.toLowerCase();
        
        if (title.includes(query.toLowerCase()) || description.includes(query.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Gestionnaire d'événements pour le formulaire de profil
document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await updateProfile();
        });
    }
});

// Mettre à jour le profil
async function updateProfile() {
    if (!api || !currentUser) return;
    
    const formData = {
        first_name: document.getElementById('profile-firstname').value,
        last_name: document.getElementById('profile-lastname').value,
        weight: parseInt(document.getElementById('profile-weight').value),
        age: parseInt(document.getElementById('profile-age').value)
    };
    
    // Gérer l'upload de photo si un fichier est sélectionné
    const photoFile = document.getElementById('profile-photo').files[0];
    if (photoFile) {
        try {
            const { data: uploadResult, error: uploadError } = await api.uploadFile(photoFile, 'profile');
            if (uploadError) {
                throw new Error(uploadError);
            }
            formData.photo = uploadResult.url;
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Erreur lors de l\'upload de la photo');
            return;
        }
    }
    
    try {
        const { data, error } = await api.updateUser(currentUser.id, formData);
        
        if (error) {
            throw new Error(error);
        }
        
        // Mettre à jour les données utilisateur locales
        Object.assign(currentUser, formData);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        alert('Profil mis à jour avec succès !');
        loadProfile(); // Recharger le profil
        
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Erreur lors de la mise à jour du profil');
    }
}
