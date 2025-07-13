// app.js - Gestion de la navigation et fonctionnalités générales

// Variables globales
let currentUser = null;
let supabase = null;

// Initialisation de Supabase
const supabaseUrl = 'https://rubketdyxjiboittrqhc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1YmtldGR5eGppYm9pdHRycWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjkxNzUsImV4cCI6MjA2NTE0NTE3NX0.iCDRr-TYGn42okm21c7_DirMhJtnVK6wNEFKe7VCosI';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialiser Supabase
    try {
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        console.log('Supabase initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        alert('Erreur de connexion à la base de données');
        return;
    }
    
    // Exposer gymPower globalement
    window.gymPower = {
        showPage,
        showMainApp,
        showAuthPage,
        loadDashboard,
        participateInTournament,
        currentUser: () => getCurrentUser(),
        supabase: () => supabase
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
    
    // Gestion des modals
    setupModals();
    
    // Gestion des onglets admin
    setupAdminTabs();
});

// Fonction utilitaire pour récupérer l'utilisateur actuel
function getCurrentUser() {
    return window.currentUser || currentUser;
}

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
    
    // Synchroniser les variables currentUser
    const user = getCurrentUser();
    if (user) {
        currentUser = user;
        window.currentUser = user;
    }
    
    // Vérifier si l'utilisateur est admin
    if (user && (user.email === 'admin@admin.com' || user.id === 'admin-id' || user.isAdmin)) {
        document.getElementById('admin-nav').classList.remove('hidden');
    }
    
    // Afficher la page d'accueil par défaut
    showPage('home');
}

function showAuthPage() {
    document.getElementById('main-header').classList.add('hidden');
    document.getElementById('auth').classList.remove('hidden');
    
    // Masquer toutes les autres pages
    const pages = document.querySelectorAll('.page:not(#auth)');
    pages.forEach(page => page.classList.add('hidden'));
}

// Fonctions d'authentification
async function logout() {
    try {
        // Nettoyer les données utilisateur
        currentUser = null;
        window.currentUser = null;
        localStorage.removeItem('currentUser');
        
        // Masquer le menu admin
        document.getElementById('admin-nav').classList.add('hidden');
        
        showAuthPage();
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        alert('Erreur lors de la déconnexion');
    }
}

// Fonctions de chargement de contenu
async function loadDashboard() {
    const user = getCurrentUser();
    if (!user) {
        console.error('Utilisateur non connecté');
        return;
    }
    
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
    if (!container) return;
    
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
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    const user = getCurrentUser();
    if (!user) {
        container.innerHTML = '<p>Erreur: utilisateur non connecté</p>';
        return;
    }
    
    try {
        // Debug logging
        console.log('Loading upcoming tournaments for user:', user);
        
        // For admin users, show all upcoming tournaments
        if (user.isAdmin || user.email === 'admin@admin.com') {
            const { data, error } = await supabase
                .from('tournaments')
                .select('*')
                .gte('date', new Date().toISOString())
                .order('date', { ascending: true });
                
            console.log('Admin upcoming tournaments query result:', { data, error });
                
            if (error) throw error;
            
            if (data.length === 0) {
                container.innerHTML = '<p>Aucun tournoi à venir</p>';
                return;
            }
            
            container.innerHTML = data.map(tournament => `
                <div class="tournament-item">
                    <h4>${tournament.name}</h4>
                    <p>${tournament.description}</p>
                    <p class="date">${new Date(tournament.date).toLocaleDateString('fr-FR')}</p>
                    <span class="admin-badge">Vue Admin</span>
                </div>
            `).join('');
        } else {
            // For regular users, show their participated tournaments
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
                .eq('user_id', user.id);
                
            console.log('User upcoming tournaments query result:', { data, error });
                
            if (error) throw error;
            
            const upcomingTournaments = data
                .map(p => p.tournaments)
                .filter(t => t && new Date(t.date) > new Date());
            
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
        }
    } catch (error) {
        container.innerHTML = '<p>Erreur lors du chargement</p>';
        console.error('Erreur loadUpcomingTournaments:', error);
    }
}

