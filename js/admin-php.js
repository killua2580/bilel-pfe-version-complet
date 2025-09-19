// admin.js - Fonctionnalités d'administration (PHP API Version)

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les événements admin
    setupAdminEvents();
});

function setupAdminEvents() {
    // Bouton pour ajouter un utilisateur
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', showAddUserModal);
    }
    
    // Bouton pour créer un tournoi
    const addTournamentBtn = document.getElementById('add-tournament-btn');
    if (addTournamentBtn) {
        addTournamentBtn.addEventListener('click', showTournamentModal);
    }
    
    // Formulaire de création de tournoi
    const tournamentForm = document.getElementById('tournament-form');
    if (tournamentForm) {
        tournamentForm.addEventListener('submit', createTournament);
    }
    
    // Formulaire d'ajout d'utilisateur
    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) {
        addUserForm.addEventListener('submit', addUser);
    }
    
    // Gestion des onglets admin
    setupAdminTabEvents();
}

// Charger le panneau d'administration
async function loadAdminPanel() {
    // Vérifier si l'utilisateur est admin
    const user = window.gymPower ? window.gymPower.currentUser() : window.currentUser;
    if (!user || (user.email !== 'admin@admin.com' && !user.isAdmin)) {
        const adminContainer = document.getElementById('admin');
        if (adminContainer) {
            adminContainer.innerHTML = '<div class="error">Accès non autorisé</div>';
        }
        return;
    }
    
    // Charger les utilisateurs par défaut
    loadUsers();
}

// Gestion des utilisateurs
async function loadUsers() {
    const container = document.getElementById('users-list');
    if (!container) {
        console.error('users-list container not found');
        return;
    }
    
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        const api = window.gymPowerAPI;
        if (!api) {
            throw new Error('API non disponible');
        }
        
        const { data, error } = await api.getUsers();
        
        if (error) throw new Error(error);
        
        if (data.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>Aucun utilisateur</h3><p>Aucun utilisateur inscrit pour le moment.</p></div>';
            return;
        }
        
        container.innerHTML = data.map(user => `
            <div class="card user-card">
                <div class="user-header">
                    <div class="user-info">
                        <h4>${user.first_name} ${user.last_name}</h4>
                        <p class="user-email">${user.email}</p>
                        ${user.email === 'admin@admin.com' ? '<span class="badge badge-warning">Admin</span>' : '<span class="badge badge-primary">Combattant</span>'}
                    </div>
                    <div class="user-actions">
                        ${user.email !== 'admin@admin.com' ? `<button class="btn btn-danger btn-sm" onclick="deleteUser('${user.id}')">Supprimer</button>` : ''}
                    </div>
                </div>
                <div class="user-details">
                    <p><strong>Poids:</strong> ${user.weight || 'Non spécifié'} kg</p>
                    <p><strong>Âge:</strong> ${user.age || 'Non spécifié'} ans</p>
                    <p><strong>Inscrit le:</strong> ${user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p class="error">Erreur lors du chargement des utilisateurs: ' + error.message + '</p>';
        console.error('Erreur:', error);
    }
}

// Supprimer un utilisateur
async function deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
    }
    
    try {
        const api = window.gymPowerAPI;
        const { data, error } = await api.deleteUser(userId);
        
        if (error) throw new Error(error);
        
        alert('Utilisateur supprimé avec succès');
        loadUsers(); // Recharger la liste
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'utilisateur: ' + error.message);
    }
}

// Afficher le modal d'ajout d'utilisateur
function showAddUserModal() {
    const modal = document.getElementById('add-user-modal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Réinitialiser le formulaire
        const form = document.getElementById('add-user-form');
        if (form) {
            form.reset();
        }
    }
}

// Ajouter un utilisateur
async function addUser(e) {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('add-user-email').value,
        password: document.getElementById('add-user-password').value,
        first_name: document.getElementById('add-user-firstname').value,
        last_name: document.getElementById('add-user-lastname').value,
        weight: parseInt(document.getElementById('add-user-weight').value),
        age: parseInt(document.getElementById('add-user-age').value)
    };
    
    // Validation
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    // Gérer l'upload de photo si un fichier est sélectionné
    const photoFile = document.getElementById('add-user-photo').files[0];
    if (photoFile) {
        try {
            const api = window.gymPowerAPI;
            const { data: uploadResult, error: uploadError } = await api.uploadFile(photoFile, 'profile');
            if (uploadError) {
                throw new Error(uploadError);
            }
            formData.photo = uploadResult.url;
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Erreur lors de l\'upload de la photo: ' + error.message);
            return;
        }
    }
    
    try {
        const api = window.gymPowerAPI;
        const { data, error } = await api.createUser(formData);
        
        if (error) throw new Error(error);
        
        alert('Utilisateur créé avec succès !');
        
        // Fermer le modal
        const modal = document.getElementById('add-user-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Recharger la liste des utilisateurs
        loadUsers();
        
    } catch (error) {
        console.error('Erreur lors de la création:', error);
        alert('Erreur lors de la création de l\'utilisateur: ' + error.message);
    }
}

// Gestion des tournois d'administration
async function loadAdminTournaments() {
    const container = document.getElementById('admin-tournaments-list');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        const api = window.gymPowerAPI;
        const { data: tournaments, error } = await api.getTournaments();
        
        if (error) throw new Error(error);
        
        if (tournaments.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>Aucun tournoi</h3><p>Aucun tournoi créé pour le moment.</p></div>';
            return;
        }
        
        container.innerHTML = tournaments.map(tournament => {
            const canOrganizeFights = tournament.time_status === 'upcoming' && tournament.participant_count >= 2;
            
            return `
                <div class="card tournament-card">
                    <div class="tournament-header">
                        <h3>${tournament.name}</h3>
                        <div class="tournament-actions">
                            ${canOrganizeFights ? `<button class="btn btn-success btn-sm" onclick="organizeFights('${tournament.id}')">Organiser combats</button>` : ''}
                            <button class="btn btn-danger btn-sm" onclick="deleteTournament('${tournament.id}')">Supprimer</button>
                        </div>
                    </div>
                    <div class="tournament-content">
                        <p class="tournament-description">${tournament.description || 'Pas de description'}</p>
                        <div class="tournament-info">
                            <p><strong>Date:</strong> ${formatDate(tournament.date)}</p>
                            <p><strong>Participants:</strong> ${tournament.participant_count || 0}</p>
                            <p><strong>Statut:</strong> ${tournament.status}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading tournaments:', error);
        container.innerHTML = '<p class="error">Erreur lors du chargement des tournois</p>';
    }
}

