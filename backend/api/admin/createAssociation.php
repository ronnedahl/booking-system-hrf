<?php
/**
 * Create new association
 * POST /api/admin/createAssociation.php
 *
 * Required fields:
 * - name: string (association name)
 * - password: string (initial password, min 6 chars)
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/auth.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

// Verify admin session
verifyAdminSession();

// Get JSON input
$data = getJsonInput();
validateRequiredFields($data, ['name', 'password']);

$name = trim($data['name']);
$password = trim($data['password']);

// Validate name
if (strlen($name) < 2) {
    sendErrorResponse('Föreningsnamnet måste vara minst 2 tecken långt', 400);
}

if (strlen($name) > 100) {
    sendErrorResponse('Föreningsnamnet kan inte vara längre än 100 tecken', 400);
}

// Validate password
if (strlen($password) < 6) {
    sendErrorResponse('Lösenordet måste vara minst 6 tecken långt', 400);
}

if (strlen($password) > 50) {
    sendErrorResponse('Lösenordet kan inte vara längre än 50 tecken', 400);
}

try {
    $pdo = getDbConnection();

    // Check if association name already exists
    $checkStmt = $pdo->prepare("SELECT id FROM associations WHERE name = ?");
    $checkStmt->execute([$name]);

    if ($checkStmt->fetch()) {
        sendErrorResponse('En förening med detta namn finns redan', 409);
    }

    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Insert new association
    $insertStmt = $pdo->prepare("
        INSERT INTO associations (name, code_hash, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ");

    $insertStmt->execute([$name, $passwordHash]);

    $associationId = $pdo->lastInsertId();

    // Fetch the newly created association
    $fetchStmt = $pdo->prepare("
        SELECT id, name, created_at, updated_at
        FROM associations
        WHERE id = ?
    ");
    $fetchStmt->execute([$associationId]);
    $association = $fetchStmt->fetch();

    sendJsonResponse([
        'success' => true,
        'message' => "Föreningen '$name' har skapats",
        'association' => $association
    ], 201);

} catch (PDOException $e) {
    error_log('Database error in createAssociation: ' . $e->getMessage());
    sendErrorResponse('Ett databasfel uppstod', 500);
}
