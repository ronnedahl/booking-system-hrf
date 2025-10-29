<?php
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
validateRequiredFields($data, ['associationId', 'newPassword']);

$associationId = (int) $data['associationId'];
$newPassword = trim($data['newPassword']);

// Validate password
if (strlen($newPassword) < 6) {
    sendErrorResponse('Lösenordet måste vara minst 6 tecken långt', 400);
}

if (strlen($newPassword) > 50) {
    sendErrorResponse('Lösenordet kan inte vara längre än 50 tecken', 400);
}

try {
    $pdo = getDbConnection();

    // Check if association exists
    $checkStmt = $pdo->prepare("SELECT id, name FROM associations WHERE id = ?");
    $checkStmt->execute([$associationId]);
    $association = $checkStmt->fetch();

    if (!$association) {
        sendErrorResponse('Föreningen hittades inte', 404);
    }

    // Hash the new password
    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update the password
    $updateStmt = $pdo->prepare("
        UPDATE associations
        SET code_hash = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");

    $updateStmt->execute([$passwordHash, $associationId]);

    sendJsonResponse([
        'success' => true,
        'message' => 'Lösenordet för ' . $association['name'] . ' har uppdaterats',
        'associationId' => $associationId,
        'associationName' => $association['name']
    ]);

} catch (PDOException $e) {
    sendErrorResponse('Database error: ' . $e->getMessage(), 500);
}
