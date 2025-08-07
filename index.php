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
    <h2><?php echo SITE_TITLE; ?></h2>

    <div id='message'></div>
    <div id='loading'>Loading data, please wait...</div>
    <div id='stats'>
      <b>Stats:</b> 0 games
    </div>
    <div id='area'>
      <p><i>Loading game data...</i></p>
    </div>
  </body>
  <script src='assets/js/main.js'></script>
</html>
