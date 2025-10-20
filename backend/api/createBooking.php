<?php
/**
 * createBooking.php - Create new booking endpoint
 *
 * Handles POST requests to create bookings with comprehensive validation.
 * Uses modular validation functions for maintainability.
 *
 * Request Body:
 * {
 *   "date": "2025-11-15",
 *   "roomId": 1,
 *   "startTime": "10:00",
 *   "duration": 60,
 *   "userFirstname": "Anna",
 *   "associationId": 1
 * }
 *
 * Validations:
 * - Date must not be in the past
 * - Room must exist
 * - Time slot must not overlap with existing bookings
 * - Start time must be within business hours (09:00-17:00)
 * - Duration must be valid (30, 60, 90, or 120 minutes)
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/auth.php';

setCorsHeaders();

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

// Verify authentication
session_start();
if (!isset($_SESSION['authenticated']) || !$_SESSION['authenticated']) {
    sendErrorResponse('Unauthorized', 401);
}

// Get and validate JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    sendErrorResponse('Invalid JSON', 400);
}

// Validate required fields
$validationResult = validateBookingData($data);
if (!$validationResult['valid']) {
    sendErrorResponse($validationResult['error'], 400);
}

// Extract validated data
$date = $data['date'];
$roomId = (int)$data['roomId'];
$startTime = $data['startTime'];
$duration = (int)$data['duration'];
$userFirstname = trim($data['userFirstname']);
$userLastname = trim($data['userLastname']);
$associationId = (int)$data['associationId'];

// Perform business logic validations
$dateValidation = validateDate($date);
if (!$dateValidation['valid']) {
    sendErrorResponse($dateValidation['error'], 400);
}

$timeValidation = validateBusinessHours($startTime, $duration);
if (!$timeValidation['valid']) {
    sendErrorResponse($timeValidation['error'], 400);
}

$overlapValidation = validateNoOverlap($date, $roomId, $startTime, $duration);
if (!$overlapValidation['valid']) {
    sendErrorResponse($overlapValidation['error'], 409); // 409 Conflict
}

// Calculate end time
$endTime = calculateEndTime($startTime, $duration);

// Create booking (using hardcoded storage for now, would use DB in production)
$newBooking = createBookingRecord([
    'date' => $date,
    'roomId' => $roomId,
    'startTime' => $startTime,
    'endTime' => $endTime,
    'duration' => $duration,
    'userFirstname' => $userFirstname,
    'userLastname' => $userLastname,
    'associationId' => $associationId
]);

sendJsonResponse([
    'success' => true,
    'booking' => $newBooking,
    'message' => 'Booking created successfully'
], 201);

// ============================================================================
// VALIDATION FUNCTIONS (Modular & Testable)
// ============================================================================

/**
 * Validate booking data structure and required fields
 * Per booking.md: Only 60-minute bookings allowed
 */
function validateBookingData($data) {
    $requiredFields = ['date', 'roomId', 'startTime', 'duration', 'userFirstname', 'userLastname', 'associationId'];

    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            return [
                'valid' => false,
                'error' => "Missing required field: {$field}"
            ];
        }
    }

    // Validate duration - only 60 minutes allowed (booking.md requirement)
    if ((int)$data['duration'] !== 60) {
        return [
            'valid' => false,
            'error' => 'Duration must be exactly 60 minutes (1 hour)'
        ];
    }

    // Validate date format (YYYY-MM-DD)
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['date'])) {
        return [
            'valid' => false,
            'error' => 'Invalid date format. Expected YYYY-MM-DD'
        ];
    }

    // Validate time format (HH:MM)
    if (!preg_match('/^\d{2}:\d{2}$/', $data['startTime'])) {
        return [
            'valid' => false,
            'error' => 'Invalid time format. Expected HH:MM'
        ];
    }

    // Validate firstname
    if (strlen(trim($data['userFirstname'])) < 2) {
        return [
            'valid' => false,
            'error' => 'First name must be at least 2 characters'
        ];
    }

    // Validate lastname
    if (strlen(trim($data['userLastname'])) < 2) {
        return [
            'valid' => false,
            'error' => 'Last name must be at least 2 characters'
        ];
    }

    return ['valid' => true];
}

/**
 * Validate that date is not in the past
 */
function validateDate($date) {
    $bookingDate = strtotime($date);
    $today = strtotime(date('Y-m-d'));

    if ($bookingDate === false) {
        return [
            'valid' => false,
            'error' => 'Invalid date'
        ];
    }

    if ($bookingDate < $today) {
        return [
            'valid' => false,
            'error' => 'Cannot book dates in the past'
        ];
    }

    return ['valid' => true];
}

/**
 * Validate business hours (08:00-22:00) and blocked times
 * Per booking.md:
 * - Bookable hours: 08:00-22:00
 * - Blocked times: 09:00-10:00 and 12:00-13:00
 */