async function loadPastTournaments() {
    const container = document.getElementById('past-tournaments');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    const user = getCurrentUser();
    if (!user) {
        container.innerHTML = '<p>Erreur: utilisateur non connecté</p>';
        return;
    }
    
    try {
        // Debug logging
        console.log('Loading past tournaments for user:', user);
        
        // For admin users, show all past tournaments
        if (user.isAdmin || user.email === 'admin@admin.com') {
            const { data, error } = await supabase
                .from('tournaments')
                .select('*')
                .lt('date', new Date().toISOString())
                .order('date', { ascending: false });
                
            console.log('Admin past tournaments query result:', { data, error });
                
            if (error) throw error;
            
            if (data.length === 0) {
                container.innerHTML = '<p>Aucun tournoi passé</p>';
                return;
            }
            
            container.innerHTML = data.map(tournament => `
                <div class="tournament-item">
                    <h4>${tournament.name}</h4>
                    <p>${tournament.description}</p>
                    <p class="date">${new Date(tournament.date).toLocaleDateString('fr-FR')}</p>
                    <span class="admin-badge">Vue Admin</span>
                </div>
            `).join('');
        } else {
            // For regular users, show their participated tournaments
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
                .eq('user_id', user.id);
                
            console.log('User past tournaments query result:', { data, error });
                
            if (error) throw error;
            
            const pastTournaments = data
                .map(p => p.tournaments)
                .filter(t => t && new Date(t.date) < new Date());
            
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
        }
    } catch (error) {
        container.innerHTML = '<p>Erreur lors du chargement</p>';
        console.error('Erreur loadPastTournaments:', error);
    }
}

async function loadNotifications() {
    const container = document.getElementById('notifications-list');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    const user = getCurrentUser();
    if (!user) {
        container.innerHTML = '<p>Erreur: utilisateur non connecté</p>';
        return;
    }
    
    try {
        // Debug logging
        console.log('Loading notifications for user:', user);
        
        // For admin users, show all recent notifications
        if (user.isAdmin || user.email === 'admin@admin.com') {
            const { data, error } = await supabase
                .from('notifications')
                .select('*, users(first_name, last_name)')
                .order('created_at', { ascending: false })
                .limit(10);
                
            console.log('Admin notifications query result:', { data, error });
                
            if (error) throw error;
            
            if (data.length === 0) {
                container.innerHTML = '<p>Aucune notification système</p>';
                return;
            }
            
            container.innerHTML = data.map(notification => `
                <div class="notification-item ${notification.is_read ? '' : 'unread'}">
                    <h5>${notification.title}</h5>
                    <p>${notification.message}</p>
                    <p class="user-info">Pour: ${notification.users?.first_name} ${notification.users?.last_name}</p>
                    <p class="time">${new Date(notification.created_at).toLocaleDateString('fr-FR')}</p>
                    <span class="admin-badge">Vue Admin</span>
                </div>
            `).join('');
        } else {
            // For regular users, show their notifications
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);
                
            console.log('User notifications query result:', { data, error });
                
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
        }
    } catch (error) {
        container.innerHTML = '<p>Erreur lors du chargement</p>';
        console.error('Erreur loadNotifications:', error);
    }
}

