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

// Hardcoded test bookings (since MySQL not installed)
// In production: SELECT b.*, r.name as roomName, a.name as associationName FROM bookings b JOIN rooms r ON b.room_id = r.id JOIN associations a ON b.association_id = a.id WHERE YEAR(b.date) = ? AND MONTH(b.date) = ?
$allBookings = [
    [
        'id' => 1,
        'date' => date('Y-m-15'), // 15th of current month
        'roomId' => 1,
        'roomName' => 'Wilmer 1',
        'startTime' => '10:00',
        'endTime' => '11:00',
        'duration' => 60,
        'userFirstname' => 'Anna',
        'userLastname' => 'Andersson',
        'associationId' => 1,
        'associationName' => 'Förening A'
    ],
    [
        'id' => 2,
        'date' => date('Y-m-15'), // Same day, different room
        'roomId' => 2,
        'roomName' => 'Wilmer 2',
        'startTime' => '14:00',
        'endTime' => '15:00',
        'duration' => 60,
        'userFirstname' => 'Erik',
        'userLastname' => 'Eriksson',
        'associationId' => 2,
        'associationName' => 'Förening B'
    ],
    [
        'id' => 3,
        'date' => date('Y-m-20'), // 20th of current month
        'roomId' => 1,
        'roomName' => 'Wilmer 1',
        'startTime' => '11:00',
        'endTime' => '12:00',
        'duration' => 60,
        'userFirstname' => 'Maria',
        'userLastname' => 'Svensson',
        'associationId' => 1,
        'associationName' => 'Förening A'
    ]
];

// Filter bookings for requested month/year
$filteredBookings = array_filter($allBookings, function($booking) use ($year, $month) {
    $bookingDate = strtotime($booking['date']);
    return date('Y', $bookingDate) == $year && date('n', $bookingDate) == $month;
});

// Re-index array to ensure proper JSON encoding
$filteredBookings = array_values($filteredBookings);

// Return array directly (not wrapped in object) for easier frontend consumption
sendJsonResponse($filteredBookings);
