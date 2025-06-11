// auth.js - Gestion de l'authentification

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const toggleAuthModeButton = document.getElementById("toggle-auth-mode");

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
        const email = loginForm["login-email"].value;
        const password = loginForm["login-password"].value;
        
        // Désactiver le bouton pendant la connexion
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Connexion...';
        submitBtn.disabled = true;        try {
            // Vérifier d'abord si c'est l'admin avec les identifiants par défaut
            if (email === 'admin@admin.com' && password === 'admin123') {
                // Simuler une connexion admin réussie
                const adminUser = {
                    id: 'admin-id',
                    email: 'admin@admin.com',
                    profile: {
                        id: 'admin-id',
                        email: 'admin@admin.com',
                        first_name: 'Admin',
                        last_name: 'Gym Power',
                        weight: 0,
                        age: 0
                    }
                };
                
                // Stocker l'utilisateur admin
                window.currentUser = adminUser;
                
                alert('Connexion admin réussie!');
                
                // Afficher l'application principale
                if (window.gymPower && window.gymPower.showMainApp) {
                    window.gymPower.showMainApp();
                } else {
                    // Fallback si la fonction n'est pas encore disponible
                    setTimeout(() => {
                        document.getElementById('main-header').classList.remove('hidden');
                        document.getElementById('auth').classList.add('hidden');
                        document.getElementById('admin-nav').classList.remove('hidden');
                        document.getElementById('home').classList.remove('hidden');
                    }, 100);
                }
                
                // Réinitialiser le formulaire
                loginForm.reset();
                return;
            }
            
            // Pour les autres utilisateurs, vérifier dans notre table users personnalisée
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
            window.currentUser = {
                id: users.id,
                email: users.email,
                profile: {
                    first_name: users.first_name,
                    last_name: users.last_name,
                    email: users.email,
                    weight: users.weight,
                    age: users.age,
                    photo: users.photo
                }
            };
            
            console.log("Connexion utilisateur réussie:", users.first_name, users.last_name);
            
            // Afficher l'application principale
            if (window.gymPower && window.gymPower.showMainApp) {
                window.gymPower.showMainApp();
            } else {
                // Fallback si la fonction n'est pas encore disponible
                setTimeout(() => {
                    document.getElementById('main-header').classList.remove('hidden');
                    document.getElementById('auth').classList.add('hidden');
                    document.getElementById('home').classList.remove('hidden');
                }, 100);
            }
            
            // Réinitialiser le formulaire
            loginForm.reset();
            
        } catch (error) {
            console.error('Erreur de connexion:', error);
            alert('Erreur de connexion: ' + error.message);
        } finally {
            // Réactiver le bouton
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Gestion de l'inscription
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = signupForm["signup-email"].value;
        const password = signupForm["signup-password"].value;
        const firstName = signupForm["signup-firstname"].value;
        const lastName = signupForm["signup-lastname"].value;
        const weight = parseInt(signupForm["signup-weight"].value);
        const age = parseInt(signupForm["signup-age"].value);
        const photo = signupForm["signup-photo"].files[0];
        
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
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Inscription...';
        submitBtn.disabled = true;

        try {
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
            signupForm.classList.add("hidden");
            loginForm.classList.remove("hidden");
            toggleAuthModeButton.textContent = "Pas encore de compte ? S'inscrire";
            
            // Pré-remplir l'email dans le formulaire de connexion
            loginForm["login-email"].value = email;
            
            // Réinitialiser le formulaire
            signupForm.reset();
            
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            alert('Erreur d\'inscription: ' + error.message);
        } finally {
            // Réactiver le bouton
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});

// Fonction pour valider l'email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Fonction pour valider le mot de passe
function isValidPassword(password) {
    return password.length >= 6;
}

