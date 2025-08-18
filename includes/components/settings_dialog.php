<?php
    $id = 'settingsDialog';
    $title = 'Settings';
    $tabs = [
        'table' => [
            'label' => 'Table',
            'title' => 'Table Settings',
            'path' => 'html/settings_dialog/tab_columns.html'
        ]
    ];
    include __DIR__ . '/dialog.php';
