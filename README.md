# 🥊 Gym Power - Application de Gestion de Boxe

## Vue d'ensemble

Gym Power est une application web moderne de gestion de club de boxe qui permet aux entraîneurs et administrateurs de gérer efficacement leurs équipes, organiser des tournois et suivre les performances des boxeurs.

## ✨ Fonctionnalités principales

### 🔐 Système d'authentification
- Inscription et connexion sécurisées
- Gestion des profils utilisateurs
- Système de rôles (Admin/Utilisateur)
- Protection des routes sensibles

### 🏆 Gestion des tournois
- Création et gestion de tournois
- Inscription des participants
- Upload d'images pour les tournois
- Suivi des statuts (Ouvert, En cours, Terminé)

### 🥊 Organisation des combats
- **Algorithme intelligent de matching** :
  - Différence de poids ≤ 5kg
  - Différence d'âge ≤ 3 ans
  - Éviter les combats en double
- Génération automatique des combats
- Gestion des résultats

### 🔔 Système de notifications
- Notifications automatiques pour les nouveaux combats
- Informations détaillées sur les adversaires
- Historique des notifications

### 👨‍💼 Panel d'administration
- Gestion des utilisateurs
- Supervision des tournois
- Statistiques et rapports
- Contrôle des combats

## 🛠️ Architecture technique

### Backend (PHP)
- **Architecture RESTful** avec endpoints API
- **Base de données MySQL** avec relations optimisées
- **Modèles MVC** pour une organisation claire
- **Sécurité** : validation des données, protection CSRF
- **Gestion des fichiers** : upload sécurisé d'images

### Frontend (JavaScript Vanilla)
- **Interface responsive** compatible mobile
- **AJAX** pour les interactions en temps réel
- **Gestion d'état** avec localStorage
- **UX moderne** avec feedback utilisateur

### Sécurité
- Hachage des mots de passe (bcrypt)
- Protection contre les injections SQL (PDO prepared statements)
- Validation côté serveur et client
- CORS configuré pour l'API

## 📁 Structure du projet

```
gym-power/
├── 📄 index.html              # Page principale
├── 📄 test-api.html           # Tests de l'API
├── 📄 verify-setup.php        # Vérification installation
├── 📄 INSTALLATION.md         # Guide d'installation
├── 📂 backend/                # Backend PHP
│   ├── 📄 index.php          # Router principal API
│   ├── 📄 setup.php          # Script d'installation BDD
│   ├── 📂 api/               # Endpoints API
│   │   ├── auth.php          # Authentification
│   │   ├── users.php         # Gestion utilisateurs
│   │   ├── tournaments.php   # Gestion tournois
│   │   ├── fights.php        # Gestion combats
│   │   ├── notifications.php # Notifications
│   │   └── upload.php        # Upload fichiers
│   ├── 📂 config/            # Configuration
│   │   ├── database.php      # Connexion BDD
│   │   └── config.php        # Config générale
│   ├── 📂 models/            # Modèles métier
│   │   ├── User.php          # Modèle utilisateur
│   │   ├── Tournament.php    # Modèle tournoi
│   │   ├── Fight.php         # Modèle combat
│   │   └── Notification.php  # Modèle notification
│   ├── 📂 database/          # Base de données
│   │   └── schema.sql        # Schéma MySQL
│   └── 📂 utils/             # Utilitaires
│       └── ApiUtils.php      # Helpers API
├── 📂 css/                   # Styles
│   └── style.css            # CSS principal
└── 📂 js/                    # JavaScript
    ├── api.js               # Interface API
    ├── app-php.js          # Logique principale
    ├── auth-php.js         # Authentification
    ├── admin-php.js        # Panel admin
    └── performance.js       # Optimisations
```

## 🚀 Installation rapide

### Prérequis
- Serveur web (Apache/Nginx) avec PHP 7.4+
- MySQL 5.7+ ou MariaDB 10.3+
- Extensions PHP : PDO, PDO_MySQL, GD, FileInfo

### Installation en 3 étapes

1. **Clonez le projet** dans votre dossier web
   ```bash
   # Pour XAMPP
   C:\xampp\htdocs\gym-power\
   
   # Pour WAMP  
   C:\wamp64\www\gym-power\
   ```

2. **Configurez la base de données**
   - Ouvrez phpMyAdmin
   - Créez la base `gym_power`
   - Importez `backend/database/schema.sql`

