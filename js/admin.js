// admin.js - Fonctionnalités d'administration

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
}

// Charger le panneau d'administration
async function loadAdminPanel() {
    // Vérifier si l'utilisateur est admin
    if (!currentUser || currentUser.email !== 'admin@admin.com') {
        document.getElementById('admin').innerHTML = '<div class="error">Accès non autorisé</div>';
        return;
    }
    
    // Charger les utilisateurs par défaut
    loadUsers();
}

// Gestion des utilisateurs
async function loadUsers() {
    const container = document.getElementById('users-list');
    showLoading('users-list');
    
    try {
        const { data, error } = await window.gymPower.supabase()
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
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
        showError('users-list', 'Erreur lors du chargement des utilisateurs');
        console.error('Erreur:', error);
    }
}

// Supprimer un utilisateur
async function deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
    }
    
    try {
        // Supprimer d'abord les participations
        await window.gymPower.supabase()
            .from('participants')
            .delete()
            .eq('user_id', userId);
            
        // Supprimer les combats
        await window.gymPower.supabase()
            .from('fights')
            .delete()
            .or(`fighter1_id.eq.${userId},fighter2_id.eq.${userId}`);
            
        // Supprimer les notifications
        await window.gymPower.supabase()
            .from('notifications')
            .delete()
            .eq('user_id', userId);
            
        // Supprimer l'utilisateur
        const { error } = await window.gymPower.supabase()
            .from('users')
            .delete()
            .eq('id', userId);
            
        if (error) throw error;
        
        alert('Utilisateur supprimé avec succès');
        loadUsers(); // Recharger la liste
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'utilisateur');
    }
}

