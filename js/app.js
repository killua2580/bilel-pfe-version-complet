// app.js - Gestion de la navigation et fonctionnalités générales

// Variables globales
let currentUser = null;
let supabase = null;

// Initialisation de Supabase
const supabaseUrl = 'https://rubketdyxjiboittrqhc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1YmtldGR5eGppYm9pdHRycWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjkxNzUsImV4cCI6MjA2NTE0NTE3NX0.iCDRr-TYGn42okm21c7_DirMhJtnVK6wNEFKe7VCosI';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialiser Supabase
    supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    
    // Vérifier si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        await loadUserProfile();
        showMainApp();
    } else {
        showAuthPage();
    }
    
    // Écouter les changements d'authentification
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            await loadUserProfile();
            showMainApp();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            showAuthPage();
        }
    });
    
    // Gestion de la navigation
    setupNavigation();
    
    // Gestion des modals
    setupModals();
    
    // Gestion des onglets admin
    setupAdminTabs();
});

// Fonctions de navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            
            if (targetId === 'logout') {
                logout();
                return;
            }
            
            showPage(targetId);
        });
    });
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        if (page.id === pageId) {
            page.classList.remove('hidden');
        } else {
            page.classList.add('hidden');
        }
    });
    
    // Charger le contenu spécifique à la page
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
            loadAdminPanel();
            break;
    }
}

function showAuthPage() {
    document.getElementById('main-header').classList.add('hidden');
    document.getElementById('auth').classList.remove('hidden');
    
    // Masquer toutes les autres pages
    const pages = document.querySelectorAll('.page:not(#auth)');
    pages.forEach(page => page.classList.add('hidden'));
}

function showMainApp() {
    document.getElementById('main-header').classList.remove('hidden');
    document.getElementById('auth').classList.add('hidden');
    
    // Vérifier si l'utilisateur est admin
    if (window.currentUser && (window.currentUser.email === 'admin@admin.com' || window.currentUser.id === 'admin-id')) {
        document.getElementById('admin-nav').classList.remove('hidden');
    }
    
    // Afficher la page d'accueil par défaut
    showPage('home');
}

// Fonctions d'authentification
async function logout() {
    try {
        await supabase.auth.signOut();
        showAuthPage();
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        alert('Erreur lors de la déconnexion');
    }
}

async function loadUserProfile() {
    if (!currentUser) return;
    
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
        if (error) throw error;
        
        // Stocker les données utilisateur
        currentUser.profile = data;
    } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
    }
}

// Fonctions de chargement de contenu
async function loadDashboard() {
    try {
        // Charger les tournois disponibles
        await loadAvailableTournaments();
        
        // Charger les tournois à venir
        await loadUpcomingTournaments();
        
        // Charger les tournois passés
        await loadPastTournaments();
        
        // Charger les notifications
        await loadNotifications();
    } catch (error) {
        console.error('Erreur lors du chargement du tableau de bord:', error);
    }
}

async function loadAvailableTournaments() {
    const container = document.getElementById('available-tournaments');
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        const { data, error } = await supabase
            .from('tournaments')
            .select('*')
            .gte('date', new Date().toISOString())
            .order('date', { ascending: true });
            
        if (error) throw error;
        
        if (data.length === 0) {
            container.innerHTML = '<p>Aucun tournoi disponible</p>';
            return;
        }
        
        container.innerHTML = data.map(tournament => `
            <div class="tournament-item">
                <h4>${tournament.name}</h4>
                <p>${tournament.description}</p>
                <p class="date">${new Date(tournament.date).toLocaleDateString('fr-FR')}</p>
                <button class="btn btn-primary" onclick="participateInTournament('${tournament.id}')">
                    Participer
                </button>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p>Erreur lors du chargement</p>';
        console.error('Erreur:', error);
    }
}

async function loadUpcomingTournaments() {
    const container = document.getElementById('upcoming-tournaments');
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        const { data, error } = await supabase
            .from('participants')
            .select(`
                tournaments (
                    id,
                    name,
                    description,
                    date
                )
            `)
            .eq('user_id', currentUser.id);
            
        if (error) throw error;
        
        const upcomingTournaments = data
            .map(p => p.tournaments)
            .filter(t => new Date(t.date) > new Date());
        
        if (upcomingTournaments.length === 0) {
            container.innerHTML = '<p>Aucun tournoi à venir</p>';
            return;
        }
        
        container.innerHTML = upcomingTournaments.map(tournament => `
            <div class="tournament-item">
                <h4>${tournament.name}</h4>
                <p>${tournament.description}</p>
                <p class="date">${new Date(tournament.date).toLocaleDateString('fr-FR')}</p>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p>Erreur lors du chargement</p>';
        console.error('Erreur:', error);
    }
}