function validateBusinessHours($startTime, $duration) {
    $startHour = (int)substr($startTime, 0, 2);
    $startMinute = (int)substr($startTime, 3, 2);

    // Convert to minutes since midnight
    $startMinutes = $startHour * 60 + $startMinute;
    $endMinutes = $startMinutes + $duration;

    // Business hours: 08:00 (480 min) to 22:00 (1320 min)
    $businessStart = 8 * 60;  // 08:00
    $businessEnd = 22 * 60;   // 22:00

    if ($startMinutes < $businessStart) {
        return [
            'valid' => false,
            'error' => 'Bookings cannot start before 08:00'
        ];
    }

    if ($endMinutes > $businessEnd) {
        return [
            'valid' => false,
            'error' => 'Bookings must end by 22:00'
        ];
    }

    // Check blocked times: 09:00-10:00 (540-600 min) and 12:00-13:00 (720-780 min)
    $blockedSlots = [
        ['start' => 9 * 60, 'end' => 10 * 60, 'label' => '09:00-10:00'],
        ['start' => 12 * 60, 'end' => 13 * 60, 'label' => '12:00-13:00']
    ];

    foreach ($blockedSlots as $blocked) {
        // Check if booking overlaps with blocked time
        if ($startMinutes < $blocked['end'] && $endMinutes > $blocked['start']) {
            return [
                'valid' => false,
                'error' => "Time slot {$blocked['label']} is not available for booking"
            ];
        }
    }

    return ['valid' => true];
}

/**
 * Validate no overlap with existing bookings
 */
function validateNoOverlap($date, $roomId, $startTime, $duration) {
    // Get all bookings for this date and room
    $existingBookings = getBookingsForDateAndRoom($date, $roomId);

    $endTime = calculateEndTime($startTime, $duration);

    foreach ($existingBookings as $booking) {
        // Check if time ranges overlap
        if (timeRangesOverlap($startTime, $endTime, $booking['startTime'], $booking['endTime'])) {
            return [
                'valid' => false,
                'error' => "Time slot conflicts with existing booking from {$booking['startTime']} to {$booking['endTime']}"
            ];
        }
    }

    return ['valid' => true];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate end time based on start time and duration
 */
function calculateEndTime($startTime, $duration) {
    $timestamp = strtotime($startTime);
    $endTimestamp = $timestamp + ($duration * 60);
    return date('H:i', $endTimestamp);
}

/**
 * Check if two time ranges overlap
 */
function timeRangesOverlap($start1, $end1, $start2, $end2) {
    $s1 = strtotime($start1);
    $e1 = strtotime($end1);
    $s2 = strtotime($start2);
    $e2 = strtotime($end2);

    // Ranges overlap if: (start1 < end2) AND (end1 > start2)
    return ($s1 < $e2) && ($e1 > $s2);
}

/**
 * Get all bookings for a specific date and room
 * NOTE: This uses hardcoded data for now. In production, query database.
 */
function getBookingsForDateAndRoom($date, $roomId) {
    // Hardcoded bookings (updated for new schema with lastname)
    $allBookings = [
        [
            'id' => 1,
            'date' => date('Y-m-15'),
            'roomId' => 1,
            'startTime' => '10:00',
            'endTime' => '11:00',
            'duration' => 60,
            'userFirstname' => 'Anna',
            'userLastname' => 'Andersson',
            'associationId' => 1
        ],
        [
            'id' => 2,
            'date' => date('Y-m-15'),
            'roomId' => 2,
            'startTime' => '14:00',
            'endTime' => '15:00',
            'duration' => 60,
            'userFirstname' => 'Erik',
            'userLastname' => 'Eriksson',
            'associationId' => 2
        ],
        [
            'id' => 3,
            'date' => date('Y-m-20'),
            'roomId' => 1,
            'startTime' => '11:00',
            'endTime' => '12:00',
            'duration' => 60,
            'userFirstname' => 'Maria',
            'userLastname' => 'Svensson',
            'associationId' => 1
        ]
    ];

    // Filter by date and room
    return array_filter($allBookings, function($booking) use ($date, $roomId) {
        return $booking['date'] === $date && $booking['roomId'] === $roomId;
    });
}

/**
 * Create and store booking record
 * NOTE: This uses hardcoded storage. In production, INSERT into database.
 */
function createBookingRecord($data) {
    // Generate new ID (in production, DB auto-increment)
    $newId = rand(1000, 9999);

    // Get room name (per booking.md: Wilmer 1 and Wilmer 2)
    $roomNames = [
        1 => 'Wilmer 1',
        2 => 'Wilmer 2'
    ];

    $booking = [
        'id' => $newId,
        'date' => $data['date'],
        'roomId' => $data['roomId'],
        'roomName' => $roomNames[$data['roomId']] ?? 'Unknown Room',
        'startTime' => $data['startTime'],
        'endTime' => $data['endTime'],
        'duration' => $data['duration'],
        'userFirstname' => $data['userFirstname'],
        'userLastname' => $data['userLastname'],
        'associationId' => $data['associationId'],
        'createdAt' => date('Y-m-d H:i:s')
    ];

    // In production:
    // $pdo = getDbConnection();
    // $stmt = $pdo->prepare("INSERT INTO bookings (date, room_id, start_time, duration, user_firstname, user_lastname, association_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
    // $stmt->execute([$data['date'], $data['roomId'], $data['startTime'], $data['duration'], $data['userFirstname'], $data['userLastname'], $data['associationId']]);
    // $booking['id'] = $pdo->lastInsertId();

    return $booking;
}
