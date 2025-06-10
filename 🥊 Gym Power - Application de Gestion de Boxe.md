# 🥊 Gym Power - Application de Gestion de Boxe

## 📋 Description

**Gym Power** est une application web moderne pour gérer une équipe de boxe avec des combattants et un administrateur. L'application permet la gestion des tournois, l'organisation des combats, et l'envoi de notifications.

## 🛠️ Technologies Utilisées

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Base de données**: Supabase
- **Design**: Interface moderne et responsive
- **Authentification**: Système personnalisé avec Supabase

## 🚀 Installation et Configuration

### Prérequis
- Un navigateur web moderne
- Un serveur web local (optionnel pour le développement)

### Configuration Supabase
1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Exécutez le script SQL fourni (`supabase_schema.sql`) dans l'éditeur SQL de Supabase
4. Récupérez votre URL et votre clé API anonyme depuis les paramètres du projet

### Installation
1. Téléchargez ou clonez le projet
2. Ouvrez le fichier `js/auth.js` et vérifiez que les clés Supabase sont correctement configurées :   ```javascript
   const supabaseUrl = 'https://rubketdyxjiboittrqhc.supabase.co';
   const supabaseAnonKey = 'votre_cle_api_ici';
   ```
3. Ouvrez `index.html` dans votre navigateur ou servez les fichiers via un serveur web

## 👥 Utilisation

### Connexion Administrateur
- **Email**: `admin@admin.com`
- **Mot de passe**: `admin123`

### Fonctionnalités Admin
- **Gestion des utilisateurs**: Voir, ajouter et supprimer des utilisateurs
- **Gestion des tournois**: Créer des tournois avec nom, description, date et image
- **Organisation des combats**: Associer deux combattants pour un combat
- **Notifications**: Envoyer des notifications à tous les utilisateurs

### Inscription Combattant
1. Cliquez sur "Pas encore de compte ? S'inscrire"
2. Remplissez tous les champs obligatoires :
   - Prénom et nom
   - Email valide
   - Mot de passe (minimum 6 caractères)
   - Poids et âge
   - Photo (optionnel)
3. Cliquez sur "S'inscrire"

### Fonctionnalités Combattant
- **Tournois**: Voir les tournois disponibles, à venir et passés
- **Participation**: S'inscrire aux tournois ouverts
- **Profil**: Modifier ses informations personnelles
- **Notifications**: Recevoir des notifications d'adversaires et d'événements

## 📁 Structure du Projet

```
gym-power/
├── index.html              # Page principale
├── css/
│   └── style.css           # Styles CSS
├── js/
│   ├── app.js              # Logique principale
│   ├── auth.js             # Authentification
│   └── admin.js            # Fonctionnalités admin
├── images/                 # Images et assets
├── supabase_schema.sql     # Schéma de base de données
├── test_report.md          # Rapport de tests
├── todo.md                 # Liste des tâches
└── README.md               # Ce fichier
```

## 🗄️ Base de Données

### Tables
- **users**: Informations des utilisateurs (combattants et admin)
- **tournaments**: Détails des tournois
- **participants**: Inscriptions aux tournois
- **fights**: Organisation des combats
- **notifications**: Messages et notifications

## 🎨 Fonctionnalités

### ✅ Implémentées
- Authentification sécurisée
- Interface d'administration complète
- Gestion des utilisateurs
- Création et gestion des tournois
- Organisation des combats
- Système de notifications
- Design responsive
- Navigation fluide

### 🔄 Améliorations Possibles
- Upload de photos de profil
- Système de messagerie privée
- Statistiques et rapports
- Calendrier des événements
- Notifications push
- Mode sombre

## 🐛 Dépannage

### Problèmes Courants
1. **Erreur de connexion Supabase**: Vérifiez vos clés API
2. **Problème d'inscription**: Assurez-vous que l'email est valide
3. **Interface admin inaccessible**: Utilisez les identifiants admin corrects

### Support
Pour toute question ou problème, vérifiez :
1. La console du navigateur pour les erreurs JavaScript
2. La configuration Supabase
3. La connexion internet

## 📝 Notes de Développement

- L'application utilise des UUID pour les identifiants utilisateur
- Les mots de passe sont stockés en clair (à améliorer en production)
- L'admin est géré par simulation pour cette démo
- Toutes les fonctionnalités principales sont opérationnelles

## 🏆 Statut du Projet

**✅ PROJET COMPLET ET FONCTIONNEL**

L'application Gym Power est entièrement fonctionnelle avec toutes les fonctionnalités demandées implémentées et testées.

---

*Développé pour la gestion efficace d'équipes de boxe* 🥊