async function loadPastTournaments() {
    const container = document.getElementById('past-tournaments');
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        const { data, error } = await supabase
            .from('participants')
            .select(`
                tournaments (
                    id,
                    name,
                    description,
                    date
                )
            `)
            .eq('user_id', currentUser.id);
            
        if (error) throw error;
        
        const pastTournaments = data
            .map(p => p.tournaments)
            .filter(t => new Date(t.date) < new Date());
        
        if (pastTournaments.length === 0) {
            container.innerHTML = '<p>Aucun tournoi passé</p>';
            return;
        }
        
        container.innerHTML = pastTournaments.map(tournament => `
            <div class="tournament-item">
                <h4>${tournament.name}</h4>
                <p>${tournament.description}</p>
                <p class="date">${new Date(tournament.date).toLocaleDateString('fr-FR')}</p>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p>Erreur lors du chargement</p>';
        console.error('Erreur:', error);
    }
}

async function loadNotifications() {
    const container = document.getElementById('notifications-list');
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(5);
            
        if (error) throw error;
        
        if (data.length === 0) {
            container.innerHTML = '<p>Aucune notification</p>';
            return;
        }
        
        container.innerHTML = data.map(notification => `
            <div class="notification-item ${notification.is_read ? '' : 'unread'}">
                <h5>${notification.title}</h5>
                <p>${notification.message}</p>
                <p class="time">${new Date(notification.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p>Erreur lors du chargement</p>';
        console.error('Erreur:', error);
    }
}

// Fonction pour participer à un tournoi
async function participateInTournament(tournamentId) {
    try {
        const { error } = await supabase
            .from('participants')
            .insert([
                {
                    tournament_id: tournamentId,
                    user_id: currentUser.id
                }
            ]);
            
        if (error) throw error;
        
        alert('Inscription réussie au tournoi !');
        loadDashboard(); // Recharger le tableau de bord
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        alert('Erreur lors de l\'inscription au tournoi');
    }
}

// Gestion des modals
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').classList.add('hidden');
        });
    });
    
    // Fermer les modals en cliquant à l'extérieur
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
}

// Gestion des onglets admin
function setupAdminTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Retirer la classe active de tous les boutons et contenus
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué et au contenu correspondant
            button.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });
}

// Fonctions utilitaires
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showLoading(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">Chargement...</div>';
}

function showError(containerId, message = 'Erreur lors du chargement') {
    const container = document.getElementById(containerId);
    container.innerHTML = `<p class="error">${message}</p>`;
}

// Exposer les fonctions globalement pour les utiliser dans d'autres fichiers
window.gymPower = {
    showPage,
    loadDashboard,
    participateInTournament,
    currentUser: () => currentUser,
    supabase: () => supabase
};



// Fonctions spécifiques aux combattants

