<?php
  require_once 'includes/bootstrap.php';

  $result = [
    'success' => false,
    'message' => ''
  ];

  if (isset($_GET['action'])) {
    if ($_GET['action'] === 'import_xml') {
      $result = importXMLFromStaticFile();
      header('Content-Type: application/json');
      echo json_encode($result);
      exit;
    } elseif ($_GET['action'] === 'get_asset' && isset($_GET['id']) && isset($_GET['type'])) {
      $gameId = $_GET['id'];
      $assetType = $_GET['type'];

      $assetPath = getGameAssetPath($gameId, $assetType);

      if (file_exists($assetPath) && strpos($assetPath, 'assets/') === 0) {
        header('Location: ' . $assetPath);
      } else {
        header('Location: ' . ($assetType === 'cover' ? COVER_URL_BASE : DISC_URL_BASE) . $gameId . '.png');
      }
      exit;
    } else {
      $result['message'] = 'Invalid action specified.';
    }
  }
?>

<!doctype html>
<html lang='<?php echo SITE_LANG; ?>'>
  <head>
    <meta charset='UTF-8'>
    <meta
      name='viewport'
      content='width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0'
    >
    <meta
      http-equiv='X-UA-Compatible'
      content='ie=edge'
    >
    <title><?php echo SITE_TITLE; ?></title>
    <link
      rel='stylesheet'
      href='assets/css/styles.css'
    >
  </head>
  <body>
    <div class='container'>
      <div
        class='sub-container'
        style='text-align: center;'
      >
        <h1><?php echo SITE_TITLE; ?></h1>
        <div
          class='container'
          style='gap: 8px; justify-content: center'
        >
          <button
            id='helpButton'
            class='btn btn-success'
          >
            Help &quest;
          </button>
        </div>
        <div id='stats'>
          <b>Stats:</b> 0 games
        </div>

        <div id='message'></div>
        <div id='loading'>Loading data, please wait...</div>
      </div>
      <div class='sub-container'>
        <?php include_once 'includes/components/filters.php'; ?>
      </div>
    </div>

    <div
      id='imgTooltip'
      class='img-tooltip'
    ></div>

    <!-- Main -->
    <div id='paginationTop'></div>
    <div id='area'>
      <p><i>Loading game data...</i></p>
    </div>
    <div id='paginationBottom'></div>
    <!-- End Main -->

    <?php include_once 'includes/components/help_dialog.php'; ?>
  </body>
  <script src='assets/js/datasets/keyToValue.js'></script>
  <script src='assets/js/main.js'></script>
</html>
