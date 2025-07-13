// auth.js - Gestion de l'authentification

// Wait for app.js to be loaded
document.addEventListener("DOMContentLoaded", () => {
    // Wait for gymPower to be initialized
    const initAuth = () => {
        if (window.gymPower && window.gymPower.supabase) {
            setupAuthenticationHandlers();
        } else {
            setTimeout(initAuth, 100);
        }
    };
    initAuth();
});

function setupAuthenticationHandlers() {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const toggleAuthModeButton = document.getElementById("toggle-auth-mode");

    if (!loginForm || !signupForm || !toggleAuthModeButton) {
        console.error("Authentication form elements not found");
        return;
    }

    // Basculer entre connexion et inscription
    toggleAuthModeButton.addEventListener("click", () => {
        if (loginForm.classList.contains("hidden")) {
            loginForm.classList.remove("hidden");
            signupForm.classList.add("hidden");
            toggleAuthModeButton.textContent = "Pas encore de compte ? S'inscrire";
        } else {
            loginForm.classList.add("hidden");
            signupForm.classList.remove("hidden");
            toggleAuthModeButton.textContent = "Déjà un compte ? Se connecter";
        }
    });

    // Gestion de la connexion
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await handleLogin(e);
    });

    // Gestion de l'inscription
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await handleSignup(e);
    });
}