// Fonction pour participer à un tournoi
async function participateInTournament(tournamentId) {
    const user = getCurrentUser();
    if (!user) {
        alert('Veuillez vous connecter pour participer à un tournoi');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('participants')
            .insert([
                {
                    tournament_id: tournamentId,
                    user_id: user.id
                }
            ]);
            
        if (error) {
            if (error.code === '23505') { // Contrainte d'unicité violée
                alert('Vous êtes déjà inscrit à ce tournoi !');
            } else {
                throw error;
            }
        } else {
            alert('Inscription réussie au tournoi !');
            loadDashboard(); // Recharger le tableau de bord
        }
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
    if (container) {
        container.innerHTML = '<div class="loading">Chargement...</div>';
    }
}

function showError(containerId, message = 'Erreur lors du chargement') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<p class="error">${message}</p>`;
    }
}

// Charger la page des tournois
async function loadTournaments() {
    const container = document.getElementById('tournaments-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    const user = getCurrentUser();
    if (!user) {
        container.innerHTML = '<p>Veuillez vous connecter pour voir les tournois</p>';
        return;
    }
    
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
            .eq('user_id', user.id);
            
        if (partError) {
            console.error('Error loading participations:', partError);
        }
        
        const participatedTournaments = participations ? participations.map(p => p.tournament_id) : [];
        
        container.innerHTML = data.map(tournament => {
            const isParticipating = participatedTournaments.includes(tournament.id);
            const isPast = new Date(tournament.date) < new Date();
            
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
        container.innerHTML = '<p class="error">Erreur lors du chargement des tournois</p>';
        console.error('Erreur:', error);
    }
}

// Charger la page de profil
async function loadProfile() {
    const user = getCurrentUser();
    if (!user || !user.profile) {
        showError('profile-container', 'Impossible de charger le profil');
        return;
    }
    
    const profile = user.profile;
    
    // Remplir les informations du profil
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    
    if (profileName) {
        profileName.textContent = `${profile.first_name} ${profile.last_name}`;
    }
    if (profileEmail) {
        profileEmail.textContent = profile.email;
    }
    
    // Remplir le formulaire de modification
    const fields = {
        'profile-firstname': profile.first_name || '',
        'profile-lastname': profile.last_name || '',
        'profile-weight': profile.weight || '',
        'profile-age': profile.age || ''
    };
    
    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    });
    
    // Afficher la photo de profil si elle existe
    const profileImage = document.getElementById('profile-image');
    if (profileImage) {
        if (profile.photo) {
            profileImage.src = profile.photo;
            profileImage.style.display = 'block';
        } else {
            profileImage.style.display = 'none';
        }
    }
    
    // Gérer la soumission du formulaire de profil
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.onsubmit = async (e) => {
            e.preventDefault();
            await updateProfile();
        };
    }
}

// Mettre à jour le profil
async function updateProfile() {
    const form = document.getElementById('profile-form');
    if (!form) return;
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Mise à jour...';
    submitBtn.disabled = true;
    
    const user = getCurrentUser();
    if (!user) {
        alert('Utilisateur non connecté');
        return;
    }
    
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
            .eq('id', user.id);
            
        if (error) throw error;
        
        // Mettre à jour les données locales
        user.profile = { ...user.profile, ...updatedData };
        window.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
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
    const user = getCurrentUser();
    if (!user) return [];
    
    try {
        const { data, error } = await supabase
            .from('fights')
            .select(`
                *,
                tournaments (name, date),
                fighter1:users!fights_fighter1_id_fkey (first_name, last_name),
                fighter2:users!fights_fighter2_id_fkey (first_name, last_name)
            `)
            .or(`fighter1_id.eq.${user.id},fighter2_id.eq.${user.id}`);
            
        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Erreur lors du chargement des combats:', error);
        return [];
    }
}

// Afficher les combats de l'utilisateur dans les notifications
async function loadUserFights() {
    const fights = await getUserFights();
    const user = getCurrentUser();
    
    if (fights.length > 0 && user) {
        const fightNotifications = fights.map(fight => {
            const opponent = fight.fighter1_id === user.id ? fight.fighter2 : fight.fighter1;
            return {
                title: `Combat programmé - ${fight.tournaments.name}`,
                message: `Vous affronterez ${opponent.first_name} ${opponent.last_name}`,
                created_at: fight.fight_date,
                is_read: false
            };
        });
        
        // Ajouter ces notifications à l'affichage
        const container = document.getElementById('notifications-list');
        if (container) {
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

// Charger le panneau d'administration
async function loadAdminPanel() {
    // Vérifier si l'utilisateur est admin
    const user = getCurrentUser();
    if (!user || (user.email !== 'admin@admin.com' && user.id !== 'admin-id' && !user.isAdmin)) {
        const adminContainer = document.getElementById('admin');
        if (adminContainer) {
            adminContainer.innerHTML = '<div class="error">Accès non autorisé</div>';
        }
        return;
    }
    
    try {
        // Charger les données du dashboard (visible dans la section admin)
        await loadAvailableTournaments();
        await loadUpcomingTournaments();
        await loadPastTournaments();
        await loadNotifications();
        
        // Charger les utilisateurs par défaut et configurer les onglets
        if (window.adminFunctions) {
            window.adminFunctions.loadUsers();
            // Assurer que les événements des onglets sont configurés
            if (window.adminFunctions.setupAdminTabEvents) {
                window.adminFunctions.setupAdminTabEvents();
            }
        } else {
            console.error('adminFunctions not available');
        }
    } catch (error) {
        console.error('Erreur lors du chargement du panneau admin:', error);
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

