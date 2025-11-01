<?php
// Simple test file - upload to root of fastai.se
// Access via: https://fastai.se/test-api.php

header('Content-Type: application/json');

echo json_encode([
    'status' => 'ok',
    'message' => 'PHP is working!',
    'php_version' => phpversion(),
    'date' => date('Y-m-d H:i:s')
]);
