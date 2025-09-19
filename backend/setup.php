<?php
/**
 * Database Setup Script for Gym Power Application
 * Run this file to create the database and tables
 */

require_once 'config/database.php';

echo "<h1>Gym Power Database Setup</h1>\n";

try {
    // First, connect without specifying database to create it
    $pdo = new PDO(
        "mysql:host=localhost",
        "root",
        "",
        array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
        )
    );
    
    echo "<p>✅ Connected to MySQL server</p>\n";
    
    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS gym_power CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "<p>✅ Database 'gym_power' created/verified</p>\n";
    
    // Switch to the database
    $pdo->exec("USE gym_power");
    
    // Read and execute schema
    $schema = file_get_contents('database/schema.sql');
    
    // Split by semicolon and execute each statement
    $statements = array_filter(array_map('trim', explode(';', $schema)));
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            try {
                $pdo->exec($statement);
                echo "<p>✅ Executed: " . substr($statement, 0, 50) . "...</p>\n";
            } catch (PDOException $e) {
                echo "<p>⚠️ Warning: " . $e->getMessage() . "</p>\n";
            }
        }
    }
    
    echo "<h2>✅ Database setup completed successfully!</h2>\n";
    echo "<p>Default admin user created:</p>\n";
    echo "<ul>\n";
    echo "<li>Email: admin@admin.com</li>\n";
    echo "<li>Password: admin123</li>\n";
    echo "</ul>\n";
    
    echo "<h3>Next Steps:</h3>\n";
    echo "<ol>\n";
    echo "<li>Update the frontend to use the new PHP API</li>\n";
    echo "<li>Test the API endpoints</li>\n";
    echo "<li>Start adding users and tournaments</li>\n";
    echo "</ol>\n";
    
} catch (Exception $e) {
    echo "<h2>❌ Error during setup:</h2>\n";
    echo "<p>" . $e->getMessage() . "</p>\n";
    echo "<p>Please check your database configuration and try again.</p>\n";
}
?>
