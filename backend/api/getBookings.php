<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/auth.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Method not allowed', 405);
}

// Authentication not required for viewing bookings
// Users need to see all bookings to know what slots are available
session_start();

// Get query parameters
$year = isset($_GET['year']) ? (int)$_GET['year'] : date('Y');
$month = isset($_GET['month']) ? (int)$_GET['month'] : date('n');

// Validate parameters
if ($year < 2020 || $year > 2030) {
    sendErrorResponse('Invalid year', 400);
}
if ($month < 1 || $month > 12) {
    sendErrorResponse('Invalid month', 400);
}

// Fetch bookings from MySQL database
try {
    $pdo = getDbConnection();

    $sql = "SELECT
                b.id,
                b.date,
                b.room_id as roomId,
                r.name as roomName,
                b.start_time as startTime,
                TIME_FORMAT(ADDTIME(b.start_time, SEC_TO_TIME(b.duration * 60)), '%H:%i') as endTime,
                b.duration,
                b.user_firstname as userFirstname,
                b.user_lastname as userLastname,
                b.association_id as associationId,
                a.name as associationName
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN associations a ON b.association_id = a.id
            WHERE YEAR(b.date) = ? AND MONTH(b.date) = ?
            ORDER BY b.date, b.start_time";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$year, $month]);
    $filteredBookings = $stmt->fetchAll();

} catch (PDOException $e) {
    sendErrorResponse('Database error: ' . $e->getMessage(), 500);
}

// Return with success wrapper for frontend compatibility
sendJsonResponse([
    'success' => true,
    'bookings' => $filteredBookings,
    'year' => $year,
    'month' => $month
]);
