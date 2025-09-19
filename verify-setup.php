<?php
/**
 * Setup Verification Script
 * Open this file in your browser: http://localhost/gym-power/verify-setup.php
 */

// Set content type to HTML
header('Content-Type: text/html; charset=utf-8');

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vérification Installation - Gym Power</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
        h1 { color: #333; }
        h2 { color: #666; border-bottom: 2px solid #eee; padding-bottom: 5px; }
        code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🥊 Vérification de l'installation - Gym Power</h1>
    
    <?php
    $errors = [];
    $warnings = [];
    $success = [];
    
    // Vérification PHP
    echo "<h2>1. Vérification PHP</h2>";
    
    $phpVersion = phpversion();
    if (version_compare($phpVersion, '7.4.0', '>=')) {
        echo "<div class='status success'>✅ PHP $phpVersion détecté (Compatible)</div>";
        $success[] = "PHP version OK";
    } else {
        echo "<div class='status error'>❌ PHP $phpVersion détecté (Minimum requis: 7.4.0)</div>";
        $errors[] = "Version PHP insuffisante";
    }
    
    // Vérification des extensions PHP
    echo "<h2>2. Extensions PHP</h2>";
    
    $requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'gd', 'fileinfo'];
    foreach ($requiredExtensions as $ext) {
        if (extension_loaded($ext)) {
            echo "<div class='status success'>✅ Extension $ext chargée</div>";
            $success[] = "Extension $ext OK";
        } else {
            echo "<div class='status error'>❌ Extension $ext manquante</div>";
            $errors[] = "Extension $ext manquante";
        }
    }
    
    // Vérification de la base de données
    echo "<h2>3. Connexion à la base de données</h2>";
    
    try {
        require_once 'backend/config/database.php';
        $database = new Database();
        $conn = $database->getConnection();
        
        echo "<div class='status success'>✅ Connexion à la base de données réussie</div>";
        $success[] = "Connexion BDD OK";
        
        // Vérification des tables
        $tables = ['users', 'tournaments', 'participants', 'fights', 'notifications'];
        $existingTables = [];
        
        foreach ($tables as $table) {
            $stmt = $conn->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$table]);
            if ($stmt->rowCount() > 0) {
                $existingTables[] = $table;
                echo "<div class='status success'>✅ Table $table trouvée</div>";
            } else {
                echo "<div class='status error'>❌ Table $table manquante</div>";
                $errors[] = "Table $table manquante";
            }
        }
        
        if (count($existingTables) === count($tables)) {
            $success[] = "Toutes les tables présentes";
        }
        
    } catch (Exception $e) {
        echo "<div class='status error'>❌ Erreur de connexion à la base de données: " . htmlspecialchars($e->getMessage()) . "</div>";
        $errors[] = "Connexion BDD échouée";
    }
    
    // Vérification des dossiers
    echo "<h2>4. Permissions des dossiers</h2>";
    
    $uploadDir = 'backend/uploads';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
        echo "<div class='status info'>📁 Dossier $uploadDir créé</div>";
    }
    
    if (is_writable($uploadDir)) {
        echo "<div class='status success'>✅ Dossier $uploadDir accessible en écriture</div>";
        $success[] = "Permissions uploads OK";
    } else {
        echo "<div class='status error'>❌ Dossier $uploadDir non accessible en écriture</div>";
        $errors[] = "Permissions uploads insuffisantes";
    }
    
    // Vérification des fichiers API
    echo "<h2>5. Fichiers de l'API</h2>";
    
    $apiFiles = [
        'backend/index.php',
        'backend/api/auth.php',
        'backend/api/users.php',
        'backend/api/tournaments.php',
        'backend/api/fights.php',
        'backend/api/notifications.php'
    ];
    
    foreach ($apiFiles as $file) {
        if (file_exists($file)) {
            echo "<div class='status success'>✅ $file trouvé</div>";
        } else {
            echo "<div class='status error'>❌ $file manquant</div>";
            $errors[] = "Fichier $file manquant";
        }
    }
    
    // Vérification .htaccess
    if (file_exists('backend/.htaccess')) {
        echo "<div class='status success'>✅ Fichier .htaccess trouvé</div>";
        $success[] = ".htaccess présent";
    } else {
        echo "<div class='status warning'>⚠️ Fichier .htaccess manquant (URL rewriting peut ne pas fonctionner)</div>";
        $warnings[] = ".htaccess manquant";
    }
    
    // Test de création d'un utilisateur admin
    echo "<h2>6. Test de fonctionnalité</h2>";
    
    if (isset($conn)) {
        try {
            // Vérifier si l'admin existe déjà
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
            $stmt->execute(['admin@gym-power.com']);
            
            if ($stmt->rowCount() === 0) {
                // Créer l'utilisateur admin
                $stmt = $conn->prepare("INSERT INTO users (email, password_hash, first_name, last_name, weight, birth_date, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
                $passwordHash = password_hash('admin123', PASSWORD_DEFAULT);
                $stmt->execute([
                    'admin@gym-power.com',
                    $passwordHash,
                    'Admin',
                    'System',
                    75.0,
                    '1990-01-01',
                    1
                ]);
                
                echo "<div class='status success'>✅ Utilisateur admin créé (email: admin@gym-power.com, mot de passe: admin123)</div>";
                $success[] = "Utilisateur admin créé";
            } else {
                echo "<div class='status info'>ℹ️ Utilisateur admin déjà existant</div>";
                $success[] = "Utilisateur admin présent";
            }
        } catch (Exception $e) {
            echo "<div class='status error'>❌ Erreur lors de la création de l'admin: " . htmlspecialchars($e->getMessage()) . "</div>";
            $errors[] = "Création admin échouée";
        }
    }
    
    // Résumé
    echo "<h2>📊 Résumé de l'installation</h2>";
    
    echo "<div class='status info'>";
    echo "<strong>Succès:</strong> " . count($success) . " vérifications<br>";
    echo "<strong>Avertissements:</strong> " . count($warnings) . " problèmes<br>";
    echo "<strong>Erreurs:</strong> " . count($errors) . " problèmes critiques<br>";
    echo "</div>";
    
    if (count($errors) === 0) {
        echo "<div class='status success'>";
        echo "<h3>🎉 Installation réussie!</h3>";
        echo "<p>Votre application Gym Power est prête à être utilisée.</p>";
        echo "<p><strong>Prochaines étapes:</strong></p>";
        echo "<ul>";
        echo "<li>Ouvrez <a href='index.html'>index.html</a> pour tester l'application</li>";
        echo "<li>Connectez-vous avec: admin@gym-power.com / admin123</li>";
        echo "<li>Testez les fonctionnalités avec <a href='test-api.html'>test-api.html</a></li>";
        echo "</ul>";
        echo "</div>";
    } else {
        echo "<div class='status error'>";
        echo "<h3>❌ Problèmes détectés</h3>";
        echo "<p>Veuillez corriger les erreurs suivantes:</p>";
        echo "<ul>";
        foreach ($errors as $error) {
            echo "<li>$error</li>";
        }
        echo "</ul>";
        echo "<p>Consultez le guide <a href='INSTALLATION.md'>INSTALLATION.md</a> pour plus d'aide.</p>";
        echo "</div>";
    }
    ?>
    
    <hr>
    <p><small>Script de vérification exécuté le <?php echo date('Y-m-d H:i:s'); ?></small></p>
</body>
</html>
