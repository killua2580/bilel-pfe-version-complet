# 🥊 Documentation Technique Complète - Gym Power
## Projet de Fin d'Études - Application de Gestion de Club de Boxe

---

### 📋 Informations du Projet

**Titre :** Gym Power - Application Web de Gestion de Club de Boxe  
**Type :** Projet de Fin d'Études (PFE)  
**Technologies :** PHP, MySQL, JavaScript, HTML5, CSS3  
**Architecture :** Backend PHP avec API RESTful + Frontend JavaScript  
**Date de Développement :** 2025  
**Auteur :** [Votre Nom]  

---

## 📖 Table des Matières

1. [Vue d'Ensemble du Projet](#vue-densemble-du-projet)
2. [Analyse des Besoins](#analyse-des-besoins)
3. [Architecture Technique](#architecture-technique)
4. [Base de Données](#base-de-données)
5. [Backend PHP](#backend-php)
6. [Frontend JavaScript](#frontend-javascript)
7. [Fonctionnalités Détaillées](#fonctionnalités-détaillées)
8. [Sécurité](#sécurité)
9. [Interface Utilisateur](#interface-utilisateur)
10. [Tests et Validation](#tests-et-validation)
11. [Déploiement](#déploiement)
12. [Conclusions et Perspectives](#conclusions-et-perspectives)

---

## 1. Vue d'Ensemble du Projet

### 1.1 Contexte et Problématique

Dans le domaine sportif, particulièrement en boxe, la gestion manuelle des équipes, tournois et combats représente un défi majeur pour les clubs. Les entraîneurs et gestionnaires font face à plusieurs problématiques :

- **Gestion dispersée des informations** : Les données des boxeurs, tournois et combats sont souvent stockées dans des fichiers Excel ou documents papier
- **Organisation complexe des combats** : L'appariement des boxeurs selon les critères de poids, âge et expérience nécessite un calcul manuel fastidieux
- **Suivi difficile des performances** : L'absence d'un système centralisé complique le suivi des progressions individuelles
- **Communication inefficace** : L'information sur les nouveaux combats et événements circule mal entre les membres

### 1.2 Objectifs du Projet

L'application **Gym Power** a été conçue pour répondre à ces défis en offrant :

#### Objectifs Fonctionnels
- **Centralisation des données** : Regrouper toutes les informations des boxeurs, tournois et combats dans une base de données unique
- **Automatisation intelligente** : Implémenter un algorithme de matching automatique pour l'organisation des combats
- **Interface intuitive** : Proposer une interface web moderne et accessible depuis tout appareil
- **Système de notifications** : Informer automatiquement les boxeurs des nouveaux combats assignés
- **Gestion multi-rôles** : Distinguer les fonctionnalités selon le profil utilisateur (admin/boxeur)

#### Objectifs Techniques
- **Performance optimisée** : Assurer des temps de réponse rapides même avec de nombreux utilisateurs
- **Sécurité renforcée** : Protéger les données personnelles et empêcher les accès non autorisés
- **Évolutivité** : Concevoir une architecture permettant l'ajout facile de nouvelles fonctionnalités
- **Maintenabilité** : Structurer le code pour faciliter les modifications et corrections futures

### 1.3 Valeur Ajoutée

L'application apporte plusieurs innovations dans la gestion des clubs de boxe :

- **Algorithme de matching intelligent** : Premier système automatisé prenant en compte poids, âge et disponibilité
- **Interface unifiée** : Combinaison des fonctions de gestion et de participation dans une seule application
- **Notifications en temps réel** : Système de communication automatique avec les boxeurs
- **Flexibilité d'hébergement** : Solution entièrement autonome sans dépendance à des services cloud externes

---

## 2. Analyse des Besoins

### 2.1 Acteurs du Système

#### 2.1.1 Administrateur (Entraîneur/Gestionnaire)
**Rôle :** Gestion complète du club et organisation des activités

**Besoins fonctionnels :**
- Créer et gérer les profils des boxeurs (nom, prénom, poids, âge, photo)
- Organiser des tournois avec dates, descriptions et images
- Générer automatiquement les combats selon des critères intelligents
- Superviser les résultats des combats
- Consulter les statistiques et rapports d'activité
- Gérer les notifications envoyées aux boxeurs

**Besoins non-fonctionnels :**
- Interface d'administration claire et efficace
- Accès sécurisé avec authentification renforcée
- Possibilité de modification/suppression des données
- Export des données pour archivage

#### 2.1.2 Boxeur (Utilisateur Standard)
**Rôle :** Participation aux tournois et suivi de ses combats

**Besoins fonctionnels :**
- Consulter la liste des tournois disponibles
- S'inscrire/se désinscrire des tournois
- Visualiser ses combats programmés avec détails des adversaires
- Mettre à jour son profil personnel (poids, photo)
- Recevoir des notifications pour nouveaux combats
- Consulter l'historique de ses participations

**Besoins non-fonctionnels :**
- Interface simple et intuitive
- Accès rapide aux informations essentielles
- Notifications claires et informatives
- Compatibilité mobile pour consultation nomade

### 2.2 Exigences Techniques

#### 2.2.1 Exigences Fonctionnelles Détaillées

**RF01 - Gestion des Utilisateurs**
- Le système doit permettre l'inscription de nouveaux boxeurs
- Le système doit authentifier les utilisateurs par email/mot de passe
- Le système doit distinguer les rôles administrateur et boxeur
- Le système doit permettre la modification des profils utilisateurs

**RF02 - Gestion des Tournois**
- Le système doit permettre la création de tournois avec métadonnées complètes
- Le système doit gérer l'inscription/désinscription des participants
- Le système doit supporter l'upload d'images pour les tournois
- Le système doit gérer les statuts de tournois (Ouvert, En cours, Terminé)

**RF03 - Organisation des Combats**
- Le système doit implémenter un algorithme de matching automatique
- Le système doit respecter les contraintes de poids (≤ 5kg de différence)
- Le système doit respecter les contraintes d'âge (≤ 3 ans de différence)
- Le système doit éviter les doublons de combats
- Le système doit permettre la modification manuelle des appariements

**RF04 - Système de Notifications**
- Le système doit notifier automatiquement les nouveaux combats
- Le système doit inclure les détails de l'adversaire dans les notifications
- Le système doit permettre la consultation de l'historique des notifications
- Le système doit marquer les notifications comme lues/non lues

#### 2.2.2 Exigences Non-Fonctionnelles

**RNF01 - Performance**
- Temps de réponse ≤ 2 secondes pour les requêtes standard
- Support de 100 utilisateurs simultanés minimum
- Algorithme de matching exécutable en ≤ 5 secondes pour 50 participants

**RNF02 - Sécurité**
- Hachage des mots de passe avec algorithme bcrypt
- Protection contre les injections SQL via requêtes préparées
- Validation de tous les inputs côté serveur
- Sessions sécurisées avec timeout automatique

**RNF03 - Compatibilité**
- Support des navigateurs modernes (Chrome, Firefox, Edge, Safari)
- Interface responsive compatible mobile et tablette
- Compatibilité serveur LAMP (Linux, Apache, MySQL, PHP)

**RNF04 - Maintenabilité**
- Code structuré selon le pattern MVC
- Documentation technique complète
- Logs d'erreurs détaillés pour debugging
- Configuration centralisée et modulaire

---

## 3. Architecture Technique

### 3.1 Architecture Globale

L'application suit une **architecture 3-tiers** classique adaptée aux applications web modernes :

```
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   HTML5/CSS3    │  │   JavaScript    │  │  Interface  │ │
│  │   Responsive    │  │    Vanilla      │  │ Utilisateur │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │ HTTP/AJAX
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE MÉTIER                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   API RESTful   │  │   Modèles PHP   │  │  Contrôleurs│ │
│  │   (JSON)        │  │   (Classes)     │  │   (Logic)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │ PDO
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE DONNÉES                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Base MySQL     │  │   Fichiers      │  │   Sessions  │ │
│  │   (Tables)      │  │   (Uploads)     │  │   (Auth)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Patterns de Conception Utilisés

#### 3.2.1 Pattern MVC (Modèle-Vue-Contrôleur)
- **Modèles** (`backend/models/`) : Classes métier gérant la logique de données
- **Vues** (`index.html`, CSS) : Interface utilisateur et présentation
- **Contrôleurs** (`backend/api/`) : Endpoints gérant les requêtes HTTP

#### 3.2.2 Pattern Repository
Chaque modèle encapsule l'accès aux données :
```php
class User {
    private $conn;
    
    public function findById($id) { /* SQL Logic */ }
    public function create($data) { /* Insert Logic */ }
    public function update($id, $data) { /* Update Logic */ }
}
```

#### 3.2.3 Pattern Singleton (Base de données)
Connexion unique partagée entre tous les modèles :
```php
class Database {
    private static $instance = null;
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
}
```

### 3.3 Stack Technologique

#### 3.3.1 Backend
- **Langage :** PHP 7.4+ (Programmation orientée objet)
- **Base de données :** MySQL 5.7+ (Système relationnel)
- **Serveur web :** Apache 2.4+ (avec mod_rewrite)
- **API :** RESTful JSON (Standards HTTP)

#### 3.3.2 Frontend
- **Structure :** HTML5 sémantique
- **Styles :** CSS3 avec Flexbox/Grid
- **Logique :** JavaScript ES6+ Vanilla
- **Communication :** Fetch API pour AJAX

#### 3.3.3 Outils de Développement
- **IDE :** Visual Studio Code
- **Serveur local :** XAMPP/WAMP
- **Base de données :** phpMyAdmin
- **Versioning :** Git
- **Testing :** Tests manuels + Scripts de validation

---

## 4. Base de Données

### 4.1 Modèle Conceptuel de Données (MCD)

```
┌─────────────────┐         ┌─────────────────┐
│      USERS      │         │   TOURNAMENTS   │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │    ┌────│ id (PK)         │
│ email (UNIQUE)  │    │    │ name            │
│ password_hash   │    │    │ description     │
│ first_name      │    │    │ date            │
│ last_name       │    │    │ image           │
│ weight          │    │    │ status          │
│ birth_date      │    │    │ created_at      │
│ photo           │    │    └─────────────────┘
│ is_admin        │    │              │
│ created_at      │    │              │ participates
└─────────────────┘    │              ▼
         │              │    ┌─────────────────┐
         │              └────│  PARTICIPANTS   │
         │ fights_as         ├─────────────────┤
         │ player1/2         │ id (PK)         │
         ▼                   │ tournament_id   │
┌─────────────────┐         │ user_id         │
│     FIGHTS      │         │ joined_at       │
├─────────────────┤         └─────────────────┘
│ id (PK)         │                   │
│ tournament_id   │                   │
│ player1_id      │◄──────────────────┘
│ player2_id      │
│ result          │         ┌─────────────────┐
│ created_at      │         │ NOTIFICATIONS   │
└─────────────────┘         ├─────────────────┤
                            │ id (PK)         │
                            │ user_id         │
                            │ message         │
                            │ type            │
                            │ is_read         │
                            │ created_at      │
                            └─────────────────┘
```

### 4.2 Structure Détaillée des Tables

#### 4.2.1 Table `users`
**Objectif :** Stockage des informations des boxeurs et administrateurs

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    birth_date DATE NOT NULL,
    photo TEXT DEFAULT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Contraintes métier :**
- Email unique pour éviter les doublons
- Poids stocké avec 2 décimales pour précision
- Photo stockée comme URL ou chemin fichier
- Indicateur admin pour gestion des permissions

#### 4.2.2 Table `tournaments`
**Objectif :** Gestion des compétitions et événements

```sql
CREATE TABLE tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    image TEXT DEFAULT NULL,
    status ENUM('open', 'in_progress', 'completed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**États possibles :**
- `open` : Inscriptions ouvertes
- `in_progress` : Combats en cours
- `completed` : Tournoi terminé

#### 4.2.3 Table `participants`
**Objectif :** Association boxeurs-tournois avec historique

```sql
CREATE TABLE participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participation (tournament_id, user_id)
);
```

**Contraintes :**
- Clé composite pour éviter double inscription
- Suppression en cascade pour cohérence

#### 4.2.4 Table `fights`
**Objectif :** Organisation et résultats des combats

```sql
CREATE TABLE fights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    player1_id INT NOT NULL,
    player2_id INT NOT NULL,
    result VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Résultats possibles :**
- `player1_wins` : Victoire joueur 1
- `player2_wins` : Victoire joueur 2
- `draw` : Match nul
- `NULL` : Combat pas encore disputé

#### 4.2.5 Table `notifications`
**Objectif :** Communication avec les boxeurs

```sql
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Types de notifications :**
- `fight_assigned` : Nouveau combat assigné
- `tournament_update` : Mise à jour tournoi
- `system` : Information système

### 4.3 Optimisations et Index

#### 4.3.1 Index de Performance
```sql
-- Index pour requêtes fréquentes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_participants_tournament ON participants(tournament_id);
CREATE INDEX idx_fights_tournament ON fights(tournament_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
```

#### 4.3.2 Contraintes d'Intégrité
- **Intégrité référentielle** : Toutes les clés étrangères avec CASCADE
- **Contraintes de domaine** : ENUM pour statuts, BOOLEAN pour flags
- **Contraintes d'unicité** : Email utilisateur, participation tournoi

---

## 5. Backend PHP

### 5.1 Architecture du Backend

Le backend suit une architecture modulaire avec séparation claire des responsabilités :

```
backend/
├── index.php              # Point d'entrée principal et routeur
├── .htaccess              # Configuration Apache (URL rewriting)
├── api/                   # Endpoints RESTful
│   ├── auth.php          # Authentification (login/signup)
│   ├── users.php         # CRUD utilisateurs
│   ├── tournaments.php   # CRUD tournois + participations
│   ├── fights.php        # Organisation combats + algorithme
│   ├── notifications.php # Système notifications
│   └── upload.php        # Gestion fichiers
├── config/               # Configuration système
│   ├── database.php     # Connexion base données
│   └── config.php       # Paramètres généraux
├── models/              # Classes métier (OOP)
│   ├── User.php        # Modèle utilisateur
│   ├── Tournament.php  # Modèle tournoi
│   ├── Fight.php       # Modèle combat
│   └── Notification.php # Modèle notification
├── database/           # Scripts SQL
│   └── schema.sql     # Schéma complet
└── utils/             # Utilitaires partagés
    └── ApiUtils.php   # Helpers API
```

### 5.2 Point d'Entrée et Routage

#### 5.2.1 Fichier `index.php`
```php
<?php
// Configuration CORS pour frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Gestion requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Routage basé sur URL
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/gym-power/backend';

// Extraction du endpoint
if (strpos($request_uri, $base_path . '/api/') === 0) {
    $endpoint = substr($request_uri, strlen($base_path . '/api/'));
    $endpoint = explode('?', $endpoint)[0]; // Supprime query string
    
    switch ($endpoint) {
        case '/auth':
            require_once 'api/auth.php';
            break;
        case '/users':
            require_once 'api/users.php';
            break;
        case '/tournaments':
            require_once 'api/tournaments.php';
            break;
        case '/fights':
            require_once 'api/fights.php';
            break;
        case '/notifications':
            require_once 'api/notifications.php';
            break;
        case '/upload':
            require_once 'api/upload.php';
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint non trouvé']);
    }
} else {
    // Page d'accueil API
    echo json_encode([
        'message' => 'Gym Power API v1.0',
        'endpoints' => [
            'auth' => '/api/auth',
            'users' => '/api/users',
            'tournaments' => '/api/tournaments',
            'fights' => '/api/fights',
            'notifications' => '/api/notifications',
            'upload' => '/api/upload'
        ]
    ]);
}
?>
```

### 5.3 Modèles Métier

#### 5.3.1 Modèle User (`models/User.php`)

```php
<?php
class User {
    private $conn;
    private $table = 'users';
    
    public function __construct($database) {
        $this->conn = $database;
    }
    
    /**
     * Authentification utilisateur
     */
    public function authenticate($email, $password) {
        $query = "SELECT id, email, password_hash, first_name, last_name, 
                         weight, birth_date, photo, is_admin 
                  FROM " . $this->table . " 
                  WHERE email = :email LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Vérification mot de passe
            if (password_verify($password, $user['password_hash'])) {
                unset($user['password_hash']); // Sécurité
                return $user;
            }
        }
        
        return false;
    }
    
    /**
     * Création nouvel utilisateur
     */
    public function create($data) {
        // Validation données
        if (!$this->validateUserData($data)) {
            throw new Exception("Données utilisateur invalides");
        }
        
        // Vérification email unique
        if ($this->emailExists($data['email'])) {
            throw new Exception("Email déjà utilisé");
        }
        
        $query = "INSERT INTO " . $this->table . " 
                  (email, password_hash, first_name, last_name, weight, birth_date, photo, is_admin) 
                  VALUES (:email, :password_hash, :first_name, :last_name, :weight, :birth_date, :photo, :is_admin)";
        
        $stmt = $this->conn->prepare($query);
        
        // Hachage sécurisé du mot de passe
        $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password_hash', $password_hash);
        $stmt->bindParam(':first_name', $data['firstName']);
        $stmt->bindParam(':last_name', $data['lastName']);
        $stmt->bindParam(':weight', $data['weight']);
        $stmt->bindParam(':birth_date', $data['birthDate']);
        $stmt->bindParam(':photo', $data['photo']);
        $stmt->bindParam(':is_admin', $data['isAdmin']);
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        throw new Exception("Erreur lors de la création");
    }
    
    /**
     * Validation des données utilisateur
     */
    private function validateUserData($data) {
        // Email valide
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return false;
        }
        
        // Mot de passe minimum 6 caractères
        if (strlen($data['password']) < 6) {
            return false;
        }
        
        // Poids positif
        if ($data['weight'] <= 0 || $data['weight'] > 200) {
            return false;
        }
        
        // Date de naissance valide
        $date = DateTime::createFromFormat('Y-m-d', $data['birthDate']);
        if (!$date || $date->format('Y-m-d') !== $data['birthDate']) {
            return false;
        }
        
        return true;
    }
}
?>
```

#### 5.3.2 Modèle Fight avec Algorithme Intelligent

```php
<?php
class Fight {
    private $conn;
    private $table = 'fights';
    
    /**
     * Algorithme de matching intelligent pour l'organisation des combats
     */
    public function organizeFights($tournament_id) {
        // Récupération des participants
        $participants = $this->getTournamentParticipants($tournament_id);
        
        if (count($participants) < 2) {
            throw new Exception("Pas assez de participants pour organiser des combats");
        }
        
        $fights = [];
        $matched = [];
        
        foreach ($participants as $i => $participant1) {
            if (in_array($participant1['id'], $matched)) {
                continue; // Déjà apparié
            }
            
            $bestMatch = null;
            $bestScore = -1;
            
            // Recherche du meilleur adversaire
            foreach ($participants as $j => $participant2) {
                if ($i === $j || in_array($participant2['id'], $matched)) {
                    continue;
                }
                
                $score = $this->calculateMatchScore($participant1, $participant2);
                
                if ($score > $bestScore && $this->isValidMatch($participant1, $participant2)) {
                    $bestMatch = $participant2;
                    $bestScore = $score;
                }
            }
            
            if ($bestMatch) {
                // Création du combat
                $fight = $this->createFight($tournament_id, $participant1['id'], $bestMatch['id']);
                $fights[] = $fight;
                
                // Marquer comme appariés
                $matched[] = $participant1['id'];
                $matched[] = $bestMatch['id'];
                
                // Notifications automatiques
                $this->sendFightNotifications($fight, $participant1, $bestMatch);
            }
        }
        
        return [
            'fights_created' => count($fights),
            'participants_matched' => count($matched),
            'unmatched_participants' => count($participants) - count($matched),
            'fights' => $fights
        ];
    }
    
    /**
     * Calcul du score de compatibilité entre deux boxeurs
     */
    private function calculateMatchScore($participant1, $participant2) {
        $score = 100; // Score de base
        
        // Pénalité pour différence de poids
        $weightDiff = abs($participant1['weight'] - $participant2['weight']);
        $score -= $weightDiff * 10; // -10 points par kg de différence
        
        // Pénalité pour différence d'âge
        $age1 = $this->calculateAge($participant1['birth_date']);
        $age2 = $this->calculateAge($participant2['birth_date']);
        $ageDiff = abs($age1 - $age2);
        $score -= $ageDiff * 5; // -5 points par année de différence
        
        return max(0, $score); // Score minimum = 0
    }
    
    /**
     * Validation des critères de match
     */
    private function isValidMatch($participant1, $participant2) {
        // Différence de poids ≤ 5kg
        $weightDiff = abs($participant1['weight'] - $participant2['weight']);
        if ($weightDiff > 5) {
            return false;
        }
        
        // Différence d'âge ≤ 3 ans
        $age1 = $this->calculateAge($participant1['birth_date']);
        $age2 = $this->calculateAge($participant2['birth_date']);
        $ageDiff = abs($age1 - $age2);
        if ($ageDiff > 3) {
            return false;
        }
        
        // Pas de combat existant entre ces participants
        if ($this->fightExists($participant1['id'], $participant2['id'])) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Envoi notifications automatiques pour nouveau combat
     */
    private function sendFightNotifications($fight, $participant1, $participant2) {
        require_once 'Notification.php';
        $notification = new Notification($this->conn);
        
        // Notification pour participant 1
        $message1 = "Nouveau combat assigné ! Votre adversaire : " . 
                   $participant2['first_name'] . " " . $participant2['last_name'] . 
                   " (Poids: " . $participant2['weight'] . "kg, " . 
                   $this->calculateAge($participant2['birth_date']) . " ans)";
        
        $notification->create([
            'user_id' => $participant1['id'],
            'message' => $message1,
            'type' => 'fight_assigned'
        ]);
        
        // Notification pour participant 2
        $message2 = "Nouveau combat assigné ! Votre adversaire : " . 
                   $participant1['first_name'] . " " . $participant1['last_name'] . 
                   " (Poids: " . $participant1['weight'] . "kg, " . 
                   $this->calculateAge($participant1['birth_date']) . " ans)";
        
        $notification->create([
            'user_id' => $participant2['id'],
            'message' => $message2,
            'type' => 'fight_assigned'
        ]);
    }
}
?>
```

### 5.4 API RESTful

#### 5.4.1 Structure des Endpoints

Chaque endpoint suit les conventions REST :

| Méthode | Endpoint | Description | Paramètres |
|---------|----------|-------------|------------|
| POST | `/api/auth?action=login` | Connexion utilisateur | email, password |
| POST | `/api/auth?action=signup` | Inscription utilisateur | userData |
| GET | `/api/users` | Liste utilisateurs | - |
| GET | `/api/users?id={id}` | Utilisateur spécifique | id |
| POST | `/api/users` | Créer utilisateur | userData |
| PUT | `/api/users?id={id}` | Modifier utilisateur | id, userData |
| DELETE | `/api/users?id={id}` | Supprimer utilisateur | id |
| GET | `/api/tournaments` | Liste tournois | - |
| POST | `/api/tournaments` | Créer tournoi | tournamentData |
| POST | `/api/tournaments?action=participate` | Rejoindre tournoi | tournament_id, user_id |
| POST | `/api/fights?action=organize` | Organiser combats | tournament_id |
| GET | `/api/notifications?user_id={id}` | Notifications utilisateur | user_id |

#### 5.4.2 Gestion des Erreurs

```php
<?php
// Dans ApiUtils.php
class ApiUtils {
    public static function sendResponse($data, $status_code = 200) {
        http_response_code($status_code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit();
    }
    
    public static function sendError($message, $status_code = 400) {
        self::sendResponse([
            'error' => true,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ], $status_code);
    }
    
    public static function validateInput($data, $required_fields) {
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                self::sendError("Champ requis manquant : $field", 422);
            }
        }
    }
    
    public static function logError($message, $context = []) {
        $log_entry = date('Y-m-d H:i:s') . " - " . $message;
        if (!empty($context)) {
            $log_entry .= " - Context: " . json_encode($context);
        }
        error_log($log_entry);
    }
}
?>
```

---

## 6. Frontend JavaScript

### 6.1 Architecture Frontend

Le frontend utilise une architecture modulaire en JavaScript vanilla pour maintenir la simplicité et les performances :

```
js/
├── api.js          # Client API - Communication avec backend
├── app-php.js      # Application principale - Orchestration
├── auth-php.js     # Authentification - Gestion utilisateurs
├── admin-php.js    # Panel admin - Fonctions administratives
└── performance.js  # Optimisations - Cache et performance
```

### 6.2 Client API (`api.js`)

```javascript
/**
 * Client API pour communication avec backend PHP
 */
class GymPowerAPI {
    constructor() {
        this.baseURL = 'http://localhost/gym-power/backend';
        this.endpoints = {
            auth: `${this.baseURL}/api/auth`,
            users: `${this.baseURL}/api/users`,
            tournaments: `${this.baseURL}/api/tournaments`,
            fights: `${this.baseURL}/api/fights`,
            notifications: `${this.baseURL}/api/notifications`,
            upload: `${this.baseURL}/api/upload`
        };
    }

    /**
     * Requête HTTP générique avec gestion d'erreurs
     */
    async makeRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Erreur HTTP: ${response.status}`);
            }

            return { data, error: null };
        } catch (error) {
            console.error('Erreur API:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Authentification - Login
     */
    async login(email, password) {
        const url = `${this.endpoints.auth}?action=login`;
        return await this.makeRequest(url, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    /**
     * Organisation intelligente des combats
     */
    async organizeFights(tournamentId) {
        const url = `${this.endpoints.fights}?action=organize`;
        const result = await this.makeRequest(url, {
            method: 'POST',
            body: JSON.stringify({ tournament_id: tournamentId })
        });
        
        // Rafraîchir la liste des combats après organisation
        if (result.data && !result.error) {
            this.notifyFightsOrganized(result.data);
        }
        
        return result;
    }

    /**
     * Notification après organisation des combats
     */
    notifyFightsOrganized(organizationResult) {
        const message = `
            ✅ Organisation terminée !
            🥊 ${organizationResult.fights_created} combats créés
            👥 ${organizationResult.participants_matched} participants appariés
            ⚠️ ${organizationResult.unmatched_participants} participants non appariés
        `;
        
        this.showNotification(message, 'success');
    }

    /**
     * Affichage des notifications utilisateur
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-suppression après 5 secondes
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Suppression manuelle
        notification.querySelector('.notification-close').onclick = () => {
            notification.remove();
        };
    }
}

// Instance globale
window.api = new GymPowerAPI();
```

### 6.3 Gestion de l'Authentification (`auth-php.js`)

```javascript
/**
 * Gestion de l'authentification et des sessions
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.init();
    }

    /**
     * Initialisation du gestionnaire d'authentification
     */
    init() {
        // Vérifier session existante
        this.loadSession();
        
        // Configuration timeout automatique
        this.setupSessionTimeout();
        
        // Écouter les événements de fermeture
        window.addEventListener('beforeunload', () => {
            this.saveSession();
        });
    }

    /**
     * Connexion utilisateur
     */
    async login(email, password) {
        try {
            // Validation côté client
            if (!this.validateLoginForm(email, password)) {
                throw new Error('Données de connexion invalides');
            }

            // Requête d'authentification
            const result = await window.api.login(email, password);
            
            if (result.error) {
                throw new Error(result.error);
            }

            // Stockage session
            this.currentUser = result.data.user;
            this.saveSession();
            
            // Redirection selon rôle
            if (this.currentUser.is_admin) {
                this.redirectToAdmin();
            } else {
                this.redirectToApp();
            }

            return { success: true };
            
        } catch (error) {
            console.error('Erreur de connexion:', error);
            this.showAuthError(error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Validation du formulaire de connexion
     */
    validateLoginForm(email, password) {
        // Email valide
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showAuthError('Format d\'email invalide');
            return false;
        }

        // Mot de passe non vide
        if (!password || password.length < 6) {
            this.showAuthError('Mot de passe trop court (minimum 6 caractères)');
            return false;
        }

        return true;
    }

    /**
     * Inscription nouvel utilisateur
     */
    async signup(userData) {
        try {
            // Validation étendue
            if (!this.validateSignupForm(userData)) {
                return { success: false };
            }

            // Requête d'inscription
            const result = await window.api.signup(userData);
            
            if (result.error) {
                throw new Error(result.error);
            }

            this.showAuthSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            return { success: true };
            
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            this.showAuthError(error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Validation complète du formulaire d'inscription
     */
    validateSignupForm(userData) {
        const errors = [];

        // Validation nom/prénom
        if (!userData.firstName || userData.firstName.length < 2) {
            errors.push('Prénom invalide (minimum 2 caractères)');
        }
        if (!userData.lastName || userData.lastName.length < 2) {
            errors.push('Nom invalide (minimum 2 caractères)');
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            errors.push('Format d\'email invalide');
        }

        // Validation mot de passe
        if (!userData.password || userData.password.length < 6) {
            errors.push('Mot de passe trop court (minimum 6 caractères)');
        }

        // Validation poids
        const weight = parseFloat(userData.weight);
        if (isNaN(weight) || weight < 30 || weight > 200) {
            errors.push('Poids invalide (entre 30 et 200 kg)');
        }

        // Validation date de naissance
        const birthDate = new Date(userData.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 16 || age > 60) {
            errors.push('Âge invalide (entre 16 et 60 ans)');
        }

        // Affichage erreurs
        if (errors.length > 0) {
            this.showAuthError(errors.join('<br>'));
            return false;
        }

        return true;
    }

    /**
     * Gestion de la session utilisateur
     */
    saveSession() {
        if (this.currentUser) {
            const sessionData = {
                user: this.currentUser,
                timestamp: Date.now()
            };
            localStorage.setItem('gym_power_session', JSON.stringify(sessionData));
        }
    }

    loadSession() {
        const sessionStr = localStorage.getItem('gym_power_session');
        if (sessionStr) {
            try {
                const sessionData = JSON.parse(sessionStr);
                const elapsed = Date.now() - sessionData.timestamp;
                
                // Vérifier expiration
                if (elapsed < this.sessionTimeout) {
                    this.currentUser = sessionData.user;
                    return true;
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Erreur chargement session:', error);
                this.logout();
            }
        }
        return false;
    }

    /**
     * Déconnexion utilisateur
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem('gym_power_session');
        this.redirectToAuth();
    }

    /**
     * Vérification des permissions
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.isAuthenticated() && this.currentUser.is_admin;
    }

    /**
     * Redirections
     */
    redirectToAuth() {
        window.gymPower.showAuthPage();
    }

    redirectToApp() {
        window.gymPower.showMainApp();
    }

    redirectToAdmin() {
        window.gymPower.showMainApp();
        setTimeout(() => {
            window.gymPower.showPage('admin');
        }, 100);
    }
}

// Instance globale
window.authManager = new AuthManager();
```

### 6.4 Panel d'Administration (`admin-php.js`)

```javascript
/**
 * Panel d'administration pour la gestion du club
 */
class AdminPanel {
    constructor() {
        this.users = [];
        this.tournaments = [];
        this.fights = [];
        this.init();
    }

    /**
     * Initialisation du panel admin
     */
    async init() {
        if (!window.authManager.isAdmin()) {
            console.error('Accès admin refusé');
            return;
        }

        // Chargement initial des données
        await this.loadAllData();
        
        // Configuration des événements
        this.setupEventListeners();
        
        // Rafraîchissement automatique
        this.setupAutoRefresh();
    }

    /**
     * Chargement de toutes les données administratives
     */
    async loadAllData() {
        try {
            // Chargement parallèle pour optimiser les performances
            const [usersResult, tournamentsResult, fightsResult] = await Promise.all([
                window.api.getUsers(),
                window.api.getTournaments(),
                window.api.getFights()
            ]);

            if (!usersResult.error) {
                this.users = usersResult.data;
                this.renderUsersTable();
            }

            if (!tournamentsResult.error) {
                this.tournaments = tournamentsResult.data;
                this.renderTournamentsTable();
            }

            if (!fightsResult.error) {
                this.fights = fightsResult.data;
                this.renderFightsTable();
            }

            this.updateStatistics();

        } catch (error) {
            console.error('Erreur chargement données admin:', error);
            this.showAdminError('Erreur lors du chargement des données');
        }
    }

    /**
     * Rendu de la table des utilisateurs avec actions
     */
    renderUsersTable() {
        const container = document.getElementById('admin-users-table');
        if (!container) return;

        let html = `
            <div class="admin-table-header">
                <h3>👥 Gestion des Utilisateurs (${this.users.length})</h3>
                <button class="btn btn-primary" onclick="adminPanel.showCreateUserModal()">
                    ➕ Nouveau Boxeur
                </button>
            </div>
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>Nom Complet</th>
                            <th>Email</th>
                            <th>Poids</th>
                            <th>Âge</th>
                            <th>Rôle</th>
                            <th>Inscription</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        this.users.forEach(user => {
            const age = this.calculateAge(user.birth_date);
            const photo = user.photo || 'assets/default-avatar.png';
            const role = user.is_admin ? '👑 Admin' : '🥊 Boxeur';
            
            html += `
                <tr data-user-id="${user.id}">
                    <td>
                        <img src="${photo}" alt="Photo" class="user-avatar-small">
                    </td>
                    <td>
                        <strong>${user.first_name} ${user.last_name}</strong>
                    </td>
                    <td>${user.email}</td>
                    <td>${user.weight} kg</td>
                    <td>${age} ans</td>
                    <td><span class="role-badge ${user.is_admin ? 'admin' : 'user'}">${role}</span></td>
                    <td>${this.formatDate(user.created_at)}</td>
                    <td class="actions-cell">
                        <button class="btn-action btn-edit" 
                                onclick="adminPanel.editUser(${user.id})" 
                                title="Modifier">
                            ✏️
                        </button>
                        <button class="btn-action btn-delete" 
                                onclick="adminPanel.deleteUser(${user.id})" 
                                title="Supprimer">
                            🗑️
                        </button>
                        <button class="btn-action btn-stats" 
                                onclick="adminPanel.viewUserStats(${user.id})" 
                                title="Statistiques">
                            📊
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Organisation intelligente des combats avec feedback détaillé
     */
    async organizeTournamentFights(tournamentId) {
        try {
            // Affichage loading
            this.showLoadingModal('Organisation des combats en cours...');

            // Appel API d'organisation
            const result = await window.api.organizeFights(tournamentId);

            this.hideLoadingModal();

            if (result.error) {
                throw new Error(result.error);
            }

            // Affichage des résultats détaillés
            this.showOrganizationResults(result.data);

            // Rechargement des données
            await this.loadAllData();

        } catch (error) {
            this.hideLoadingModal();
            console.error('Erreur organisation combats:', error);
            this.showAdminError(`Erreur lors de l'organisation : ${error.message}`);
        }
    }

    /**
     * Affichage des résultats d'organisation
     */
    showOrganizationResults(results) {
        const modal = document.createElement('div');
        modal.className = 'modal organization-results-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🥊 Résultats de l'Organisation</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="results-summary">
                        <div class="result-stat success">
                            <div class="stat-number">${results.fights_created}</div>
                            <div class="stat-label">Combats Créés</div>
                        </div>
                        <div class="result-stat info">
                            <div class="stat-number">${results.participants_matched}</div>
                            <div class="stat-label">Participants Appariés</div>
                        </div>
                        ${results.unmatched_participants > 0 ? `
                        <div class="result-stat warning">
                            <div class="stat-number">${results.unmatched_participants}</div>
                            <div class="stat-label">Non Appariés</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${results.fights.length > 0 ? `
                    <div class="fights-details">
                        <h3>Détail des Combats Créés</h3>
                        <div class="fights-list">
                            ${results.fights.map(fight => `
                                <div class="fight-card">
                                    <div class="fighter fighter-1">
                                        <strong>${fight.player1_name}</strong>
                                        <span class="fighter-details">${fight.player1_weight}kg, ${fight.player1_age} ans</span>
                                    </div>
                                    <div class="vs">VS</div>
                                    <div class="fighter fighter-2">
                                        <strong>${fight.player2_name}</strong>
                                        <span class="fighter-details">${fight.player2_weight}kg, ${fight.player2_age} ans</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${results.unmatched_participants > 0 ? `
                    <div class="unmatched-notice">
                        <h4>⚠️ Participants Non Appariés</h4>
                        <p>Certains participants n'ont pas pu être appariés en raison des contraintes de poids et d'âge. 
                           Vous pouvez créer des combats manuellement si nécessaire.</p>
                    </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                        Fermer
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fermeture modal
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    /**
     * Statistiques et tableaux de bord
     */
    updateStatistics() {
        const stats = {
            totalUsers: this.users.length,
            totalBoxers: this.users.filter(u => !u.is_admin).length,
            totalAdmins: this.users.filter(u => u.is_admin).length,
            totalTournaments: this.tournaments.length,
            activeTournaments: this.tournaments.filter(t => t.status === 'open' || t.status === 'in_progress').length,
            totalFights: this.fights.length,
            completedFights: this.fights.filter(f => f.result !== null).length
        };

        // Mise à jour dashboard
        this.renderDashboard(stats);
    }

    renderDashboard(stats) {
        const dashboard = document.getElementById('admin-dashboard');
        if (!dashboard) return;

        dashboard.innerHTML = `
            <div class="dashboard-grid">
                <div class="stat-card users">
                    <div class="stat-icon">👥</div>
                    <div class="stat-content">
                        <h3>${stats.totalBoxers}</h3>
                        <p>Boxeurs Actifs</p>
                    </div>
                </div>
                <div class="stat-card tournaments">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-content">
                        <h3>${stats.activeTournaments}</h3>
                        <p>Tournois Actifs</p>
                    </div>
                </div>
                <div class="stat-card fights">
                    <div class="stat-icon">🥊</div>
                    <div class="stat-content">
                        <h3>${stats.totalFights}</h3>
                        <p>Combats Organisés</p>
                    </div>
                </div>
                <div class="stat-card completion">
                    <div class="stat-icon">✅</div>
                    <div class="stat-content">
                        <h3>${Math.round((stats.completedFights / (stats.totalFights || 1)) * 100)}%</h3>
                        <p>Taux de Completion</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Instance globale
window.adminPanel = new AdminPanel();
```

---

**[Continue dans la partie 2/2 à cause de la limite de longueur...]**
