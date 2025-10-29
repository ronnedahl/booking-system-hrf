<?php
/**
 * Delete association
 * POST /api/admin/deleteAssociation.php
 *
 * Required fields:
 * - associationId: number
 *
 * Note: This will also delete all bookings for this association (CASCADE)
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
validateRequiredFields($data, ['associationId']);

$associationId = (int) $data['associationId'];

if ($associationId <= 0) {
    sendErrorResponse('Ogiltigt förenings-ID', 400);
}

try {
    $pdo = getDbConnection();

    // Check if association exists and get name
    $checkStmt = $pdo->prepare("SELECT id, name FROM associations WHERE id = ?");
    $checkStmt->execute([$associationId]);
    $association = $checkStmt->fetch();

    if (!$association) {
        sendErrorResponse('Föreningen hittades inte', 404);
    }

    // Check if association has any bookings
    $bookingsStmt = $pdo->prepare("SELECT COUNT(*) as count FROM bookings WHERE association_id = ?");
    $bookingsStmt->execute([$associationId]);
    $bookingCount = $bookingsStmt->fetch()['count'];

    // Delete association (bookings will be deleted automatically due to CASCADE)
    $deleteStmt = $pdo->prepare("DELETE FROM associations WHERE id = ?");
    $deleteStmt->execute([$associationId]);

    $message = $bookingCount > 0
        ? "Föreningen '{$association['name']}' och {$bookingCount} bokningar har raderats"
        : "Föreningen '{$association['name']}' har raderats";

    sendJsonResponse([
        'success' => true,
        'message' => $message,
        'associationId' => $associationId,
        'associationName' => $association['name'],
        'deletedBookings' => (int) $bookingCount
    ]);

} catch (PDOException $e) {
    error_log('Database error in deleteAssociation: ' . $e->getMessage());
    sendErrorResponse('Ett databasfel uppstod', 500);
}