// Fonction pour définir l'utilisateur actuel
function setCurrentUser(userData) {
    window.currentUser = userData;
    if (window.gymPower) {
        window.gymPower.currentUser = userData;
    }
    
    // Stocker dans localStorage pour la persistance
    if (userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// Fonction pour récupérer l'utilisateur actuel
function getCurrentUser() {
    if (window.currentUser) {
        return window.currentUser;
    }
    
    // Essayer de récupérer depuis localStorage
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        try {
            const userData = JSON.parse(stored);
            setCurrentUser(userData);
            return userData;
        } catch (e) {
            console.error('Error parsing stored user data:', e);
            localStorage.removeItem('currentUser');
        }
    }
    
    return null;
}

async function handleLogin(e) {
    const form = e.target;
    const email = form["login-email"].value;
    const password = form["login-password"].value;
    
    if (!email || !password) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    // Désactiver le bouton pendant la connexion
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Connexion...';
    submitBtn.disabled = true;
    
    try {
        // Vérifier d'abord si c'est l'admin avec les identifiants par défaut
        if (email === 'admin@admin.com' && password === 'admin123') {
            // Créer un utilisateur admin
            const adminUser = {
                id: 'admin-id',
                email: 'admin@admin.com',
                profile: {
                    id: 'admin-id',
                    email: 'admin@admin.com',
                    first_name: 'Admin',
                    last_name: 'Gym Power',
                    weight: 75,
                    age: 30
                },
                isAdmin: true
            };
            
            // Stocker l'utilisateur admin
            setCurrentUser(adminUser);
            
            console.log('Connexion admin réussie');
            
            // Afficher l'application principale
            if (window.gymPower && window.gymPower.showMainApp) {
                window.gymPower.showMainApp();
            }
            
            // Réinitialiser le formulaire
            form.reset();
            return;
        }
        
        // Pour les autres utilisateurs, vérifier dans notre table users personnalisée
        if (!window.gymPower || !window.gymPower.supabase) {
            throw new Error('Base de données non disponible');
        }

        const { data: users, error: userError } = await window.gymPower.supabase()
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password) // Note: Dans une vraie app, il faudrait hasher les mots de passe
            .single();
            
        if (userError || !users) {
            throw new Error('Email ou mot de passe incorrect');
        }
        
        // Connexion réussie
        const userData = {
            id: users.id,
            email: users.email,
            profile: {
                id: users.id,
                first_name: users.first_name,
                last_name: users.last_name,
                email: users.email,
                weight: users.weight,
                age: users.age,
                photo: users.photo
            },
            isAdmin: false
        };
        
        setCurrentUser(userData);
        
        console.log("Connexion utilisateur réussie:", users.first_name, users.last_name);
        
        // Afficher l'application principale
        if (window.gymPower && window.gymPower.showMainApp) {
            window.gymPower.showMainApp();
        }
        
        // Réinitialiser le formulaire
        form.reset();
        
    } catch (error) {
        console.error('Erreur de connexion:', error);
        alert('Erreur de connexion: ' + error.message);
    } finally {
        // Réactiver le bouton
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleSignup(e) {
    const form = e.target;
    const email = form["signup-email"].value;
    const password = form["signup-password"].value;
    const firstName = form["signup-firstname"].value;
    const lastName = form["signup-lastname"].value;
    const weight = parseInt(form["signup-weight"].value);
    const age = parseInt(form["signup-age"].value);
    const photo = form["signup-photo"].files[0];
    
    // Validation des données
    if (!email || !password || !firstName || !lastName || !weight || !age) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    if (password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
    }
    
    if (weight <= 0 || age <= 0) {
        alert('Le poids et l\'âge doivent être des valeurs positives');
        return;
    }
    
    // Vérifier que l'email a un format valide
    if (!isValidEmail(email)) {
        alert('Veuillez entrer un email valide');
        return;
    }

    // Désactiver le bouton pendant l'inscription
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Inscription...';
    submitBtn.disabled = true;

    try {
        if (!window.gymPower || !window.gymPower.supabase) {
            throw new Error('Base de données non disponible');
        }

        // Vérifier si l'email existe déjà
        const { data: existingUser } = await window.gymPower.supabase()
            .from('users')
            .select('email')
            .eq('email', email)
            .maybeSingle();

        if (existingUser) {
            throw new Error('Un compte avec cet email existe déjà');
        }

        // Pour cette démo, on va créer l'utilisateur directement dans la base de données
        // sans passer par l'authentification Supabase
        const userId = crypto.randomUUID(); // Générer un UUID valide
        
        const { error: insertError } = await window.gymPower.supabase()
            .from('users')
            .insert([
                {
                    id: userId,
                    email: email,
                    password: password, // Note: Dans une vraie application, ne jamais stocker le mot de passe en clair
                    first_name: firstName,
                    last_name: lastName,
                    weight: weight,
                    age: age,
                    photo: null // Pour l'instant, on ne gère pas l'upload de photos
                }
            ]);
            
        if (insertError) throw insertError;

        console.log("Utilisateur inscrit avec l'ID:", userId);
        alert("Inscription réussie! Vous pouvez maintenant vous connecter avec votre email et mot de passe.");
        
        // Basculer vers le formulaire de connexion
        const signupForm = document.getElementById("signup-form");
        const loginForm = document.getElementById("login-form");
        const toggleAuthModeButton = document.getElementById("toggle-auth-mode");
        
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        toggleAuthModeButton.textContent = "Pas encore de compte ? S'inscrire";
        
        // Pré-remplir l'email dans le formulaire de connexion
        loginForm["login-email"].value = email;
        
        // Réinitialiser le formulaire
        form.reset();
        
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        alert('Erreur d\'inscription: ' + error.message);
    } finally {
        // Réactiver le bouton
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Fonction pour valider l'email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Fonction pour valider le mot de passe
function isValidPassword(password) {
    return password.length >= 6;
}

// Fonction de déconnexion
function logout() {
    setCurrentUser(null);
    
    // Rediriger vers la page d'authentification
    if (window.gymPower && window.gymPower.showAuthPage) {
        window.gymPower.showAuthPage();
    } else {
        // Fallback
        document.getElementById('main-header').classList.add('hidden');
        document.getElementById('auth').classList.remove('hidden');
        
        // Masquer toutes les autres pages
        const pages = document.querySelectorAll('.page:not(#auth)');
        pages.forEach(page => page.classList.add('hidden'));
    }
}

// Vérifier la session au chargement
function checkSession() {
    const user = getCurrentUser();
    if (user && window.gymPower && window.gymPower.showMainApp) {
        window.gymPower.showMainApp();
    }
}

// Exposer les fonctions globalement
window.authFunctions = {
    setCurrentUser,
    getCurrentUser,
    logout,
    checkSession,
    handleLogin,
    handleSignup
};

// Exposer logout globalement pour l'utiliser dans les liens de navigation
window.logout = logout;

