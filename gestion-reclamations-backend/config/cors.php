<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://bhreclamations.netlify.app',
        'https://94872f86947d.ngrok-free.app',
        'http://localhost:3000', // for local development
        'http://127.0.0.1:3000', // for local development
        'http://localhost:5173', // for Vite development
        'http://127.0.0.1:5173', // for Vite development
        '*' // Allow all origins for development
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];