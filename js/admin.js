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
    const user = window.gymPower ? window.gymPower.getCurrentUser() : window.currentUser;
    if (!user || (user.email !== 'admin@admin.com' && user.id !== 'admin-id' && !user.isAdmin)) {
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
        if (!window.gymPower || !window.gymPower.supabase) {
            throw new Error('Base de données non disponible');
        }
        
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
    if (!container) {
        console.error('admin-tournaments-list container not found');
        return;
    }
    
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        if (!window.gymPower || !window.gymPower.supabase) {
            throw new Error('Base de données non disponible');
        }
        
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
            const participantCount = tournament.participants ? tournament.participants.length : 0;
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
                        ${tournament.participants ? tournament.participants.map(p => `
                            <span class="participant-badge">${p.users ? p.users.first_name + ' ' + p.users.last_name : 'Utilisateur supprimé'}</span>
                        `).join('') : ''}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = '<p class="error">Erreur lors du chargement des tournois: ' + error.message + '</p>';
        console.error('Erreur:', error);
    }
}

// Afficher le modal de création de tournoi
function showTournamentModal() {
    const modal = document.getElementById('tournament-modal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Setup modal close events
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => modal.classList.add('hidden');
        }
        
        // Close modal when clicking outside
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        };
    } else {
        console.error('Tournament modal not found');
    }
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
                users (id, first_name, last_name, weight, age)
            `)
            .eq('tournament_id', tournamentId);
            
        if (error) throw error;
        
        if (participants.length < 2) {
            alert('Il faut au moins 2 participants pour organiser des combats');
            return;
        }
        
        // Créer des paires de combattants avec le nouvel algorithme
        const fighters = participants.map(p => p.users);
        const fights = [];
        
        // Nouvel algorithme basé sur le poids et l'âge
        console.log('Recherche de combats compatibles basés sur le poids et l\'âge...');
        const matchingResult = findOptimalMatches(fighters);
        
        // Créer les combats pour les paires compatibles
        for (const match of matchingResult.matches) {
            const fightDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            fights.push({
                tournament_id: tournamentId,
                fighter1_id: match.fighter1.id,
                fighter2_id: match.fighter2.id,
                fight_date: fightDate
            });
            
            console.log(`Combat créé: ${match.fighter1.first_name} ${match.fighter1.last_name} (${match.fighter1.weight}kg, ${match.fighter1.age}ans) vs ${match.fighter2.first_name} ${match.fighter2.last_name} (${match.fighter2.weight}kg, ${match.fighter2.age}ans)`);
        }
        
        // Informer l'utilisateur des combattants non appariés
        if (matchingResult.unmatchedFighters.length > 0) {
            const unmatchedNames = matchingResult.unmatchedFighters.map(f => `${f.first_name} ${f.last_name} (${f.weight}kg, ${f.age}ans)`).join(', ');
            console.log(`Combattants non appariés (pas de compatibilité trouvée): ${unmatchedNames}`);
        }
        
        if (fights.length === 0) {
            if (matchingResult.unmatchedFighters.length > 0) {
                const unmatchedDetails = matchingResult.unmatchedFighters.map(f => `• ${f.first_name} ${f.last_name} (${f.weight}kg, ${f.age}ans)`).join('\n');
                alert(`Aucun combat n'a pu être organisé car aucun combattant ne respecte les critères de compatibilité (max 5kg et 3 ans de différence).\n\nCombattants inscrits:\n${unmatchedDetails}`);
            } else {
                alert('Impossible de créer des combats avec ce nombre de participants');
            }
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
        
        // Message de succès détaillé
        let successMessage = `${fights.length} combat(s) organisé(s) avec succès !`;
        if (matchingResult.unmatchedFighters.length > 0) {
            successMessage += `\n\nNote: ${matchingResult.unmatchedFighters.length} combattant(s) n'ont pas pu être appariés (critères de compatibilité non respectés).`;
        }
        alert(successMessage);
        loadFights(); // Recharger la liste des combats
        
    } catch (error) {
        console.error('Erreur lors de l\'organisation des combats:', error);
        alert('Erreur lors de l\'organisation des combats');
    }
}

