<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/auth.php';

// Set CORS headers
setCorsHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

// Start session and verify authentication
session_start();

if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    sendErrorResponse('Not authenticated', 401);
}

// Get JSON input
$data = getJsonInput();

// Validate required fields
validateRequiredFields($data, ['bookingId', 'password']);

$bookingId = (int) $data['bookingId'];
$password = trim($data['password']);

try {
    // Create PDO connection
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

    // Get booking details and verify ownership
    $stmt = $pdo->prepare("
        SELECT b.*, a.code_hash, a.name as association_name
        FROM bookings b
        JOIN associations a ON b.association_id = a.id
        WHERE b.id = ?
    ");

    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$booking) {
        sendErrorResponse('Bokningen hittades inte', 404);
    }

    // Check if user is admin or owns this booking
    $isAdmin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
    $ownsBooking = isset($_SESSION['associationId']) &&
                   $_SESSION['associationId'] == $booking['association_id'];

    if (!$isAdmin && !$ownsBooking) {
        sendErrorResponse('Du har inte behörighet att radera denna bokning', 403);
    }

    // Verify password against association's password
    if (!password_verify($password, $booking['code_hash'])) {
        sendErrorResponse('Felaktigt lösenord. Vänligen ange din föreningskod.', 401);
    }

    // Check if booking is in the past
    $bookingDateTime = new DateTime($booking['date'] . ' ' . $booking['start_time']);
    $now = new DateTime();

    if ($bookingDateTime < $now) {
        sendErrorResponse('Du kan inte radera en bokning som redan har passerat', 400);
    }

    // Delete the booking
    $deleteStmt = $pdo->prepare("DELETE FROM bookings WHERE id = ?");
    $deleteStmt->execute([$bookingId]);

    if ($deleteStmt->rowCount() === 0) {
        sendErrorResponse('Kunde inte radera bokningen', 500);
    }

    // Return success response
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Bokningen har raderats',
        'booking' => [
            'id' => $bookingId,
            'date' => $booking['date'],
            'start_time' => $booking['start_time'],
            'duration' => $booking['duration'],
            'user_firstname' => $booking['user_firstname'],
            'association_name' => $booking['association_name']
        ]
    ]);

} catch (PDOException $e) {
    error_log("Database error in deleteBooking.php: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Ett databasfel uppstod'
    ]);
} catch (Exception $e) {
    error_log("Error in deleteBooking.php: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Ett fel uppstod vid radering av bokningen'
    ]);
}
