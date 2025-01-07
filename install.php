<?php
/**
 * Metal Aloud Installation Wizard
 * Copyright (c) 2024 Metal Aloud. All rights reserved.
 */

// Prevent direct access if already installed
if (file_exists('.env') && !isset($_GET['force'])) {
    die('Metal Aloud is already installed. Remove this file for security.');
}

// Security headers
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('X-Content-Type-Options: nosniff');

// Validate license key
function validateLicense($key) {
    if (strlen($key) !== 39) return false; // 32 chars + 7 dashes
    $key = str_replace('-', '', $key);
    if (!ctype_xdigit($key)) return false;
    return true;
}

// Process installation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = ['success' => false, 'error' => null];
    
    try {
        // Validate license key
        if (!validateLicense($_POST['license_key'])) {
            throw new Exception('Invalid license key');
        }

        // Create .env file
        $envContent = "DB_HOST={$_POST['db_host']}\n" .
                     "DB_USER={$_POST['db_user']}\n" .
                     "DB_PASSWORD={$_POST['db_password']}\n" .
                     "DB_NAME={$_POST['db_name']}\n" .
                     "DB_PORT={$_POST['db_port']}\n\n" .
                     "SITE_NAME=\"{$_POST['site_name']}\"\n" .
                     "SITE_URL={$_POST['site_url']}\n" .
                     "ADMIN_EMAIL={$_POST['admin_email']}\n\n" .
                     "LICENSE_KEY={$_POST['license_key']}\n";

        file_put_contents('.env', $envContent);

        // Store license info
        $licenseInfo = [
            'key' => $_POST['license_key'],
            'domain' => $_SERVER['HTTP_HOST'],
            'issued' => date('Y-m-d H:i:s'),
            'type' => 'single-domain'
        ];
        file_put_contents('license.json', json_encode($licenseInfo));

        $response['success'] = true;
    } catch (Exception $e) {
        $response['error'] = $e->getMessage();
    }

    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Metal Aloud Installation</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Metal+Mania&display=swap" rel="stylesheet">
    <style>
        .font-metal { font-family: 'Metal Mania', cursive; }
    </style>
</head>
<body class="bg-gradient-to-br from-red-900 via-zinc-900 to-black min-h-screen">
    <div id="root"></div>
    <script type="module">
        import { createRoot } from 'https://esm.sh/react-dom@18.3.0-canary-a870b2d54-20240314/client';
        import { InstallWizard } from './src/components/install/InstallWizard';
        
        const root = createRoot(document.getElementById('root'));
        root.render(<InstallWizard />);
    </script>
</body>
</html>