// Gestion des tournois (admin)
async function loadAdminTournaments() {
    const container = document.getElementById('admin-tournaments-list');
    showLoading('admin-tournaments-list');
    
    try {
        const { data, error } = await window.gymPower.supabase()
            .from('tournaments')
            .select(`
                *,
                participants (
                    user_id,
                    users (first_name, last_name)
                )
            `)
            .order('date', { ascending: false });
            
        if (error) throw error;
        
        if (data.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>Aucun tournoi</h3><p>Aucun tournoi créé pour le moment.</p></div>';
            return;
        }
        
        container.innerHTML = data.map(tournament => {
            const participantCount = tournament.participants.length;
            const isPast = new Date(tournament.date) < new Date();
            
            return `
                <div class="card tournament-admin-card">
                    <div class="tournament-admin-header">
                        <h4>${tournament.name}</h4>
                        <div class="tournament-actions">
                            ${!isPast ? `<button class="btn btn-primary btn-sm" onclick="organizeFights('${tournament.id}')">Organiser combats</button>` : ''}
                            <button class="btn btn-danger btn-sm" onclick="deleteTournament('${tournament.id}')">Supprimer</button>
                        </div>
                    </div>
                    <p class="tournament-description">${tournament.description}</p>
                    <p><strong>Date:</strong> ${formatDate(tournament.date)}</p>
                    <p><strong>Participants:</strong> ${participantCount}</p>
                    <div class="participants-list">
                        ${tournament.participants.map(p => `
                            <span class="participant-badge">${p.users.first_name} ${p.users.last_name}</span>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        showError('admin-tournaments-list', 'Erreur lors du chargement des tournois');
        console.error('Erreur:', error);
    }
}

// Afficher le modal de création de tournoi
function showTournamentModal() {
    document.getElementById('tournament-modal').classList.remove('hidden');
}

// Créer un tournoi
async function createTournament(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Création...';
    submitBtn.disabled = true;
    
    try {
        const tournamentData = {
            name: form['tournament-name'].value,
            description: form['tournament-description'].value,
            date: form['tournament-date'].value,
            image: null // Pour l'instant, on ne gère pas l'upload d'images
        };
        
        const { error } = await window.gymPower.supabase()
            .from('tournaments')
            .insert([tournamentData]);
            
        if (error) throw error;
        
        alert('Tournoi créé avec succès !');
        form.reset();
        document.getElementById('tournament-modal').classList.add('hidden');
        loadAdminTournaments(); // Recharger la liste
        
    } catch (error) {
        console.error('Erreur lors de la création du tournoi:', error);
        alert('Erreur lors de la création du tournoi');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Supprimer un tournoi
async function deleteTournament(tournamentId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tournoi ? Toutes les participations et combats associés seront également supprimés.')) {
        return;
    }
    
    try {
        // Supprimer les combats
        await window.gymPower.supabase()
            .from('fights')
            .delete()
            .eq('tournament_id', tournamentId);
            
        // Supprimer les participations
        await window.gymPower.supabase()
            .from('participants')
            .delete()
            .eq('tournament_id', tournamentId);
            
        // Supprimer le tournoi
        const { error } = await window.gymPower.supabase()
            .from('tournaments')
            .delete()
            .eq('id', tournamentId);
            
        if (error) throw error;
        
        alert('Tournoi supprimé avec succès');
        loadAdminTournaments(); // Recharger la liste
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du tournoi');
    }
}

// Organiser les combats
async function organizeFights(tournamentId) {
    try {
        // Récupérer les participants du tournoi
        const { data: participants, error } = await window.gymPower.supabase()
            .from('participants')
            .select(`
                user_id,
                users (id, first_name, last_name, weight)
            `)
            .eq('tournament_id', tournamentId);
            
        if (error) throw error;
        
        if (participants.length < 2) {
            alert('Il faut au moins 2 participants pour organiser des combats');
            return;
        }
        
        // Créer des paires de combattants
        const fighters = participants.map(p => p.users);
        const fights = [];
        
        // Algorithme simple pour créer des paires
        for (let i = 0; i < fighters.length - 1; i += 2) {
            if (fighters[i + 1]) {
                fights.push({
                    tournament_id: tournamentId,
                    fighter1_id: fighters[i].id,
                    fighter2_id: fighters[i + 1].id,
                    fight_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Dans une semaine
                });
            }
        }
        
        if (fights.length === 0) {
            alert('Impossible de créer des combats avec ce nombre de participants');
            return;
        }
        
        // Insérer les combats
        const { error: insertError } = await window.gymPower.supabase()
            .from('fights')
            .insert(fights);
            
        if (insertError) throw insertError;
        
        // Envoyer des notifications aux combattants
        for (const fight of fights) {
            await sendFightNotifications(fight);
        }
        
        alert(`${fights.length} combat(s) organisé(s) avec succès !`);
        loadFights(); // Recharger la liste des combats
        
    } catch (error) {
        console.error('Erreur lors de l\'organisation des combats:', error);
        alert('Erreur lors de l\'organisation des combats');
    }
}

// Envoyer des notifications de combat
async function sendFightNotifications(fight) {
    try {
        // Récupérer les informations des combattants
        const { data: fighter1 } = await window.gymPower.supabase()
            .from('users')
            .select('first_name, last_name')
            .eq('id', fight.fighter1_id)
            .single();
            
        const { data: fighter2 } = await window.gymPower.supabase()
            .from('users')
            .select('first_name, last_name')
            .eq('id', fight.fighter2_id)
            .single();
        
        // Créer les notifications
        const notifications = [
            {
                user_id: fight.fighter1_id,
                title: 'Nouveau combat programmé',
                message: `Vous affronterez ${fighter2.first_name} ${fighter2.last_name} le ${formatDate(fight.fight_date)}`,
                is_read: false
            },
            {
                user_id: fight.fighter2_id,
                title: 'Nouveau combat programmé',
                message: `Vous affronterez ${fighter1.first_name} ${fighter1.last_name} le ${formatDate(fight.fight_date)}`,
                is_read: false
            }
        ];
        
        await window.gymPower.supabase()
            .from('notifications')
            .insert(notifications);
            
    } catch (error) {
        console.error('Erreur lors de l\'envoi des notifications:', error);
    }
}

// Charger les combats
async function loadFights() {
    const container = document.getElementById('fights-list');
    showLoading('fights-list');
    
    try {
        const { data, error } = await window.gymPower.supabase()
            .from('fights')
            .select(`
                *,
                tournaments (name),
                fighter1:users!fights_fighter1_id_fkey (first_name, last_name, weight),
                fighter2:users!fights_fighter2_id_fkey (first_name, last_name, weight)
            `)
            .order('fight_date', { ascending: true });
            
        if (error) throw error;
        
        if (data.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>Aucun combat</h3><p>Aucun combat organisé pour le moment.</p></div>';
            return;
        }
        
        container.innerHTML = data.map(fight => `
            <div class="card fight-card">
                <div class="fight-header">
                    <h4>${fight.tournaments.name}</h4>
                    <button class="btn btn-danger btn-sm" onclick="deleteFight('${fight.id}')">Annuler</button>
                </div>
                <div class="fight-details">
                    <div class="fighters">
                        <div class="fighter">
                            <strong>${fight.fighter1.first_name} ${fight.fighter1.last_name}</strong>
                            <span class="weight">${fight.fighter1.weight} kg</span>
                        </div>
                        <div class="vs">VS</div>
                        <div class="fighter">
                            <strong>${fight.fighter2.first_name} ${fight.fighter2.last_name}</strong>
                            <span class="weight">${fight.fighter2.weight} kg</span>
                        </div>
                    </div>
                    <p class="fight-date"><strong>Date:</strong> ${formatDate(fight.fight_date)}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showError('fights-list', 'Erreur lors du chargement des combats');
        console.error('Erreur:', error);
    }
}

// Supprimer un combat
async function deleteFight(fightId) {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce combat ?')) {
        return;
    }
    
    try {
        const { error } = await window.gymPower.supabase()
            .from('fights')
            .delete()
            .eq('id', fightId);
            
        if (error) throw error;
        
        alert('Combat annulé avec succès');
        loadFights(); // Recharger la liste
    } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
        alert('Erreur lors de l\'annulation du combat');
    }
}

// Envoyer une notification personnalisée
async function sendCustomNotification() {
    const userId = prompt('ID de l\'utilisateur:');
    const title = prompt('Titre de la notification:');
    const message = prompt('Message:');
    
    if (!userId || !title || !message) {
        alert('Tous les champs sont requis');
        return;
    }
    
    try {
        const { error } = await window.gymPower.supabase()
            .from('notifications')
            .insert([{
                user_id: userId,
                title: title,
                message: message,
                is_read: false
            }]);
            
        if (error) throw error;
        
        alert('Notification envoyée avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'envoi:', error);
        alert('Erreur lors de l\'envoi de la notification');
    }
}

// Mettre à jour les onglets admin
function updateAdminTab(tabName) {
    switch(tabName) {
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
}

// Exposer les fonctions globalement
window.adminFunctions = {
    loadUsers,
    deleteUser,
    loadAdminTournaments,
    createTournament,
    deleteTournament,
    organizeFights,
    loadFights,
    deleteFight,
    sendCustomNotification,
    updateAdminTab
};

// Ajouter les fonctions au namespace global pour les utiliser dans le HTML
window.deleteUser = deleteUser;
window.deleteTournament = deleteTournament;
window.organizeFights = organizeFights;
window.deleteFight = deleteFight;

