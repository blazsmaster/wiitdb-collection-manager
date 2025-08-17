<?php
    $id = 'settingsDialog';
    $title = 'Settings';
    $tabs = [
        'test' => [
            'label' => 'Hello',
            'title' => 'Hello World',
            'path' => 'html/settings_dialog/tab_test.html'
        ]
    ];
    include __DIR__ . '/dialog.php';
