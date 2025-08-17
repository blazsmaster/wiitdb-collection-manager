<?php
  $id = 'helpDialog';
  $title = 'Help';
  $tabs = [
    'about' => [
      'label' => 'About',
      'title' => 'About WiiTDB Collection Manager',
      'path' => 'html/help_dialog/tab_about.html'
    ],
    'general' => [
      'label' => 'Features',
      'title' => 'Key Features',
      'path' => 'html/help_dialog/tab_features.html'
    ],
    'filters' => [
      'label' => 'Filters',
      'title' => 'Filtering Your Collection',
      'path' => 'html/help_dialog/tab_filters.html'
    ],
    'codes' => [
      'label' => 'Game IDs',
      'title' => 'Understanding Wii Game IDs',
      'path' => 'html/help_dialog/tab_game_ids.html'
    ]
  ];
  include_once __DIR__ . '/dialog.php';
