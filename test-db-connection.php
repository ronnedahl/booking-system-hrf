<?php
// Test database connection - upload to backend/ folder
// Access via: https://fastai.se/backend/test-db-connection.php

header('Content-Type: application/json');

// Test 1: Check if .env file exists
$envExists = file_exists(__DIR__ . '/.env');

// Test 2: Try to load config
require_once __DIR__ . '/config/config.php';

$result = [
    'env_file_exists' => $envExists,
    'config_loaded' => true,
    'db_constants' => [
        'DB_HOST' => defined('DB_HOST') ? DB_HOST : 'NOT DEFINED',
        'DB_NAME' => defined('DB_NAME') ? DB_NAME : 'NOT DEFINED',
        'DB_USER' => defined('DB_USER') ? DB_USER : 'NOT DEFINED',
        'DB_PASS' => defined('DB_PASS') ? substr(DB_PASS, 0, 3) . '***' : 'NOT DEFINED',
    ],
    'connection_test' => 'pending'
];

// Test 3: Try database connection
try {
    $pdo = getDbConnection();
    $result['connection_test'] = 'SUCCESS';

    // Test query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM associations");
    $count = $stmt->fetch();
    $result['associations_count'] = $count['count'];

    $stmt = $pdo->query("SELECT COUNT(*) as count FROM rooms");
    $count = $stmt->fetch();
    $result['rooms_count'] = $count['count'];

} catch (Exception $e) {
    $result['connection_test'] = 'FAILED';
    $result['error'] = $e->getMessage();
}

echo json_encode($result, JSON_PRETTY_PRINT);