// Helper function to check if two fighters are compatible for a fight
function areFightersCompatible(fighter1, fighter2) {
    // Check weight difference (maximum 5kg)
    const weightDiff = Math.abs(fighter1.weight - fighter2.weight);
    if (weightDiff > 5) {
        return false;
    }
    
    // Check age difference (maximum 3 years)
    const ageDiff = Math.abs(fighter1.age - fighter2.age);
    if (ageDiff > 3) {
        return false;
    }
    
    return true;
}

// Enhanced fight matching algorithm using weight and age criteria
function findOptimalMatches(fighters) {
    const matches = [];
    const used = new Set(); // Track fighters already matched
    
    for (let i = 0; i < fighters.length; i++) {
        if (used.has(i)) continue; // Skip already matched fighters
        
        const fighter1 = fighters[i];
        let bestMatch = null;
        let bestMatchIndex = -1;
        
        // Find the best compatible opponent for this fighter
        for (let j = i + 1; j < fighters.length; j++) {
            if (used.has(j)) continue; // Skip already matched fighters
            
            const fighter2 = fighters[j];
            
            // Check if fighters are compatible
            if (areFightersCompatible(fighter1, fighter2)) {
                bestMatch = fighter2;
                bestMatchIndex = j;
                break; // Take the first compatible match found
            }
        }
        
        // If we found a compatible match, create the pairing
        if (bestMatch) {
            matches.push({
                fighter1: fighter1,
                fighter2: bestMatch
            });
            used.add(i);
            used.add(bestMatchIndex);
        }
    }
    
    return {
        matches: matches,
        unmatchedFighters: fighters.filter((_, index) => !used.has(index))
    };
}

// Envoyer des notifications de combat
async function sendFightNotifications(fight) {
    try {
        // Récupérer les informations complètes des combattants
        const { data: fighter1 } = await window.gymPower.supabase()
            .from('users')
            .select('first_name, last_name, weight, age')
            .eq('id', fight.fighter1_id)
            .single();
            
        const { data: fighter2 } = await window.gymPower.supabase()
            .from('users')
            .select('first_name, last_name, weight, age')
            .eq('id', fight.fighter2_id)
            .single();
        
        // Calculer les différences de poids et d'âge
        const weightDiff = Math.abs(fighter1.weight - fighter2.weight);
        const ageDiff = Math.abs(fighter1.age - fighter2.age);
        
        // Formatage de la date avec heure
        const fightDateTime = new Date(fight.fight_date);
        const dateStr = fightDateTime.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const timeStr = fightDateTime.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Créer les notifications détaillées
        const notifications = [
            {
                user_id: fight.fighter1_id,
                title: '🥊 Nouveau combat programmé !',
                message: `Combat confirmé contre ${fighter2.first_name} ${fighter2.last_name}\n` +
                        `📊 Profil adversaire: ${fighter2.weight}kg, ${fighter2.age} ans\n` +
                        `⚖️ Différence de poids: ${weightDiff}kg\n` +
                        `📅 Date: ${dateStr}\n` +
                        `🕐 Heure: ${timeStr}\n` +
                        `Bonne chance pour votre combat !`,
                is_read: false
            },
            {
                user_id: fight.fighter2_id,
                title: '🥊 Nouveau combat programmé !',
                message: `Combat confirmé contre ${fighter1.first_name} ${fighter1.last_name}\n` +
                        `📊 Profil adversaire: ${fighter1.weight}kg, ${fighter1.age} ans\n` +
                        `⚖️ Différence de poids: ${weightDiff}kg\n` +
                        `📅 Date: ${dateStr}\n` +
                        `🕐 Heure: ${timeStr}\n` +
                        `Bonne chance pour votre combat !`,
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
    if (!container) {
        console.error('fights-list container not found');
        return;
    }
    
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        if (!window.gymPower || !window.gymPower.supabase) {
            throw new Error('Base de données non disponible');
        }
        
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
                    <h4>${fight.tournaments ? fight.tournaments.name : 'Tournoi supprimé'}</h4>
                    <button class="btn btn-danger btn-sm" onclick="deleteFight('${fight.id}')">Annuler</button>
                </div>
                <div class="fight-details">
                    <div class="fighters">
                        <div class="fighter">
                            <strong>${fight.fighter1 ? fight.fighter1.first_name + ' ' + fight.fighter1.last_name : 'Combattant supprimé'}</strong>
                            <span class="weight">${fight.fighter1 ? fight.fighter1.weight + ' kg' : 'N/A'}</span>
                        </div>
                        <div class="vs">VS</div>
                        <div class="fighter">
                            <strong>${fight.fighter2 ? fight.fighter2.first_name + ' ' + fight.fighter2.last_name : 'Combattant supprimé'}</strong>
                            <span class="weight">${fight.fighter2 ? fight.fighter2.weight + ' kg' : 'N/A'}</span>
                        </div>
                    </div>
                    <p class="fight-date"><strong>Date:</strong> ${formatDate(fight.fight_date)}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p class="error">Erreur lors du chargement des combats: ' + error.message + '</p>';
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
    console.log('Updating admin tab:', tabName);
    switchAdminTab(tabName);
}

// Setup admin tab events
function setupAdminTabEvents() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetTab = button.getAttribute('data-tab');
            switchAdminTab(targetTab);
            
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update tab content visibility
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });
}

