<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/auth.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Method not allowed', 405);
}

// Verify admin session
verifyAdminSession();

try {
    $pdo = getDbConnection();

    // Get all associations with their details
    $stmt = $pdo->prepare("
        SELECT
            id,
            name,
            created_at,
            updated_at
        FROM associations
        ORDER BY name ASC
    ");

    $stmt->execute();
    $associations = $stmt->fetchAll();

    sendJsonResponse([
        'success' => true,
        'associations' => $associations
    ]);

} catch (PDOException $e) {
    sendErrorResponse('Database error: ' . $e->getMessage(), 500);
}
