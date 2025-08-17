<?php
  if (!isset($id) || !isset($title) || !isset($tabs) || !is_array($tabs)) {
    die('Error: $id, $title, and $tabs (array) must be set before including dialog.php');
  }
  $firstTabId = array_key_first($tabs);
?>

<dialog id="<?php echo htmlspecialchars($id); ?>">
  <div class="dialog-container" style="width: 600px">
    <div class="dialog-body">
      <div class="container">
        <h3><?php echo htmlspecialchars($title); ?></h3>
        <button id="<?php echo htmlspecialchars($id); ?>Close" class="btn-danger" style="margin-left: auto">
          &cross; Close
        </button>
      </div>
      <div class="container">
        <?php foreach ($tabs as $tabId => $tab): ?>
          <button
            class="btn <?php echo $tabId === $firstTabId ? 'active' : ''; ?>"
            data-tab="<?php echo htmlspecialchars($id . '-' . $tabId); ?>"
          >
            <?php echo htmlspecialchars($tab['label']); ?>
          </button>
        <?php endforeach; ?>
      </div>
      <div class="container tab-container">
        <?php foreach ($tabs as $tabId => $tab): ?>
          <div
            class="tab-content <?php echo $tabId === $firstTabId ? 'active' : ''; ?>"
            id="<?php echo htmlspecialchars($id . '-' . $tabId); ?>-content"
          >
            <h3 class="body-title"><?php echo htmlspecialchars($tab['title']); ?></h3>
            <?php if (isset($tab['path']) && file_exists($tab['path'])): ?>
              <?php include_once $tab['path']; ?>
            <?php endif; ?>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</dialog>
