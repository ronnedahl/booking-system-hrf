<?php
// Debug login API - upload to backend/api/ folder
// Access via: https://fastai.se/api/debug-login.php

header('Content-Type: application/json');

$debug = [
    'step_1_paths' => [
        '__DIR__' => __DIR__,
        'config_path' => __DIR__ . '/../config/config.php',
        'config_exists' => file_exists(__DIR__ . '/../config/config.php'),
    ]
];

try {
    require_once __DIR__ . '/../config/config.php';
    $debug['step_2_config_loaded'] = true;

    $debug['step_3_constants'] = [
        'DB_HOST' => defined('DB_HOST') ? DB_HOST : 'NOT DEFINED',
        'DB_NAME' => defined('DB_NAME') ? DB_NAME : 'NOT DEFINED',
        'DB_USER' => defined('DB_USER') ? DB_USER : 'NOT DEFINED',
        'DB_PASS' => defined('DB_PASS') ? (strlen(DB_PASS) > 0 ? 'SET (' . strlen(DB_PASS) . ' chars)' : 'EMPTY') : 'NOT DEFINED',
    ];

    // Try connection
    try {
        $pdo = getDbConnection();
        $debug['step_4_connection'] = 'SUCCESS';

        // Try to query associations
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM associations");
        $result = $stmt->fetch();
        $debug['step_5_query'] = [
            'status' => 'SUCCESS',
            'associations_count' => $result['count']
        ];

    } catch (PDOException $e) {
        $debug['step_4_connection'] = 'FAILED';
        $debug['step_4_error'] = $e->getMessage();
    }

} catch (Exception $e) {
    $debug['step_2_config_error'] = $e->getMessage();
}

echo json_encode($debug, JSON_PRETTY_PRINT);
