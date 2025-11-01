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

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Method not allowed', 405);
}

// Start session and verify authentication
session_start();

if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    sendErrorResponse('Not authenticated', 401);
}

// Get query parameters
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
$associationId = isset($_GET['associationId']) ? (int)$_GET['associationId'] : null;
$fromDate = isset($_GET['fromDate']) ? $_GET['fromDate'] : null;
$toDate = isset($_GET['toDate']) ? $_GET['toDate'] : null;

try {
    // Create PDO connection
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

    // Build query
    $sql = "
        SELECT
            b.id,
            b.date,
            b.start_time as startTime,
            b.duration,
            b.user_firstname as userFirstname,
            b.user_lastname as userLastname,
            b.created_at as createdAt,
            r.id as roomId,
            r.name as roomName,
            a.id as associationId,
            a.name as associationName
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN associations a ON b.association_id = a.id
        WHERE 1=1
    ";

    $params = [];

    // Filter by association (non-admin users can only see their own)
    if ($_SESSION['role'] !== 'admin') {
        $sql .= " AND b.association_id = ?";
        $params[] = $_SESSION['associationId'];
    } elseif ($associationId !== null) {
        // Admin can filter by specific association
        $sql .= " AND b.association_id = ?";
        $params[] = $associationId;
    }

    // Filter by date range
    if ($fromDate !== null) {
        $sql .= " AND b.date >= ?";
        $params[] = $fromDate;
    }

    if ($toDate !== null) {
        $sql .= " AND b.date <= ?";
        $params[] = $toDate;
    }

    // Order by date descending (newest first)
    $sql .= " ORDER BY b.date DESC, b.start_time DESC";

    // Add pagination
    $sql .= " LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $bookings = $stmt->fetchAll();

    // Calculate end time for each booking
    foreach ($bookings as &$booking) {
        $startTime = new DateTime($booking['startTime']);
        $endTime = clone $startTime;
        $endTime->modify('+' . $booking['duration'] . ' minutes');
        $booking['endTime'] = $endTime->format('H:i:s');
    }

    // Get total count for pagination
    $countSql = "
        SELECT COUNT(*) as total
        FROM bookings b
        WHERE 1=1
    ";

    $countParams = [];

    if ($_SESSION['role'] !== 'admin') {
        $countSql .= " AND b.association_id = ?";
        $countParams[] = $_SESSION['associationId'];
    } elseif ($associationId !== null) {
        $countSql .= " AND b.association_id = ?";
        $countParams[] = $associationId;
    }

    if ($fromDate !== null) {
        $countSql .= " AND b.date >= ?";
        $countParams[] = $fromDate;
    }

    if ($toDate !== null) {
        $countSql .= " AND b.date <= ?";
        $countParams[] = $toDate;
    }

    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($countParams);
    $totalCount = $countStmt->fetch()['total'];

    // Return success response
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'bookings' => $bookings,
        'pagination' => [
            'total' => (int)$totalCount,
            'limit' => $limit,
            'offset' => $offset,
            'hasMore' => ($offset + $limit) < $totalCount
        ]
    ]);

} catch (PDOException $e) {
    error_log("Database error in getBookingHistory.php: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Ett databasfel uppstod'
    ]);
} catch (Exception $e) {
    error_log("Error in getBookingHistory.php: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Ett fel uppstod vid hämtning av bokningshistorik'
    ]);
}
