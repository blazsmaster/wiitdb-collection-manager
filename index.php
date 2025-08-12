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
                <td>
                  <button id='clearFilter'>
                    Clear Filters &cross;
                  </button>
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
            <tr>
              <td>System type:</td>
              <td>
                <select id='systemTypeFilter'>
                  <option value=''>All Systems</option>
              </td>
            </tr>
          </tbody>
        </table>
        <table class='filter-table'>
          <thead>
            <tr>
              <th colspan='3'>Advanced Filters</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <label>
                  <input
                    type='checkbox'
                    id='hideDemo'
                  />
                  Hide demo titles
                </label>
              </td>
              <td>
                <label>
                  <input
                    type='checkbox'
                    id='hideHomebrew'
                  />
                  Hide Homebrew channels
                </label>
              </td>
            </tr>
            <tr>
              <td>
                <label>
                  <input
                    type='checkbox'
                    id='hideService'
                  />
                  Hide service titles
                </label>
              </td>
              <td>
                <label>
                  <input
                    type='checkbox'
                    id='hideVirtualConsole'
                  />
                  Hide Virtual Console titles
                </label>
              </td>
            </tr>
            <tr>
              <td>
                <label>
                  <input
                    type='checkbox'
                    id='hideCustom'
                  />
                  Hide custom titles
                </label>
              </td>
              <td>
                <label>
                  <input
                    type='checkbox'
                    id='hideWiiWare'
                  />
                  Hide WiiWare titles
                </label>
              </td>
            </tr>
            <tr>
              <td>
                <label>
                  <input
                    type='checkbox'
                    id='hideIncomplete'
                  />
                  Hide incomplete titles
                </label>
              </td>
            </tr>
          </tbody>
        </table>
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

    <!-- Help Dialog -->
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
            <button
              class='btn active'
              data-tab='about'
            >
              About
            </button>
            <button
              class='btn'
              data-tab='general'
            >
              Features
            </button>
            <button
              class='btn'
              data-tab='filters'
            >
              Filters
            </button>
            <button
              class='btn'
              data-tab='codes'
            >
              Game IDs
            </button>
          </div>
          <div class='container tab-container'>
            <!-- About Tab -->
            <div
              class='tab-content active'
              id='about-content'
            >
              <h3 class='body-title'>About WiiTDB Collection Manager</h3>
              <p>
                This application is a small and user-friendly tool for managing your Wii game collection, built on the
                <a
                  href='https://www.gametdb.com/Wii'
                  target='_blank'
                >WiiTDB</a> database. It allows you to easily track which games you own, view detailed information about
                each title, and filter your collection based on various criteria.
              </p>

              <p>
                Built with <span class='tool php'>PHP</span>, <span class='tool js'>JavaScript</span>,
                <span class='tool css'>CSS</span> and <span class='tool html'>HTML</span>, this application provides a
                user-friendly interface to:
              </p>

              <ul>
                <li>Browse the complete Wii game database</li>
                <li>Track games you own with a simple checkbox system</li>
                <li>Filter your collection by various criteria</li>
                <li>View official/custom cover and disc art</li>
              </ul>

              <p>
                <strong>Privacy-focused:</strong> All data is stored locally in your browser - nothing is sent to any
                external servers. Your collection data remains completely private to you.
              </p>

              <p>
                <strong>Source code:</strong> This project is open source and available on
                <a
                  href='https://github.com/blazsmaster/wiitdb-collection-manager'
                  target='_blank'
                >GitHub</a>. Contributions, bug reports, and feature requests are welcome!
              </p>

              <a
                href='https://www.gametdb.com/'
                target='_blank'
              >
                &DoubleRightArrow; Visit WiiTDB for more information
              </a>
              <br />
              <a
                href='https://github.com/blazsmaster/wiitdb-collection-manager/stargazers'
                target='_blank'
              >
                &star; Star this project on GitHub
              </a>
            </div>

            <!-- Features Tab -->
            <div
              class='tab-content'
              id='general-content'
            >
              <h3 class='body-title'>Key Features</h3>

              <h4>Collection Management</h4>
              <ul>
                <li><strong>Game tracking:</strong> Easily mark games you own with a checkbox</li>
                <li><strong>Pagination:</strong> Browse through thousands of games without performance issues</li>
                <li><strong>Statistics:</strong> View total number of games in your collection</li>
                <li><strong>Game deletion:</strong> Remove games from your collection with a single click</li>
              </ul>

              <h4>Game Information</h4>
              <ul>
                <li><strong>Cover & disc art:</strong> View official/custom artwork for each game</li>
                <li><strong>Region flags:</strong> Visual indicators of game regions</li>
                <li><strong>Language support:</strong> See which languages each game supports</li>
                <li><strong>Developer & publisher:</strong> Find out who made each game</li>
                <li><strong>Game ID:</strong> Unique identifier containing region and version information</li>
              </ul>

              <h4>User Interface</h4>
              <ul>
                <li><strong>Image previews:</strong> Hover over thumbnails to see larger artwork</li>
                <li><strong>Fast filtering:</strong> Instantly filter thousands of games</li>
                <li><strong>Keyboard navigation:</strong> Use tab key to navigate</li>
              </ul>
            </div>

            <!-- Filters Tab -->
            <div
              class='tab-content'
              id='filters-content'
            >
              <h3 class='body-title'>Filtering Your Collection</h3>

              <h4>Basic Filters</h4>
              <ul>
                <li>
                  <strong>Search:</strong> Quickly find games by querying game names, IDs, developers or publishers
                </li>
                <li><strong>Region:</strong> Filter games by their release region (PAL, NTSC-U, etc.)</li>
                <li><strong>Language:</strong> Show games that support a specific language</li>
                <li><strong>Developer/Publisher:</strong> Filter by company</li>
                <li><strong>Region Code</strong> Filter games by their region code in the ID (P, E, J, etc.)</li>
                <li><strong>System Type:</strong> Show only Wii, GameCube, Virtual Console, etc. titles</li>
              </ul>

              <h4>Advanced Filters</h4>
              <p>Use these checkboxes to refine your collection view:</p>
              <ul>
                <li><strong>Hide demo titles:</strong> Remove games marked as demos ('D' in ID, 'demo' in title)</li>
                <li><strong>Hide service titles:</strong> Hide service discs</li>
                <li><strong>Hide custom titles:</strong> Hide custom or unofficial entries</li>
                <li><strong>Hide Homebrew channels:</strong> Hide unofficial homebrew applications</li>
                <li><strong>Hide Virtual Console titles:</strong> Hide retro game releases</li>
                <li><strong>Hide WiiWare titles:</strong> Hide downloadable WiiWare games</li>
                <li>
                  <strong>Hide incomplete titles:</strong> Hide games with missing information (empty region, etc.)
                </li>
              </ul>

              <p><strong>Tip:</strong> The
                <button
                  class='btn-primary'
                  style='cursor: default'
                  disabled
                >Clear Filters &cross;
                </button>
                button will reset all filters at once.
              </p>

              <p>
                <strong>How filtering works:</strong> Filters are applied immediately as you select them, and the game
                list updates in real-time. Multiple filters work together (AND logic), showing only games that match ALL
                selected criteria. <i>(A 300ms debounce delay is applied to prevent performance issues with rapid
                  changes.)</i>
              </p>
            </div>

            <!-- Game IDs Tab -->
            <div
              class='tab-content'
              id='codes-content'
            >
              <h3 class='body-title'>Understanding Wii Game IDs</h3>

              <p>Every Wii game has a unique ID that contains valuable information about the game:</p>

              <div style="display:flex;flex-direction: column;text-align: center; margin-top: 15px">
                <code style="font-size: 1.2em; padding: 5px; background: oklch(0.955 0 89.876); border: 1px var(--border-color) solid;">
                  S
                  <span style="color: var(--danger-color); font-weight: bold;">P</span>
                  <span style="color: var(--success-color); font-weight: bold;">2</span>
                  <span style="color: var(--primary-color); font-weight: bold;">P</span>
                  <span style='color: color-mix(in oklch, var(--border-dark-color) 60%, transparent);'>01</span>
                </code>
                <p>
                  <small>Example: <span class='mono'>SP2P01</span> (Wii Sports + Wii Sports Resort, PAL region)</small>
                </p>
              </div>

              <h4>ID Structure</h4>
              <ul>
                <li><strong>1st character:</strong> System type</li>
                <li><strong>2nd character:</strong> Game code (unique to the game title)</li>
                <li><strong>3rd character:</strong> Game code...</li>
                <li><strong>4th character:</strong> Region code</li>
                <li><strong>5th-6th characters:</strong> Publisher code</li>
              </ul>

              <h4>System Types (1st character)</h4>
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>System Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Numeric 0-9</td>
                    <td>System or service disc</td>
                  </tr>
                  <tr>
                    <td>C</td>
                    <td>Commodore 64 Virtual Console</td>
                  </tr>
                  <tr>
                    <td>D</td>
                    <td>Demo Disc</td>
                  </tr>
                  <tr>
                    <td>E</td>
                    <td>Virtual Console Arcade or NeoGeo Virtual Console</td>
                  </tr>
                  <tr>
                    <td>F</td>
                    <td>NES Virtual Console</td>
                  </tr>
                  <tr>
                    <td>G</td>
                    <td>GameCube Disc</td>
                  </tr>
                  <tr>
                    <td>H</td>
                    <td>General Channel</td>
                  </tr>
                  <tr>
                    <td>J</td>
                    <td>Super Nintendo Virtual Console</td>
                  </tr>
                  <tr>
                    <td>L</td>
                    <td>Sega Master System Virtual Console</td>
                  </tr>
                  <tr>
                    <td>M</td>
                    <td>Sega Megadrive Virtual Console</td>
                  </tr>
                  <tr>
                    <td>N</td>
                    <td>Nintendo 64 Virtual Console</td>
                  </tr>
                  <tr>
                    <td>P</td>
                    <td>TurboGraFX Virtual Console</td>
                  </tr>
                  <tr>
                    <td>Q</td>
                    <td>TurboGraFX CD Virtual Console</td>
                  </tr>
                  <tr>
                    <td>R</td>
                    <td>Wii Disc (old)</td>
                  </tr>
                  <tr>
                    <td>S</td>
                    <td>Wii Disc (new)</td>
                  </tr>
                  <tr>
                    <td>W</td>
                    <td>WiiWare</td>
                  </tr>
                  <tr>
                    <td>X</td>
                    <td>MSX Virtual Console (Japan only) or WiiWare Demos</td>
                  </tr>
                </tbody>
              </table>

              <h4>Region Codes (4th character)</h4>
              <table class='help-table'>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Region</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>D</td>
                    <td>PAL</td>
                    <td>German-speaking regions</td>
                  </tr>
                  <tr>
                    <td>E</td>
                    <td>NTSC-U</td>
                    <td>USA and other NTSC regions, except Japan</td>
                  </tr>
                  <tr>
                    <td>F</td>
                    <td>PAL</td>
                    <td>French-speaking regions</td>
                  </tr>
                  <tr>
                    <td>I</td>
                    <td>PAL</td>
                    <td>Italian-speaking regions</td>
                  </tr>
                  <tr>
                    <td>J</td>
                    <td>NTSC-J</td>
                    <td>Japan</td>
                  </tr>
                  <tr>
                    <td>K</td>
                    <td>NTSC-K</td>
                    <td>Korea</td>
                  </tr>
                  <tr>
                    <td>P</td>
                    <td>PAL</td>
                    <td>Europe, Australia and other PAL regions</td>
                  </tr>
                  <tr>
                    <td>R</td>
                    <td>PAL-R
                    <td>Russia</td>
                  </tr>
                  <tr>
                    <td>S</td>
                    <td>PAL</td>
                    <td>Spanish-speaking regions</td>
                  </tr>
                  <tr>
                    <td>W</td>
                    <td>NTSC-T</td>
                    <td>Taiwan and Hong Kong</td>
                  </tr>
                  <tr>
                    <td>X</td>
                    <td>PAL, NTSC-U</td>
                    <td>Various regions/Region-free, including special editions</td>
                  </tr>
                </tbody>
              </table>

              <a
                href='https://wiibrew.org/wiki/Title_database#System_Codes'
                target='_blank'
              >
                &DoubleRightArrow; Learn more about System Codes
              </a>
              <br />
              <a
                href='https://wiibrew.org/wiki/Title_database#Region_Codes'
                target='_blank'
              >
                &DoubleRightArrow; Learn more about Region Codes
              </a>
              <br />
              <a
                href='https://www.gametdb.com/WiiCompanies'
                target='_blank'
              >
                &DoubleRightArrow; Check out all the Company Codes
              </a>
            </div>
          </div>
        </div>
      </div>
    </dialog>
    <!-- End Help Dialog -->
  </body>
  <script src='assets/js/datasets/keyToValue.js'></script>
  <script src='assets/js/main.js'></script>
</html>