3. **Vérifiez l'installation**
   - Ouvrez `http://localhost/gym-power/verify-setup.php`
   - Suivez les instructions de correction si nécessaire

### Guide d'installation complet
Consultez [INSTALLATION.md](INSTALLATION.md) pour des instructions détaillées.

## 🎯 Utilisation

### Première connexion
1. Ouvrez `http://localhost/gym-power/`
2. Connectez-vous avec le compte admin créé automatiquement :
   - **Email** : `admin@gym-power.com`
   - **Mot de passe** : `admin123`

### Workflow typique
1. **Créer des utilisateurs** via le panel admin
2. **Organiser un tournoi** avec date et participants
3. **Générer les combats** automatiquement
4. **Suivre les notifications** et résultats

## 🔧 Configuration

### Configuration de base
Modifiez `backend/config/database.php` pour votre environnement :
```php
private $host = 'localhost';
private $db_name = 'gym_power';
private $username = 'root';
private $password = '';
```

### Configuration avancée
Créez un fichier `.env` pour la production :
```env
DB_HOST=localhost
DB_NAME=gym_power
DB_USER=your_user
DB_PASSWORD=your_password
API_BASE_URL=https://yourdomain.com/gym-power/backend/
```

## 🧪 Tests et validation

### Tests automatisés
- Ouvrez `test-api.html` pour tester les endpoints
- Utilisez `verify-setup.php` pour valider l'installation

### Tests manuels
1. **Authentification** : inscription/connexion
2. **Tournois** : création, participation
3. **Combats** : génération, résultats
4. **Admin** : gestion utilisateurs, supervision

## 📊 API Documentation

### Endpoints principaux

#### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/signup` - Inscription

#### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/{id}` - Profil utilisateur
- `PUT /api/users/{id}` - Mise à jour profil

#### Tournois
- `GET /api/tournaments` - Liste des tournois
- `POST /api/tournaments` - Créer un tournoi
- `POST /api/tournaments/{id}/participate` - Participer

#### Combats
- `GET /api/fights/tournament/{id}` - Combats d'un tournoi
- `POST /api/fights/generate/{tournament_id}` - Générer combats
- `PUT /api/fights/{id}/result` - Enregistrer résultat

## 🔒 Sécurité

### Mesures implémentées
- **Authentification** : Sessions PHP sécurisées
- **Mots de passe** : Hachage bcrypt
- **SQL** : Requêtes préparées PDO
- **Uploads** : Validation type/taille fichiers
- **CORS** : Headers configurés

### Bonnes pratiques
- Changez les mots de passe par défaut
- Utilisez HTTPS en production
- Sauvegardez régulièrement la base de données
- Surveillez les logs d'erreur

## 🚀 Migration depuis Supabase

Cette version PHP remplace complètement l'ancienne version Supabase tout en maintenant :
- ✅ **100% des fonctionnalités** originales
- ✅ **Interface utilisateur** identique
- ✅ **Algorithme de combat** intelligent
- ✅ **Système de notifications** complet
- ✅ **Panel d'administration** avancé

### Avantages de la version PHP
- 🏠 **Hébergement local** : contrôle total
- 💰 **Coût réduit** : pas d'abonnement cloud
- ⚡ **Performance** : optimisations locales
- 🔧 **Personnalisation** : code source modifiable

## 🐛 Dépannage

### Problèmes courants

**❌ "Database connection failed"**
- Vérifiez MySQL/Apache sont démarrés
- Vérifiez les identifiants dans `database.php`

**❌ "API endpoint not found"**
- Vérifiez que `mod_rewrite` est activé
- Vérifiez le fichier `.htaccess`

**❌ "File upload failed"**
- Vérifiez permissions dossier `uploads/`
- Vérifiez `upload_max_filesize` dans PHP

### Support
1. Consultez `verify-setup.php` pour un diagnostic complet
2. Vérifiez les logs d'erreur PHP
3. Testez avec `test-api.html`

## 👥 Contributeurs

- **Développement initial** : Version Supabase
- **Migration PHP** : Backend complet avec API RESTful
- **Optimisations** : Performance et sécurité

## 📄 Licence

Ce projet est développé pour la gestion de clubs de boxe.

---

**🥊 Gym Power - Gérez votre équipe de boxe efficacement !**
