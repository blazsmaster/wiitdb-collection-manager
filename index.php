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
        <div id='stats'>
          <b>Stats:</b> 0 games
        </div>

        <div id='message'></div>
        <div id='loading'>Loading data, please wait...</div>
      </div>
      <div class='sub-container'>
        <div>
          <table class='filter-table'>
            <thead>
              <tr>
                <th colspan='2'>Search for:</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    type='text'
                    id='searchInput'
                    placeholder='Query here :D'
                  />

                  <label for='searchField'>in </label><select id='searchField'>
                    <option value='name'>Name</option>
                    <option
                      value='id'
                      selected
                    >
                      ID
                    </option>
                    <option value='developer'>Developer</option>
                    <option value='publisher'>Publisher</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <table class='filter-table'>
          <thead>
            <tr>
              <th colspan='2'>Filter by:</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Region:</td>
              <td>
                <select id='regionFilter'>
                  <option value=''>All Regions</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Language:</td>
              <td>
                <select id='languageFilter'>
                  <option value=''>All Languages</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Developer:</td>
              <td>
                <select id='developerFilter'>
                  <option value=''>All Developers</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Publisher:</td>
              <td>
                <select id='publisherFilter'>
                  <option value=''>All Publishers</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Region Code:</td>
              <td>
                <select id='regionCodeFilter'>
                  <option value=''>All Region Codes</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <label>
            <input
              type='checkbox'
              id='hideDemo'
            />
            Hide demo titles
          </label>
        </div>
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
  </body>
  <script src='assets/js/main.js'></script>
</html>