// Charger la page des tournois
async function loadTournaments() {
    const container = document.getElementById('tournaments-container');
    showLoading('tournaments-container');
    
    try {
        const { data, error } = await supabase
            .from('tournaments')
            .select('*')
            .order('date', { ascending: true });
            
        if (error) throw error;
        
        if (data.length === 0) {
            container.innerHTML = '<div class="card"><p>Aucun tournoi disponible pour le moment.</p></div>';
            return;
        }
        
        // Vérifier les participations de l'utilisateur
        const { data: participations, error: partError } = await supabase
            .from('participants')
            .select('tournament_id')
            .eq('user_id', currentUser.id);
            
        if (partError) throw partError;
        
        const participatedTournaments = participations.map(p => p.tournament_id);
        
        container.innerHTML = data.map(tournament => {
            const isParticipating = participatedTournaments.includes(tournament.id);
            const isPast = new Date(tournament.date) < new Date();
            const isUpcoming = new Date(tournament.date) > new Date();
            
            let statusBadge = '';
            let actionButton = '';
            
            if (isPast) {
                statusBadge = '<span class="badge badge-secondary">Terminé</span>';
            } else if (isParticipating) {
                statusBadge = '<span class="badge badge-success">Inscrit</span>';
            } else {
                statusBadge = '<span class="badge badge-primary">Disponible</span>';
                actionButton = `<button class="btn btn-primary" onclick="participateInTournament('${tournament.id}')">Participer</button>`;
            }
            
            return `
                <div class="card tournament-card">
                    ${tournament.image ? `<img src="${tournament.image}" alt="${tournament.name}" class="tournament-image">` : ''}
                    <div class="tournament-content">
                        <div class="tournament-header">
                            <h3>${tournament.name}</h3>
                            ${statusBadge}
                        </div>
                        <p class="tournament-description">${tournament.description}</p>
                        <p class="tournament-date">
                            <strong>Date:</strong> ${formatDate(tournament.date)}
                        </p>
                        ${actionButton}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        showError('tournaments-container', 'Erreur lors du chargement des tournois');
        console.error('Erreur:', error);
    }
}

// Charger la page de profil
async function loadProfile() {
    if (!currentUser || !currentUser.profile) {
        showError('profile-container', 'Impossible de charger le profil');
        return;
    }
    
    const profile = currentUser.profile;
    
    // Remplir les informations du profil
    document.getElementById('profile-name').textContent = `${profile.first_name} ${profile.last_name}`;
    document.getElementById('profile-email').textContent = profile.email;
    
    // Remplir le formulaire de modification
    document.getElementById('profile-firstname').value = profile.first_name || '';
    document.getElementById('profile-lastname').value = profile.last_name || '';
    document.getElementById('profile-weight').value = profile.weight || '';
    document.getElementById('profile-age').value = profile.age || '';
    
    // Afficher la photo de profil si elle existe
    const profileImage = document.getElementById('profile-image');
    if (profile.photo) {
        profileImage.src = profile.photo;
        profileImage.style.display = 'block';
    } else {
        profileImage.style.display = 'none';
    }
    
    // Gérer la soumission du formulaire de profil
    const profileForm = document.getElementById('profile-form');
    profileForm.onsubmit = async (e) => {
        e.preventDefault();
        await updateProfile();
    };
}

// Mettre à jour le profil
async function updateProfile() {
    const form = document.getElementById('profile-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Mise à jour...';
    submitBtn.disabled = true;
    
    try {
        const updatedData = {
            first_name: document.getElementById('profile-firstname').value,
            last_name: document.getElementById('profile-lastname').value,
            weight: parseInt(document.getElementById('profile-weight').value),
            age: parseInt(document.getElementById('profile-age').value)
        };
        
        const { error } = await supabase
            .from('users')
            .update(updatedData)
            .eq('id', currentUser.id);
            
        if (error) throw error;
        
        // Mettre à jour les données locales
        currentUser.profile = { ...currentUser.profile, ...updatedData };
        
        alert('Profil mis à jour avec succès !');
        
        // Recharger l'affichage du profil
        loadProfile();
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        alert('Erreur lors de la mise à jour du profil');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Marquer une notification comme lue
async function markNotificationAsRead(notificationId) {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
            
        if (error) throw error;
        
        // Recharger les notifications
        loadNotifications();
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la notification:', error);
    }
}

// Obtenir les combats de l'utilisateur
async function getUserFights() {
    try {
        const { data, error } = await supabase
            .from('fights')
            .select(`
                *,
                tournaments (name, date),
                fighter1:users!fights_fighter1_id_fkey (first_name, last_name),
                fighter2:users!fights_fighter2_id_fkey (first_name, last_name)
            `)
            .or(`fighter1_id.eq.${currentUser.id},fighter2_id.eq.${currentUser.id}`);
            
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Erreur lors du chargement des combats:', error);
        return [];
    }
}

// Afficher les combats de l'utilisateur dans les notifications
async function loadUserFights() {
    const fights = await getUserFights();
    
    if (fights.length > 0) {
        const fightNotifications = fights.map(fight => {
            const opponent = fight.fighter1_id === currentUser.id ? fight.fighter2 : fight.fighter1;
            return {
                title: `Combat programmé - ${fight.tournaments.name}`,
                message: `Vous affronterez ${opponent.first_name} ${opponent.last_name}`,
                created_at: fight.fight_date,
                is_read: false
            };
        });
        
        // Ajouter ces notifications à l'affichage
        const container = document.getElementById('notifications-list');
        const existingContent = container.innerHTML;
        
        const fightsHtml = fightNotifications.map(notification => `
            <div class="notification-item unread">
                <h5>${notification.title}</h5>
                <p>${notification.message}</p>
                <p class="time">${formatDate(notification.created_at)}</p>
            </div>
        `).join('');
        
        container.innerHTML = fightsHtml + existingContent;
    }
}

// Fonction pour rechercher des tournois
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

// Ajouter la recherche à la page des tournois
function addTournamentSearch() {
    const tournamentsPage = document.getElementById('tournaments');
    const pageHeader = tournamentsPage.querySelector('.page-header');
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <input type="text" id="tournament-search" placeholder="Rechercher un tournoi..." class="search-input">
    `;
    
    pageHeader.appendChild(searchContainer);
    
    const searchInput = document.getElementById('tournament-search');
    searchInput.addEventListener('input', (e) => {
        searchTournaments(e.target.value);
    });
}

// Mettre à jour les fonctions exposées globalement
window.gymPower = {
    ...window.gymPower,
    loadTournaments,
    loadProfile,
    updateProfile,
    markNotificationAsRead,
    getUserFights,
    loadUserFights,
    searchTournaments
};


// Charger le panneau d'administration
async function loadAdminPanel() {
    // Vérifier si l'utilisateur est admin
    if (!window.currentUser || (window.currentUser.email !== 'admin@admin.com' && window.currentUser.id !== 'admin-id')) {
        document.getElementById('admin').innerHTML = '<div class="error">Accès non autorisé</div>';
        return;
    }
    
    // Charger les utilisateurs par défaut
    if (window.adminFunctions) {
        window.adminFunctions.loadUsers();
    }
}

// Mettre à jour la gestion des onglets admin pour charger le contenu
function setupAdminTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Retirer la classe active de tous les boutons et contenus
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué et au contenu correspondant
            button.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
            
            // Charger le contenu de l'onglet
            if (window.adminFunctions) {
                window.adminFunctions.updateAdminTab(targetTab);
            }
        });
    });
}