// Supprimer un tournoi
async function deleteTournament(tournamentId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tournoi ? Tous les combats associés seront également supprimés.')) {
        return;
    }
    
    try {
        const api = window.gymPowerAPI;
        const { data, error } = await api.deleteTournament(tournamentId);
        
        if (error) throw new Error(error);
        
        alert('Tournoi supprimé avec succès');
        loadAdminTournaments(); // Recharger la liste
        loadFights(); // Recharger les combats si l'onglet est actif
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du tournoi: ' + error.message);
    }
}

// Afficher le modal de création de tournoi
function showTournamentModal() {
    const modal = document.getElementById('tournament-modal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Réinitialiser le formulaire
        const form = document.getElementById('tournament-form');
        if (form) {
            form.reset();
        }
    }
}

// Créer un tournoi
async function createTournament(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('tournament-name').value,
        description: document.getElementById('tournament-description').value,
        date: document.getElementById('tournament-date').value
    };
    
    // Validation
    if (!formData.name || !formData.date) {
        alert('Le nom et la date sont obligatoires');
        return;
    }
    
    // Gérer l'upload d'image si un fichier est sélectionné
    const imageFile = document.getElementById('tournament-image').files[0];
    if (imageFile) {
        try {
            const api = window.gymPowerAPI;
            const { data: uploadResult, error: uploadError } = await api.uploadFile(imageFile, 'tournament');
            if (uploadError) {
                throw new Error(uploadError);
            }
            formData.image = uploadResult.url;
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erreur lors de l\'upload de l\'image: ' + error.message);
            return;
        }
    }
    
    try {
        const api = window.gymPowerAPI;
        const { data, error } = await api.createTournament(formData);
        
        if (error) throw new Error(error);
        
        alert('Tournoi créé avec succès !');
        
        // Fermer le modal
        const modal = document.getElementById('tournament-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Recharger la liste des tournois
        loadAdminTournaments();
        
    } catch (error) {
        console.error('Erreur lors de la création:', error);
        alert('Erreur lors de la création du tournoi: ' + error.message);
    }
}

