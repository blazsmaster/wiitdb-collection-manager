<?php
  $filters = [
    // Filter options
    [
      'title' => 'Filter by',
      'cols' => 2,
      'inputType' => 'select',
      'options' => [
        ['label' => 'Region', 'id' => 'regionFilter', 'placeholder' => ['All Regions']],
        ['label' => 'Language', 'id' => 'languageFilter', 'placeholder' => ['All Languages']],
        ['label' => 'Developer', 'id' => 'developerFilter', 'placeholder' => ['All Developers']],
        ['label' => 'Publisher', 'id' => 'publisherFilter', 'placeholder' => ['All Publishers']],
        ['label' => 'Region Code', 'id' => 'regionCodeFilter', 'placeholder' => ['All Region Codes']],
        ['label' => 'System type', 'id' => 'systemTypeFilter', 'placeholder' => ['All Systems']]
      ]
    ],
    // Advanced filters
    [
      'title' => 'Advanced Filters',
      'cols' => 2,
      'inputType' => 'checkbox',
      'options' => [
        ['label' => 'Hide Demo Titles', 'id' => 'hideDemo'],
        ['label' => 'Hide Homebrew Channels', 'id' => 'hideHomebrew'],
        ['label' => 'Hide Service Titles', 'id' => 'hideService'],
        ['label' => 'Hide Virtual Console Titles', 'id' => 'hideVirtualConsole'],
        ['label' => 'Hide Custom Titles', 'id' => 'hideCustom'],
        ['label' => 'Hide WiiWare Titles', 'id' => 'hideWiiWare'],
        ['label' => 'Hide Incomplete Titles', 'id' => 'hideIncomplete']
      ]
    ]
  ];
?>

<div class='sub-container'>
  <!-- Search -->
  <table class='filter-table'>
    <thead>
      <tr>
        <th colspan='2'>Search for:</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style='position: relative'>
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

          <button
            id='clearFilter'
            class='btn btn-primary'
            style='position: absolute; right: 0; top: 0'
          >
            Clear Filters &cross;
          </button>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Dynamic Filters -->
  <?php foreach ($filters as $group): ?>
    <table class='filter-table'>
      <thead>
        <tr>
          <th colspan='<?php echo $group['cols']; ?>'><?php echo $group['title']; ?></th>
        </tr>
      </thead>
      <tbody>
        <?php if ($group['inputType'] === 'select'): ?>
          <?php foreach ($group['options'] as $option): ?>
            <tr>
              <td><?php echo $option['label']; ?>:</td>
              <td>
                <select id='<?php echo $option['id']; ?>'>
                  <option value=''><?php echo $option['placeholder'][0]; ?></option>
                </select>
              </td>
            </tr>
          <?php endforeach; ?>
        <?php elseif ($group['inputType'] === 'checkbox'): ?>
          <?php
          $options = $group['options'];
          $total = count($options);
          ?>
          <?php for ($i = 0; $i < $total; $i += 2): ?>
            <tr>
              <td>
                <label>
                  <input
                    type='checkbox'
                    id='<?php echo $options[$i]['id']; ?>'
                  />
                  <?php echo $options[$i]['label']; ?>
                </label>
              </td>
              <?php if (isset($options[$i + 1])): ?>
                <td>
                  <label>
                    <input
                      type='checkbox'
                      id='<?php echo $options[$i + 1]['id']; ?>'
                    />
                    <?php echo $options[$i + 1]['label']; ?>
                  </label>
                </td>
              <?php else: ?>
                <td></td>
              <?php endif; ?>
            </tr>
          <?php endfor; ?>
        <?php else: ?>
          <tr>
            <td colspan='<?php echo $group['cols']; ?>'>
              Unsupported filter type "<?php echo $group['inputType']; ?>", please check the code.
            </td>
          </tr>
        <?php endif; ?>
      </tbody>
    </table>
  <?php endforeach; ?>
</div>