// Mettre à jour les fonctions exposées globalement
window.gymPower = {
    ...window.gymPower,
    loadAdminPanel
};


// Optimisations de performance pour app.js

// Cache pour les données fréquemment utilisées
window.gymPowerCache = {
    users: null,
    tournaments: null,
    lastUpdate: {
        users: null,
        tournaments: null
    }
};

// Fonction utilitaire pour vérifier si le cache est valide (5 minutes)
function isCacheValid(lastUpdate) {
    if (!lastUpdate) return false;
    return (Date.now() - lastUpdate) < 300000; // 5 minutes
}

// Version optimisée de loadTournaments avec cache
async function loadTournamentsOptimized() {
    if (isCacheValid(window.gymPowerCache.lastUpdate.tournaments) && window.gymPowerCache.tournaments) {
        displayTournaments(window.gymPowerCache.tournaments);
        return;
    }

    try {
        const response = await window.gymPower.supabase()
            .from('tournaments')
            .select('id, name, description, date, image')
            .order('date', { ascending: true });

        if (response.data) {
            window.gymPowerCache.tournaments = response.data;
            window.gymPowerCache.lastUpdate.tournaments = Date.now();
            displayTournaments(response.data);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des tournois:', error);
    }
}

// Version optimisée de loadUsers avec cache
async function loadUsersOptimized() {
    if (isCacheValid(window.gymPowerCache.lastUpdate.users) && window.gymPowerCache.users) {
        displayUsers(window.gymPowerCache.users);
        return;
    }

    try {
        const response = await window.gymPower.supabase()
            .from('users')
            .select('id, email, first_name, last_name, weight, age')
            .neq('email', 'admin@admin.com');

        if (response.data) {
            window.gymPowerCache.users = response.data;
            window.gymPowerCache.lastUpdate.users = Date.now();
            displayUsers(response.data);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
    }
}

// Fonction de debouncing pour les recherches
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimisation des event listeners
function optimizeEventListeners() {
    // Utiliser la délégation d'événements pour les éléments dynamiques
    document.addEventListener('click', function(e) {
        if (e.target.matches('.tournament-card .btn-participate')) {
            handleTournamentParticipation(e.target);
        }
        if (e.target.matches('.user-card .btn-delete')) {
            handleUserDeletion(e.target);
        }
    });

    // Optimiser les formulaires avec debouncing
    const searchInputs = document.querySelectorAll('input[type="search"]');
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce(handleSearch, 300));
    });
}

// Fonction pour invalider le cache lors des modifications
function invalidateCache(type) {
    if (type === 'users') {
        window.gymPowerCache.users = null;
        window.gymPowerCache.lastUpdate.users = null;
    } else if (type === 'tournaments') {
        window.gymPowerCache.tournaments = null;
        window.gymPowerCache.lastUpdate.tournaments = null;
    }
}

// Optimisation du rendu des listes
function displayTournaments(tournaments) {
    const container = document.getElementById('tournaments-list');
    if (!container) return;

    // Utiliser DocumentFragment pour de meilleures performances
    const fragment = document.createDocumentFragment();
    
    tournaments.forEach(tournament => {
        const tournamentElement = createTournamentElement(tournament);
        fragment.appendChild(tournamentElement);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

function displayUsers(users) {
    const container = document.getElementById('users-list');
    if (!container) return;

    const fragment = document.createDocumentFragment();
    
    users.forEach(user => {
        const userElement = createUserElement(user);
        fragment.appendChild(userElement);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

// Initialiser les optimisations
document.addEventListener('DOMContentLoaded', function() {
    optimizeEventListeners();
});

