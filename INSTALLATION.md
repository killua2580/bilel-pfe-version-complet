# Guide d'Installation - Gym Power (PHP Backend)

## 📋 Prérequis

### Serveur Web avec PHP
Vous avez plusieurs options pour installer un serveur web avec PHP:

#### Option 1: XAMPP (Recommandé pour débutants)
1. Téléchargez XAMPP depuis [https://www.apachefriends.org](https://www.apachefriends.org)
2. Installez XAMPP avec Apache, MySQL et PHP
3. Démarrez Apache et MySQL depuis le panneau de contrôle XAMPP

#### Option 2: WAMP (Windows uniquement)
1. Téléchargez WAMP depuis [http://www.wampserver.com](http://www.wampserver.com)
2. Installez et démarrez les services

#### Option 3: LARAGON (Moderne, Windows)
1. Téléchargez Laragon depuis [https://laragon.org](https://laragon.org)
2. Installez et démarrez les services

### Base de données MySQL
- MySQL 5.7+ ou MariaDB 10.3+
- Accès administrateur pour créer la base de données

## 🚀 Installation

### Étape 1: Préparer l'environnement

1. **Placez le projet dans le dossier web**
   - Pour XAMPP: `C:\xampp\htdocs\gym-power\`
   - Pour WAMP: `C:\wamp64\www\gym-power\`
   - Pour Laragon: `C:\laragon\www\gym-power\`

2. **Vérifiez que PHP fonctionne**
   - Ouvrez votre navigateur
   - Allez sur `http://localhost/gym-power/backend/`
   - Vous devriez voir un message d'API

### Étape 2: Configuration de la base de données

1. **Accédez à phpMyAdmin**
   - Ouvrez `http://localhost/phpmyadmin`
   - Connectez-vous (utilisateur: `root`, mot de passe: vide par défaut)

2. **Créez la base de données**
   ```sql
   CREATE DATABASE gym_power CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Importez le schéma**
   - Sélectionnez la base `gym_power`
   - Cliquez sur "Importer"
   - Sélectionnez le fichier `backend/database/schema.sql`
   - Cliquez sur "Exécuter"

### Étape 3: Configuration PHP

1. **Modifiez la configuration de la base de données**
   - Ouvrez `backend/config/database.php`
   - Modifiez si nécessaire:
     ```php
     private $host = 'localhost';
     private $db_name = 'gym_power';
     private $username = 'root';
     private $password = ''; // Changez si vous avez un mot de passe
     ```

2. **Vérifiez les extensions PHP**
   Assurez-vous que ces extensions sont activées dans `php.ini`:
   ```
   extension=pdo_mysql
   extension=mysqli
   extension=gd
   extension=fileinfo
   ```

### Étape 4: Test de l'installation

1. **Test de base**
   - Ouvrez `http://localhost/gym-power/test-api.html`
   - Cliquez sur "Tester la connexion"
   - Vous devriez voir un message de succès

2. **Test complet**
   - Testez l'inscription d'un utilisateur
   - Testez la connexion
   - Testez la récupération des tournois

## 🔧 Configuration avancée

### Sécurité en production

1. **Changez les mots de passe**
   - Modifiez le mot de passe MySQL
   - Mettez à jour `backend/config/database.php`

2. **Configurez HTTPS**
   - Utilisez un certificat SSL
   - Mettez à jour l'URL de base dans `js/api.js`

3. **Permissions des fichiers**
   ```bash
   # Dossier uploads accessible en écriture
   chmod 755 backend/uploads/
   chmod 644 backend/uploads/*
   ```

### Variables d'environnement

Créez un fichier `.env` dans le dossier `backend/`:
```env
DB_HOST=localhost
DB_NAME=gym_power
DB_USER=root
DB_PASSWORD=
API_BASE_URL=http://localhost/gym-power/backend/
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5242880
```

## 📊 Structure des dossiers

```
gym-power/
├── backend/
│   ├── api/           # Points d'entrée API
│   ├── config/        # Configuration
│   ├── database/      # Schéma et migrations
│   ├── models/        # Classes métier
│   ├── uploads/       # Fichiers uploadés
│   └── utils/         # Utilitaires
├── css/               # Styles
├── js/                # JavaScript frontend
└── index.html         # Page principale
```

## 🐛 Dépannage

### Erreurs communes

**"Database connection failed"**
- Vérifiez que MySQL est démarré
- Vérifiez les identifiants dans `database.php`
- Vérifiez que la base `gym_power` existe

**"CORS policy error"**
- Vérifiez que le fichier `.htaccess` est présent
- Assurez-vous que `mod_rewrite` est activé

**"File upload failed"**
- Vérifiez les permissions du dossier `uploads/`
- Vérifiez la configuration PHP (`upload_max_filesize`, `post_max_size`)

**"API endpoint not found"**
- Vérifiez que `mod_rewrite` est activé
- Vérifiez le fichier `.htaccess`

### Logs de débogage

1. **Logs PHP**
   - Activez les logs d'erreur dans `php.ini`
   - Consultez les logs dans le dossier `logs/` d'Apache

2. **Logs de l'application**
   - Les erreurs sont loggées dans les fichiers PHP
   - Utilisez la console développeur du navigateur

## 📞 Support

Pour toute question ou problème:
1. Vérifiez d'abord ce guide de dépannage
2. Consultez les logs d'erreur
3. Testez avec `test-api.html`

## 🔄 Migration depuis Supabase

Si vous migrez depuis l'ancienne version Supabase:

1. **Exportez vos données Supabase**
2. **Adaptez le format pour MySQL**
3. **Importez dans la nouvelle base**
4. **Testez toutes les fonctionnalités**

Le système PHP maintient une compatibilité complète avec l'ancienne version Supabase.
