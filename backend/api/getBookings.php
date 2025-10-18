<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/auth.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Method not allowed', 405);
}

// Verify authentication
session_start();
if (!isset($_SESSION['authenticated']) || !$_SESSION['authenticated']) {
    sendErrorResponse('Unauthorized', 401);
}

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

// Hardcoded test bookings (since MySQL not installed)
// In production, this would be: SELECT * FROM bookings WHERE YEAR(date) = ? AND MONTH(date) = ?
$allBookings = [
    [
        'id' => 1,
        'date' => date('Y-m-15'), // 15th of current month
        'roomId' => 1,
        'roomName' => 'Lokal A',
        'startTime' => '10:00',
        'endTime' => '11:00',
        'duration' => 60,
        'userFirstname' => 'Anna',
        'associationId' => 1,
        'associationName' => 'Förening A'
    ],
    [
        'id' => 2,
        'date' => date('Y-m-15'), // Same day, different room
        'roomId' => 2,
        'roomName' => 'Lokal B',
        'startTime' => '14:00',
        'endTime' => '15:30',
        'duration' => 90,
        'userFirstname' => 'Erik',
        'associationId' => 2,
        'associationName' => 'Förening B'
    ],
    [
        'id' => 3,
        'date' => date('Y-m-20'), // 20th of current month
        'roomId' => 1,
        'roomName' => 'Lokal A',
        'startTime' => '09:00',
        'endTime' => '10:00',
        'duration' => 60,
        'userFirstname' => 'Maria',
        'associationId' => 1,
        'associationName' => 'Förening A'
    ]
];

// Filter bookings for requested month/year
$filteredBookings = array_filter($allBookings, function($booking) use ($year, $month) {
    $bookingDate = strtotime($booking['date']);
    return date('Y', $bookingDate) == $year && date('n', $bookingDate) == $month;
});

// If user (not admin), only show their bookings
if ($_SESSION['role'] === 'user' && isset($_SESSION['associationId'])) {
    $filteredBookings = array_filter($filteredBookings, function($booking) {
        return $booking['associationId'] === $_SESSION['associationId'];
    });
}

// Re-index array to ensure proper JSON encoding
$filteredBookings = array_values($filteredBookings);

sendJsonResponse([
    'success' => true,
    'bookings' => $filteredBookings,
    'year' => $year,
    'month' => $month
]);