// Organiser les combats
async function organizeFights(tournamentId) {
    if (!confirm('Organiser les combats pour ce tournoi ?')) {
        return;
    }
    
    try {
        const api = window.gymPowerAPI;
        const { data, error } = await api.organizeFights(tournamentId);
        
        if (error) throw new Error(error);
        
        let message = data.message;
        if (data.unmatched_fighters > 0) {
            message += `\n\nNote: ${data.unmatched_fighters} combattant(s) n'ont pas pu être appariés (critères de compatibilité non respectés).`;
        }
        
        alert(message);
        loadFights(); // Recharger la liste des combats
        
    } catch (error) {
        console.error('Erreur lors de l\'organisation des combats:', error);
        alert('Erreur lors de l\'organisation des combats: ' + error.message);
    }
}

// Charger les combats
async function loadFights() {
    const container = document.getElementById('fights-list');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        const api = window.gymPowerAPI;
        const { data: fights, error } = await api.getFights();
        
        if (error) throw new Error(error);
        
        if (fights.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>Aucun combat</h3><p>Aucun combat programmé pour le moment.</p></div>';
            return;
        }
        
        container.innerHTML = fights.map(fight => `
            <div class="card fight-card">
                <div class="fight-header">
                    <h4>${fight.tournament.name}</h4>
                    <button class="btn btn-danger btn-sm" onclick="deleteFight('${fight.id}')">Annuler</button>
                </div>
                <div class="fighters">
                    <div class="fighter">
                        <strong>${fight.fighter1.first_name} ${fight.fighter1.last_name}</strong>
                        <span class="weight">${fight.fighter1.weight} kg</span>
                        <span class="age">${fight.fighter1.age} ans</span>
                    </div>
                    <div class="vs">VS</div>
                    <div class="fighter">
                        <strong>${fight.fighter2.first_name} ${fight.fighter2.last_name}</strong>
                        <span class="weight">${fight.fighter2.weight} kg</span>
                        <span class="age">${fight.fighter2.age} ans</span>
                    </div>
                </div>
                <div class="fight-info">
                    <p class="fight-date"><strong>Date:</strong> ${formatDate(fight.fight_date)}</p>
                    <p class="fight-status"><strong>Statut:</strong> ${fight.status}</p>
                    ${fight.winner ? `<p class="fight-winner"><strong>Vainqueur:</strong> ${fight.winner.first_name} ${fight.winner.last_name}</p>` : ''}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading fights:', error);
        container.innerHTML = '<p class="error">Erreur lors du chargement des combats</p>';
    }
}

// Supprimer un combat
async function deleteFight(fightId) {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce combat ?')) {
        return;
    }
    
    try {
        const api = window.gymPowerAPI;
        const { data, error } = await api.deleteFight(fightId);
        
        if (error) throw new Error(error);
        
        alert('Combat annulé avec succès');
        loadFights(); // Recharger la liste
    } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
        alert('Erreur lors de l\'annulation du combat: ' + error.message);
    }
}

// Gestion des onglets admin
function setupAdminTabEvents() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Désactiver tous les onglets
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activer l'onglet sélectionné
            button.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Charger le contenu approprié
            switch(targetTab) {
                case 'users':
                    loadUsers();
                    break;
                case 'tournaments-admin':
                    loadAdminTournaments();
                    break;
                case 'fights':
                    loadFights();
                    break;
            }
        });
    });
}

// Gestion des modaux (fermeture)
document.addEventListener('DOMContentLoaded', () => {
    // Gérer la fermeture des modaux
    const closeButtons = document.querySelectorAll('.modal .close');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // Fermer les modaux en cliquant à l'extérieur
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
});

// Fonction utilitaire pour formater les dates
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
