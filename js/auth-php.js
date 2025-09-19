// auth.js - Gestion de l'authentification (PHP API Version)

// Wait for app.js to be loaded
document.addEventListener("DOMContentLoaded", () => {
    // Wait for API to be initialized
    const initAuth = () => {
        if (window.gymPowerAPI) {
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

async function handleLogin(e) {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
        alert("Veuillez remplir tous les champs");
        return;
    }

    try {
        const { data, error } = await window.gymPowerAPI.login(email, password);

        if (error) {
            throw new Error(error);
        }

        // Stocker les informations utilisateur
        window.currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        alert("Connexion réussie !");

        // Afficher l'application principale
        if (window.gymPower && window.gymPower.showMainApp) {
            window.gymPower.showMainApp();
        }

    } catch (error) {
        console.error("Erreur de connexion:", error);
        alert("Erreur de connexion: " + error.message);
    }
}

async function handleSignup(e) {
    const formData = {
        email: document.getElementById("signup-email").value,
        password: document.getElementById("signup-password").value,
        first_name: document.getElementById("signup-firstname").value,
        last_name: document.getElementById("signup-lastname").value,
        weight: parseInt(document.getElementById("signup-weight").value),
        age: parseInt(document.getElementById("signup-age").value)
    };

    // Validation des champs
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
        alert("Veuillez remplir tous les champs obligatoires");
        return;
    }

    if (formData.password.length < 6) {
        alert("Le mot de passe doit contenir au moins 6 caractères");
        return;
    }

    if (formData.weight <= 0 || formData.age <= 0) {
        alert("Le poids et l'âge doivent être des valeurs positives");
        return;
    }

    // Gérer l'upload de photo si un fichier est sélectionné
    const photoFile = document.getElementById("signup-photo").files[0];
    if (photoFile) {
        try {
            const { data: uploadResult, error: uploadError } = await window.gymPowerAPI.uploadFile(photoFile, 'profile');
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
        const { data, error } = await window.gymPowerAPI.signup(formData);

        if (error) {
            throw new Error(error);
        }

        // Stocker les informations utilisateur
        window.currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        alert("Inscription réussie ! Bienvenue !");

        // Afficher l'application principale
        if (window.gymPower && window.gymPower.showMainApp) {
            window.gymPower.showMainApp();
        }

    } catch (error) {
        console.error("Erreur d'inscription:", error);
        alert("Erreur d'inscription: " + error.message);
    }
}

// Fonction pour valider l'email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validation en temps réel
document.addEventListener("DOMContentLoaded", () => {
    // Validation email
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value && !validateEmail(input.value)) {
                input.setCustomValidity('Veuillez entrer une adresse email valide');
            } else {
                input.setCustomValidity('');
            }
        });
    });

    // Validation mot de passe
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.value.length < 6 && input.value.length > 0) {
                input.setCustomValidity('Le mot de passe doit contenir au moins 6 caractères');
            } else {
                input.setCustomValidity('');
            }
        });
    });

    // Validation poids et âge
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('input', () => {
            const value = parseInt(input.value);
            if (input.id.includes('weight') && value <= 0) {
                input.setCustomValidity('Le poids doit être supérieur à 0');
            } else if (input.id.includes('age') && (value <= 0 || value >= 120)) {
                input.setCustomValidity('L\'âge doit être entre 1 et 119 ans');
            } else {
                input.setCustomValidity('');
            }
        });
    });
});