// Switch admin tab and load appropriate content
function switchAdminTab(tabName) {
    console.log('Switching to admin tab:', tabName);
    
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
        default:
            console.error('Unknown admin tab:', tabName);
    }
}

// Show Add User Modal
function showAddUserModal() {
    const modal = document.getElementById('add-user-modal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Setup modal close events
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => modal.classList.add('hidden');
        }
        
        // Close modal when clicking outside
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        };
    } else {
        console.error('Add user modal not found');
    }
}

// Add User Function
async function addUser(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Get form data
    const userData = {
        first_name: form['add-user-firstname'].value.trim(),
        last_name: form['add-user-lastname'].value.trim(),
        email: form['add-user-email'].value.trim(),
        password: form['add-user-password'].value,
        weight: parseInt(form['add-user-weight'].value),
        age: parseInt(form['add-user-age'].value),
        photo: null // For now, we don't handle file upload
    };
    
    // Validation
    if (!userData.first_name || !userData.last_name || !userData.email || !userData.password) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    if (userData.password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
    }
    
    if (userData.weight <= 0 || userData.age <= 0 || userData.age > 120) {
        alert('Veuillez entrer des valeurs valides pour le poids et l\'âge');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        alert('Veuillez entrer un email valide');
        return;
    }
    
    submitBtn.textContent = 'Ajout en cours...';
    submitBtn.disabled = true;
    
    try {
        if (!window.gymPower || !window.gymPower.supabase) {
            throw new Error('Base de données non disponible');
        }
        
        // Check if email already exists
        const { data: existingUser } = await window.gymPower.supabase()
            .from('users')
            .select('email')
            .eq('email', userData.email)
            .single();
            
        if (existingUser) {
            throw new Error('Un utilisateur avec cet email existe déjà');
        }
        
        // Generate UUID for new user
        userData.id = crypto.randomUUID();
        
        // Insert new user
        const { error } = await window.gymPower.supabase()
            .from('users')
            .insert([userData]);
            
        if (error) throw error;
        
        alert('Utilisateur ajouté avec succès !');
        
        // Close modal and reset form
        document.getElementById('add-user-modal').classList.add('hidden');
        form.reset();
        
        // Reload users list
        loadUsers();
        
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
        alert('Erreur lors de l\'ajout: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Utility functions for admin panel
function formatDate(dateString) {
    if (!dateString) return 'Date non définie';
    
    try {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Date invalide';
    }
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

// Exposer les fonctions globalement
window.adminFunctions = {
    loadUsers,
    deleteUser,
    addUser,
    showAddUserModal,
    loadAdminTournaments,
    createTournament,
    showTournamentModal,
    deleteTournament,
    organizeFights,
    loadFights,
    deleteFight,
    sendCustomNotification,
    updateAdminTab,
    switchAdminTab,
    setupAdminTabEvents,
    formatDate,
    showLoading,
    showError,
    areFightersCompatible,
    findOptimalMatches
};

// Ajouter les fonctions au namespace global pour les utiliser dans le HTML
window.deleteUser = deleteUser;
window.deleteTournament = deleteTournament;
window.organizeFights = organizeFights;
window.deleteFight = deleteFight;
window.showAddUserModal = showAddUserModal;
window.showTournamentModal = showTournamentModal;

