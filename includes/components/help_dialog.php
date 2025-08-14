<?php
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
?>

<dialog id='helpDialog'>
  <div
    class='dialog-container'
    style='width: 600px'
  >
    <div class='dialog-body'>
      <div class='container'>
        <h3>Help</h3>
        <button
          id='closeHelpDialog'
          class='btn-danger'
          style='margin-left: auto'
        >
          &cross; Close
        </button>
      </div>
      <div class='container'>
        <?php foreach ($tabs as $tabId => $tab): ?>
          <button
            class='btn <?php echo $tabId === 'about' ? 'active' : ''; ?>'
            data-tab='<?php echo $tabId; ?>'
          >
            <?php echo $tab['label']; ?>
          </button>
        <?php endforeach; ?>
      </div>
      <div class='container tab-container'>
        <?php foreach ($tabs as $tabId => $tab): ?>
          <div
            class='tab-content <?php echo $tabId === 'about' ? 'active' : ''; ?>'
            id='<?php echo $tabId; ?>-content'
          >
            <h3 class='body-title'><?php echo $tab['title']; ?></h3>
            <?php include_once $tab['path']; ?>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</dialog>
