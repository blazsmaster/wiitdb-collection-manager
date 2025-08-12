/**
 * @type {Game[]}
 */
let db = [];
/**
 * @type {Game[]}
 */
let filteredGames = [];
/**
 * @type {Filter}
 */
let filters = {
	region: [],
	language: [],
	developer: [],
	publisher: [],
	type: [],
};
/**
 * @type {ActiveFilter}
 */
let activeFilters = {
	region: '',
	language: '',
	developer: '',
	publisher: '',
	regionCode: '',
	type: '',
};
let currentPage = 1;

// Storage keys
const LS_GAME_DB_KEY = 'gameDB';
const LS_FILTERS_KEY = 'filters';

// Values config
const DEBOUNCE_DELAY = 300;
const DISPLAY_UNKNOWN_FILTER = true;
const MESSAGE_TIMEOUT_MS = 5000;
const PAGINATION_TABLE_ROWS = 100;

// UI
const messageElement = document.getElementById('message');
const loadingElement = document.getElementById('loading');
const statsElement = document.getElementById('stats');
const areaElement = document.getElementById('area');
const paginationTopElement = document.getElementById('paginationTop');
const paginationBottomElement = document.getElementById('paginationBottom');
const clearFilterButtonElement = document.getElementById('clearFilter');
const helpDialogElement = document.getElementById('helpDialog');
const helpButtonElement = document.getElementById('helpButton');
const closeHelpButtonElement = document.getElementById('closeHelpDialog');

// UI Filters
const regionFilterElement = document.getElementById('regionFilter');
const languageFilterElement = document.getElementById('languageFilter');
const developerFilterElement = document.getElementById('developerFilter');
const publisherFilterElement = document.getElementById('publisherFilter');
const searchInputElement = document.getElementById('searchInput');
const searchFieldElement = document.getElementById('searchField');
const hideDemoElement = document.getElementById('hideDemo');
const regionCodeFilterElement = document.getElementById('regionCodeFilter');
const systemTypeFilterElement = document.getElementById('systemTypeFilter');
const hideServiceElement = document.getElementById('hideService');
const hideCustomElement = document.getElementById('hideCustom');
const hideIncompleteElement = document.getElementById('hideIncomplete');
const hideVirtualConsoleElement = document.getElementById('hideVirtualConsole');
const hideWiiWareElement = document.getElementById('hideWiiWare');
const hideHomebrewElement = document.getElementById('hideHomebrew');

// Event listeners
document.addEventListener('DOMContentLoaded', initApp);

clearFilterButtonElement.addEventListener('click', clearFilters);

helpButtonElement.addEventListener('click', function () {
	helpDialogElement.showModal();
});
closeHelpButtonElement.addEventListener('click', function () {
	helpDialogElement.close();
});

document.querySelectorAll('#helpDialog .btn').forEach(tab => {
	tab.addEventListener('click', function () {
		const targetTab = this.getAttribute('data-tab');
		document.querySelectorAll('.tab-content').forEach(content => {
			content.classList.remove('active');
		});
		document.querySelectorAll('#helpDialog .btn').forEach(t => {
			t.classList.remove('active');
		});
		document.getElementById(targetTab + '-content').classList.add('active');
		this.classList.add('active');
	});
});

searchInputElement.addEventListener('input', debounce(applyFilters, DEBOUNCE_DELAY));
searchFieldElement.addEventListener('change', applyFilters);

hideDemoElement.addEventListener('change', applyFilters);
hideServiceElement.addEventListener('change', applyFilters);
hideCustomElement.addEventListener('change', applyFilters);
hideIncompleteElement.addEventListener('change', applyFilters);
hideVirtualConsoleElement.addEventListener('change', applyFilters);
hideWiiWareElement.addEventListener('change', applyFilters);
hideHomebrewElement.addEventListener('change', applyFilters);

regionFilterElement.addEventListener('change', function () {
	activeFilters.region = this.value;
	applyFilters();
});
languageFilterElement.addEventListener('change', function () {
	activeFilters.language = this.value;
	applyFilters();
});
developerFilterElement.addEventListener('change', function () {
	activeFilters.developer = this.value;
	applyFilters();
});
publisherFilterElement.addEventListener('change', function () {
	activeFilters.publisher = this.value;
	applyFilters();
});
regionCodeFilterElement.addEventListener('change', function () {
	activeFilters.regionCode = this.value;
	applyFilters();
});
systemTypeFilterElement.addEventListener('change', function () {
	activeFilters.type = this.value;
	applyFilters();
});

function initApp() {
	loadGamesFromLocalStorage();
}

function loadGamesFromLocalStorage() {
	const storedGames = localStorage.getItem(LS_GAME_DB_KEY);
	const storedFilters = localStorage.getItem(LS_FILTERS_KEY);

	if (storedGames) {
		db = JSON.parse(storedGames);
		if (storedFilters) {
			filters = JSON.parse(storedFilters);
		} else {
			calculateFilterOptions();
		}
		populateFilterDropdowns();
		applyFilters();
	} else {
		importXML();
	}

	applyFilters();
}

function importXML() {
	showLoading(true);
	showMessage('', '');

	fetch('index.php?action=import_xml')
		.then((response) => response.json())
		.then(/*** @param {ImportXmlResponse} data*/(data) => {
			if (data.success) {
				db = data.games;
				filters = data.filters;

				localStorage.setItem(LS_GAME_DB_KEY, JSON.stringify(db));
				localStorage.setItem(LS_FILTERS_KEY, JSON.stringify(filters));

				populateFilterDropdowns();
				applyFilters();
				showMessage(`XML data imported successfully: ${data.message}`, 'success');
			} else {
				showMessage('Error fetching XML data: ' + data.message, 'error');
			}
			showLoading(false);
		})
		.catch((error) => {
			showMessage('Error fetching XML data: ' + error.message, 'error');
			showLoading(false);
		});
}

function applyFilters() {
	const searchTerm = searchInputElement.value.toLowerCase();
	const searchField = searchFieldElement.value;
	const hideDemo = hideDemoElement.checked;
	const hideService = hideServiceElement.checked;
	const hideCustom = hideCustomElement.checked;
	const hideIncomplete = hideIncompleteElement.checked;
	const hideVirtualConsole = hideVirtualConsoleElement.checked;
	const hideWiiWare = hideWiiWareElement.checked;
	const hideHomebrew = hideHomebrewElement.checked;

	filteredGames = db.filter((game) => {
		const gameType = game.type.toLowerCase();
		if (
			(hideCustom && gameType === 'custom') ||
			(hideVirtualConsole && gameType.startsWith('vc-')) ||
			(hideWiiWare && gameType === 'wiiware') ||
			(hideHomebrew && gameType === 'homebrew') ||
			(hideDemo && isMatchingDemo(game)) ||
			(hideService && isServiceTitle(game)) ||
			(hideIncomplete && hasUnknownValue(game)) ||
			(searchTerm && searchField && !matchesSearchTerm(game, searchField, searchTerm))
		) {
			return false;
		}

		return matchesFilter(game, 'region') &&
			matchesFilter(game, 'language') &&
			matchesFilter(game, 'developer') &&
			matchesFilter(game, 'publisher') &&
			matchesFilter(game, 'regionCode') &&
			matchesFilter(game, 'type');
	});

	clearFilterButtonElement.style.display = atLeastOneActiveFilter() ? 'inline-block' : 'none';

	updateStats();
	renderTable();
}

function clearFilters() {
	activeFilters = {
		region: '',
		language: '',
		developer: '',
		publisher: '',
		regionCode: '',
		type: '',
	};

	searchInputElement.value = '';
	searchFieldElement.value = 'id';

	regionFilterElement.value = '';
	languageFilterElement.value = '';
	developerFilterElement.value = '';
	publisherFilterElement.value = '';
	regionCodeFilterElement.value = '';
	systemTypeFilterElement.value = '';

	hideDemoElement.checked = false;
	hideServiceElement.checked = false;
	hideCustomElement.checked = false;
	hideIncompleteElement.checked = false;
	hideVirtualConsoleElement.checked = false;
	hideWiiWareElement.checked = false;
	hideHomebrewElement.checked = false;

	applyFilters();
}

function atLeastOneActiveFilter() {
	return (
		activeFilters.region ||
		activeFilters.language ||
		activeFilters.developer ||
		activeFilters.publisher ||
		activeFilters.regionCode ||
		activeFilters.type ||
		searchInputElement.value.trim() !== '' ||
		hideDemoElement.checked ||
		hideServiceElement.checked ||
		hideCustomElement.checked ||
		hideIncompleteElement.checked ||
		hideVirtualConsoleElement.checked ||
		hideWiiWareElement.checked ||
		hideHomebrewElement.checked
	);
}

/**
 * Check if a game has unknown value in any of its fields
 * @param {Game} game
 */
function hasUnknownValue(game) {
	return !game.region || !game.language || !game.developer || !game.publisher || !game.type;
}

/**
 * Check if a game is a service title
 * @param {Game} game
 */
function isServiceTitle(game) {
	const discCode = game.id.charAt(0).toUpperCase();
	return !isNaN(parseInt(discCode)) && (game.type === 'Wii' || game.type === 'GameCube');
}

/**
 * Check if a game matches the demo filter
 * @param {Game} game
 */
function isMatchingDemo(game) {
	const discCode = game.id.charAt(0).toUpperCase();
	const gameName = game.name.toLowerCase();
	return discCode === 'D' || gameName.includes(' demo ') || gameName.includes(' (demo) ');
}

/**
 * Check if a game matches the search term in the specified field
 * @param {Game} game
 * @param {string} field
 * @param {string} searchTerm
 */
function matchesSearchTerm(game, field, searchTerm) {
	if (!game[field]) {
		return false;
	}
	if (game[field].toLowerCase() === 'unknown') {
		return false;
	}
	if (field === 'developer' || field === 'publisher') {
		const values = parseAttributeString(game[field]);
		return values.some(value => value.toLowerCase().includes(searchTerm));
	}
	if (field === 'name') {
		return [game['name'], game['title']].join(' ').toLowerCase().includes(searchTerm);
	} else {
		return game[field].toLowerCase().includes(searchTerm);
	}
}

/**
 * Check if a game matches a specific filter
 * @param {Game} game
 * @param {FilterOptions} filterType
 */
function matchesFilter(game, filterType) {
	const activeValue = activeFilters[filterType];
	if (!activeValue) {
		return true;
	}

	const gameValue = game[filterType];

	if (activeValue === 'Unknown') {
		return !gameValue || gameValue.toLowerCase() === 'unknown';
	}

	if ((!gameValue || gameValue.trim() === '') && filterType !== 'regionCode') {
		return false;
	}

	if (filterType === 'language') {
		return gameValue.toLowerCase().includes(activeValue.toLowerCase());
	}

	if (filterType === 'developer' || filterType === 'publisher') {
		const gameValues = gameValue.split(' / ').map(v => v.trim());
		const activeValues = activeValue.split(' / ').map(v => v.trim());

		return gameValues.some(gameVal => {
			const gameValLower = gameVal.toLowerCase();
			return activeValues.some(activeVal => {
				const activeValLower = activeVal.toLowerCase();
				if (gameValLower === activeValLower) {
					return true;
				}
				return gameValLower.includes(activeValLower) || activeValLower.includes(gameValLower);
			});
		});
	}

	if (filterType === 'regionCode' && game.id) {
		const regionCode = game.id[3];
		if (!regionCode) {
			return false;
		}
		return regionCode === activeValue;
	}

	if (filterType === 'type') {
		if (!game.type) {
			return activeValue === 'Unknown';
		}
		return game.type === activeValue;
	}

	return gameValue === activeValue;
}

function updateStats() {
	statsElement.innerHTML = `<b>Stats:</b> ${db.length} total games, ${filteredGames.length} shown`;
}

/**
 * Populates a select element with options.
 * @param {HTMLSelectElement} selectElement - The select element to populate.
 * @param {string[]} options
 * @param {string} selectedValue - The value to select by default.
 * @param {Record<string, string>} nameMapping - Custom key-value name mapping
 */
function populateDropdown(selectElement, options, selectedValue, nameMapping = {}) {
	const placeholder = selectElement.options[0];

	const uniqueOptionsMap = new Map();

	options.forEach(option => {
		const lowerOption = option.trim().toLowerCase();
		if (!uniqueOptionsMap.has(lowerOption) || option === selectedValue) {
			uniqueOptionsMap.set(lowerOption, option);
		}
	});

	selectElement.innerHTML = '';
	selectElement.appendChild(placeholder);

	const filteredOptions = Array.from(uniqueOptionsMap.values())
		.filter(option => option !== 'Unknown' && option !== '...');

	/**
	 * @type {{name:string;value:string}[]}
	 */
	const sortedOptions = filteredOptions.map((option) => {
		const mappedName = nameMapping?.[option];
		return {
			name: mappedName ? `${option} - ${mappedName}` : option,
			value: option,
		};
	}).sort((a, b) => {
		const aStripped = a.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
		const bStripped = b.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
		return aStripped.localeCompare(bStripped);
	});

	if (options.includes('Unknown') && DISPLAY_UNKNOWN_FILTER) {
		const unknownElement = document.createElement('option');
		unknownElement.value = 'Unknown';
		unknownElement.textContent = 'Unknown';

		if ('Unknown' === selectedValue) {
			unknownElement.selected = true;
		}

		selectElement.appendChild(unknownElement);
	}

	sortedOptions.forEach((option) => {
		const optionElement = document.createElement('option');
		optionElement.value = option.value;
		optionElement.textContent = option.name;

		if (option.value === selectedValue) {
			optionElement.selected = true;
		}

		selectElement.appendChild(optionElement);
	});
}

function populateFilterDropdowns() {
	populateDropdown(regionFilterElement, filters.region, activeFilters.region, regionNames);
	populateDropdown(languageFilterElement, filters.language, activeFilters.language, languageNames);
	populateDropdown(developerFilterElement, filters.developer, activeFilters.developer);
	populateDropdown(publisherFilterElement, filters.publisher, activeFilters.publisher);
	populateDropdown(
		regionCodeFilterElement,
		Array.from(
			new Set(db.map((game) => game.id?.[3]).filter((c) => RegExp(/[A-Z]/i).exec(c))),
		).sort(),
		activeFilters.regionCode,
		regionCodeNames,
	);
	populateDropdown(systemTypeFilterElement, filters.type, activeFilters.type, systemTypeNames);
}

function calculateFilterOptions() {
	let regions = new Set();
	let languages = new Set();
	let developers = new Set();
	let publishers = new Set();
	let systemTypes = new Set();

	for (const game of db) {
		if (game.region) {
			regions.add(game.region);
		}
		if (game.language) {
			languages.add(game.language);
		}
		if (game.developer) {
			developers.add(game.developer);
		}
		if (game.publisher) {
			publishers.add(game.publisher);
		}
		if (game.type) {
			systemTypes.add(game.type);
		}
	}

	filters = {
		region: Array.from(regions).sort(),
		language: Array.from(languages).sort(),
		developer: Array.from(developers).sort(),
		publisher: Array.from(publishers).sort(),
		type: Array.from(systemTypes).sort(),
	};

	localStorage.setItem(LS_FILTERS_KEY, JSON.stringify(filters));
}

/**
 * Render the game table
 * @param {number} page
 */
function renderTable(page = 1) {
	currentPage = page;

	if (db.length === 0) {
		areaElement.innerHTML = '<p><i>No games loaded. Importing XML data...</i></p>';
		paginationTopElement.innerHTML = '';
		paginationBottomElement.innerHTML = '';
		return;
	}

	const startIndex = (currentPage - 1) * PAGINATION_TABLE_ROWS;
	const endIndex = Math.min(startIndex + PAGINATION_TABLE_ROWS, filteredGames.length);
	const totalPages = Math.ceil(filteredGames.length / PAGINATION_TABLE_ROWS);
	const displayGames = filteredGames.slice(startIndex, endIndex);

	// Table generator start
	let html = `
	<table>
	  <thead>
	    <tr>
	    	<th></th>
	    	<th></th>
	    	<th></th>
	      <th>ID</th>
        <th>Name</th>
        <th>Region</th>
        <th>Languages</th>
        <th>Developer</th>
        <th>Publisher</th>
        <th>Actions</th>
	    </tr>
	  </thead>
	  <tbody>
	`;

	for (const game of displayGames) {
		const coverSrc = `index.php?action=get_asset&type=cover&id=${encodeURIComponent(game.id)}`;
		const discSrc = `index.php?action=get_asset&type=disc&id=${encodeURIComponent(game.id)}`;

		// Start row
		html += '<tr>';
		// Checkbox
		html += `
		<td class='fit-cell'>
			<input
				type='checkbox'
				${game.checked ? 'checked' : ''}
				title='${game.checked ? 'Do I still want to keep this game?' : 'Do I own this game?'}'
				onchange='toggleChecked("${game.id}")'
			/>
		</td>`;
		// Cover art
		html += `
    <td class='overflow-protect fit-cell'>
    	<img
    		src='${coverSrc}'
    		data-img-src='${coverSrc}'
    		alt=''
    		loading='lazy'
    		class='image-asset-inline'
    	/>
    </td>`;
		// Disc art
		html += `
		<td class='overflow-protect fit-cell'>
			<img
				src='${discSrc}'
				data-img-src='${discSrc}'
				alt=''
				loading='lazy'
				class='image-asset-inline'
			/>
		</td>`;
		// ID
		html += `<td class='mono'>${game.id}</td>`;
		// Name
		html += `
		<td
			class='overflow-protect ${ifEmpty(game.name, 'bg-cell-danger')}'
			style='max-width: 300px'
			title='${game.name}'
		>
			${game.title}
		</td>`;
		// Region
		html += `
		<td
			class='overflow-protect ${ifEmpty(game.region, 'bg-cell-danger')}'
			style='white-space: nowrap'
		>
			${generateRegionFlagHtml(game)}
		</td>`;

		// Languages
		html += `
		<td
			class='overflow-protect ${ifEmpty(game.language, 'bg-cell-danger')}'
			style='max-width: 150px'
		>`;


		const languageAssets = getFlagSrc(game);
		languageAssets.forEach((assetUrl) => {
			html += buildFlagElement(assetUrl.code, assetUrl.name, assetUrl.url);
		});

		html += `</td>`;

		// Developer
		html += `
		<td
			class='overflow-protect ${ifEmpty(game.developer, 'bg-cell-danger')}'
			style='max-width: 150px'
		>`;
		if (game.developer) {
			const developers = game.developer.split(' / ').map(dev => dev.trim());
			developers.forEach((dev, index) => {
				html += `${escapeUnknownStr(dev)}${index < developers.length - 1 ? '<br>' : ''}`;
			});
		}
		html += `</td>`;

		// Publisher
		html += `
		<td
			class='overflow-protect ${ifEmpty(game.publisher, 'bg-cell-danger')}'
			style='max-width: 150px'
		>`;
		if (game.publisher) {
			const publishers = game.publisher.split(' / ').map(pub => pub.trim());
			publishers.forEach((pub, index) => {
				html += `${escapeUnknownStr(pub)}${index < publishers.length - 1 ? '<br>' : ''}`;
			});
		}
		html += `</td>`;

		// Action buttons
		html += `
    <td>
			<button class='btn-danger' onclick='showDeleteDialog("${game.id}")'>Delete</button>
		</td>
		`;

		// End row
		html += '</tr>';
	}

	// Fix table generator end
	html += `</tbody></table>`;

	if (displayGames.length === 0) {
		html += '<p style="text-align: center"><i>No games found matching the current filters, please adjust your filters. :(</i></p>';
	}

	areaElement.innerHTML = html;

	attachImageEventListeners();
	renderPagination(totalPages, currentPage);
}

/**
 * Show a native confirmation dialog for deleting a game
 * @param {string} gameId
 */
function showDeleteDialog(gameId) {
	const game = db.find(g => g.id === gameId);
	if (!game) {
		showMessage(`Game with ID ${gameId} not found.`, 'error');
		return;
	}

	const existingDialog = document.getElementById(`dia-del-${gameId}`);
	if (existingDialog) {
		document.body.removeChild(existingDialog);
	}

	const dialog = document.createElement('dialog');
	dialog.id = `dia-del-${gameId}`;
	dialog.innerHTML = `
	<div class='dialog-container'>
		<img
			src='index.php?action=get_asset&type=cover&id=${encodeURIComponent(gameId)}'
			alt=''
			onerror="this.onerror=null; this.src='/assets/images/missing_cover.png';"
		/>
		<div class='dialog-body'>
			<h3>Do you want to <span style='color: var(--danger-color)'>delete</span> this game?</h3>
			<table>
				<tbody>
					<tr>
						<td>Game ID:</td>
						<td>${gameId}</td>
					</tr>
					<tr>
						<td>Game Name:</td>
						<td>${game.name}</td>
					</tr>
					<tr>
						<td>System Type:</td>
						<td>${game.type}</td>
					</tr>
				</tbody>
			</table>
			<div class='button-tray'>
				<button id='closeDeleteDialog-${gameId}'>Close</button>
				<button class='btn-danger' id='confirmDeleteBtn-${gameId}'>DELETE</button>
			</div>
		</div>
	</div>`;

	document.body.appendChild(dialog);

	const closeButton = document.getElementById(`closeDeleteDialog-${gameId}`);
	if (closeButton) {
		closeButton.addEventListener('click', () => {
			dialog.close();
			document.body.removeChild(dialog);
		});
	}

	const confirmButton = document.getElementById(`confirmDeleteBtn-${gameId}`);
	if (confirmButton) {
		confirmButton.addEventListener('click', () => {
			deleteGame(game);
			dialog.close();
			document.body.removeChild(dialog);
		});
	}

	dialog.showModal();
}

/**
 * Toggle the checked state of a game
 * @param {string} gameId
 */
function toggleChecked(gameId) {
	const index = db.findIndex((game) => game.id === gameId);
	if (index !== -1) {
		db[index].checked = !db[index].checked;
		localStorage.setItem(LS_GAME_DB_KEY, JSON.stringify(db));
		applyFilters();
	}
}

/**
 * Generate flag image element
 * @param {Object} game
 */
function generateRegionFlagHtml(game) {
	let html = '';

	if (game.region.trim()) {
		const regCode = game.id.charAt(3).toUpperCase();
		const region = game.region.trim();

		switch (region) {
			case 'NTSC-J':
				html += buildFlagElement('JP', game.region);
				break;
			case 'NTSC-K':
				html += buildFlagElement('KR', game.region);
				break;
			case 'NTSC-T':
				html += buildFlagElement('TW', game.region);
				break;
			case 'NTSC-U':
				html += buildFlagElement('US', game.region);
				break;
			case 'PAL':
				if (regCode === 'X') {
					html += buildFlagElement('UN', 'Region Free', '', false);
					html += buildFlagElement('EU', game.region);
				} else if (regCode === 'D') {
					html += buildFlagElement('DE', game.region);
				} else if (regCode === 'F') {
					html += buildFlagElement('FR', game.region);
				} else if (regCode === 'I') {
					html += buildFlagElement('IT', game.region);
				} else if (regCode === 'S') {
					html += buildFlagElement('ES', game.region);
				} else {
					html += buildFlagElement('EU', game.region);
				}
				break;
			case 'PAL-R':
				html += buildFlagElement('RU', game.region);
				break;
		}
	}

	return html;
}

/**
 * Build a flag image element
 * @param {string} code
 * @param {string} name
 * @param {string} url
 * @param {boolean} displayCode - Whether to display the code in the tooltip (title)
 */
function buildFlagElement(code, name = '', url = '', displayCode = true) {
	return `
	<img
		src='${url || `assets/images/flags/${code}_64.png`}'
		alt='${code}'
		title='${name}${displayCode ? ` (${code})` : ''}'
		loading='lazy'
		class='flag-smol-inline'
	/>`;
}

/**
 * Render pagination controls
 * @param {number} totalPages
 * @param {number} currentPage
 */
function renderPagination(totalPages, currentPage) {
	const scrollingEnabled = document.body.scrollHeight > window.innerHeight + 20;

	let html = '<div class="pagination-controls">';

	if (totalPages > 1) {
		html += `<button onclick='renderTable(${currentPage - 1})' ${currentPage <= 1 ? 'disabled' : ''}>&lt; Prev</button>`;
		html += `<button onclick='renderTable(${currentPage + 1})' ${currentPage >= totalPages ? 'disabled' : ''}>Next &gt;</button>`;

		const startPage = Math.max(1, currentPage - 5);
		const endPage = Math.min(totalPages, startPage + 9);

		for (let page = startPage; page <= endPage; page++) {
			const className = page === currentPage ? 'current' : '';
			html += `<button class='${className}' onclick='renderTable(${page})'>${page}</button>`;
		}

		html += `<span class='pagination-info'>Page ${currentPage} of ${totalPages}</span>`;
	}

	if (scrollingEnabled) {
		html += `<button class='jumper' onclick="jumpToPosition('bottom')">Jump to Bottom &darr;</button>`;
	}

	html += '</div>';

	paginationTopElement.innerHTML = html;

	let bottomHtml = html;
	if (scrollingEnabled) {
		bottomHtml = bottomHtml.replace('Jump to Bottom &darr;', 'Jump to Top &uarr;');
		bottomHtml = bottomHtml.replace('onclick="jumpToPosition(\'bottom\')"', 'onclick="jumpToPosition(\'top\')"');
	}

	paginationBottomElement.innerHTML = bottomHtml;
}

/**
 * @param {JumpPosition} position
 */
function jumpToPosition(position) {
	if (position === 'top') {
		window.scrollTo({ top: 0, behavior: 'instant' });
	} else if (position === 'bottom') {
		window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
	}
}

/**
 * Get the source URL for a flag image
 * @param {Game} game
 */
function getFlagSrc(game) {
	/**
	 * @type {LanguageSrc[]}
	 */
	const flagAssetUrls = [];

	const langCodes = game.language.split(',').map((lang) => lang.trim());
	langCodes.forEach((langCode) => {
		let flagCode = langCode.toUpperCase();

		const languageNames = {
			DE: 'German',
			DK: 'Danish',
			EN: 'English',
			ES: 'Spanish',
			FI: 'Finnish',
			FR: 'French',
			GR: 'Greek',
			IT: 'Italian',
			JA: 'Japanese',
			KO: 'Korean',
			NL: 'Dutch',
			NO: 'Norwegian',
			PT: 'Portuguese',
			RU: 'Russian',
			SE: 'Swedish',
			TR: 'Turkish',
			ZHCN: 'Chinese (Simplified, Mainland China)',
			ZHTW: 'Chinese (Traditional, Taiwan)',
		};

		// Map language codes to flag codes (asset names)
		const flagMapping = {
			EN: 'GB',
			JA: 'JP',
			KO: 'KR',
			ZHCN: 'CN',
			ZHTW: 'TW',
		};

		const langName = languageNames[langCode];
		const regCode = game.id.charAt(3).toUpperCase();

		if (flagCode === 'EN' && ['E', 'N'].includes(regCode)) {
			flagCode = 'US';
		} else if (flagCode === 'EN' && regCode === 'U') {
			flagCode = 'AU';
		} else if (flagMapping[flagCode]) {
			flagCode = flagMapping[flagCode];
		}

		flagAssetUrls.push({
			name: langName || '',
			code: flagCode,
			url: `assets/images/flags/${flagCode}_64.png`,
		});
	});

	return flagAssetUrls;
}

function attachImageEventListeners() {
	const images = document.querySelectorAll('.image-asset-inline');
	images.forEach(img => {
		img.addEventListener('mouseover', /*** @param {MouseEvent} event */ function (event) {
			const src = this.getAttribute('data-img-src');
			handleImgMouseOver(src, event);
		});

		img.addEventListener('mouseout', function () {
			handleImgMouseOut();
		});
	});
}

// Hover effect for images
let hoverTimeout;

/**
 * Handle mouse over event for images
 * @param {string} src - The source URL of the image
 * @param {MouseEvent} event
 */
function handleImgMouseOver(src, event) {
	clearTimeout(hoverTimeout);
	hoverTimeout = setTimeout(() => {
		const tooltip = document.getElementById('imgTooltip');
		tooltip.innerHTML = `<img src='${src}' alt='' class='img-tooltip-preview' />`;
		positionFixedTooltip(tooltip, event);
		tooltip.style.display = 'block';
	}, 300);
}

/**
 * Position the tooltip based on the mouse event
 * @param {HTMLElement} tooltip
 * @param {MouseEvent} event
 */
function positionFixedTooltip(tooltip, event) {
	const vw = window.innerWidth;
	const vh = window.innerHeight;

	tooltip.style.maxWidth = '250px';
	tooltip.style.maxHeight = '250px';
	tooltip.style.display = 'block';
	tooltip.style.left = '-9999px';
	tooltip.style.top = '-9999px';

	const tooltipWidth = Math.min(tooltip.offsetWidth, 250);
	const tooltipHeight = Math.min(tooltip.offsetHeight, 250);
	const padding = 20;

	let left = event.clientX + padding;
	if (left + tooltipWidth + padding > vw) {
		left = event.clientX - tooltipWidth - padding;
	}
	left = Math.max(padding, left);
	left = Math.min(left, vw - tooltipWidth - padding);

	let top = event.clientY + padding;
	if (top + tooltipHeight + padding > vh) {
		top = event.clientY - tooltipHeight - padding;
	}
	top = Math.max(padding, top);
	top = Math.min(top, vh - tooltipHeight - padding);

	tooltip.style.left = `${left}px`;
	tooltip.style.top = `${top}px`;
}

function handleImgMouseOut() {
	clearTimeout(hoverTimeout);
	hideImgTooltip();
}

function hideImgTooltip() {
	const tooltip = document.getElementById('imgTooltip');
	if (tooltip) {
		tooltip.style.display = 'none';
	}
}

/**
 * Delete a game from the database
 * @param {Game} game
 */
function deleteGame(game) {
	const gameIndex = db.findIndex((g) => g.id === game.id);
	if (gameIndex !== -1) {
		db.splice(gameIndex, 1);
		localStorage.setItem(LS_GAME_DB_KEY, JSON.stringify(db));
		showMessage(`"${game.name}" (ID: ${game.id}) has been deleted successfully.`, 'success');
		applyFilters();
	} else {
		showMessage(`Game with ID ${game.id} not found.`, 'error');
	}
}

// Track message timeout
let messageTimeout;

/**
 * Show a message element
 * @param {string} text  - The message text to display
 * @param {MessageType} type - The type of message
 */
function showMessage(text, type) {
	if (messageTimeout) {
		clearTimeout(messageTimeout);
		messageTimeout = null;
	}

	if (text) {
		messageElement.textContent = text;
		messageElement.className = type ? `message ${type}` : 'message';
		messageElement.style.display = 'block';

		messageTimeout = setTimeout(() => {
			messageElement.style.display = 'none';
			messageTimeout = null;
		}, MESSAGE_TIMEOUT_MS);
	} else {
		messageElement.style.display = 'none';
	}
}

/**
 * Show or hide the loading element
 * @param {boolean} show - Whether to show or hide the loading element
 */
function showLoading(show) {
	loadingElement.style.display = show ? 'block' : 'none';
}

/**
 * Escape "unknown" string values
 * @param {string} value
 */
function escapeUnknownStr(value) {
	return value.toLocaleLowerCase() === 'unknown' ? '' : value;
}

/**
 * Debounce function to limit how often a function can be called
 * @param func
 * @param delayMs
 */
function debounce(func, delayMs) {
	let timeout;
	return function (...args) {
		const ctx = this;
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(ctx, args), delayMs);
	};
}

/**
 * Parse a string of attributes separated by slashes and commas
 * @param {string} attrStr
 */
function parseAttributeString(attrStr) {
	if (!attrStr) {
		return [];
	}
	const companySuffixes = [
		'Inc', 'Inc.',
		'LLC',
		'Ltd', 'Ltd.',
		'Limited',
		'Corp.', 'Corporation', 'Co.',
		'Co., Ltd.', 'Co. Ltd.', 'Co Ltd',
		'GmbH',
		'S.A.B.',
	];

	const isCompanySuffix = (str) => companySuffixes.some(suffix => str.trim().toLowerCase() === suffix.toLowerCase());

	const slashParts = attrStr.split('/').map(part => part.trim());
	let values = [];

	slashParts.forEach(part => {
		const commaParts = part.split(',').map(p => p.trim());
		let currentValue = '';
		commaParts.forEach(commaPart => {
			if (isCompanySuffix(commaPart) && currentValue) {
				currentValue += ', ' + commaPart;
			} else {
				if (currentValue) {
					values.push(currentValue);
				}
				currentValue = commaPart;
			}
		});
		if (currentValue) {
			values.push(currentValue);
		}
	});

	return values.filter(Boolean);
}

/**
 * Check if a value is empty and return a default value if it is
 * @param {string} value
 * @param {string} defaultValue
 */
function ifEmpty(value, defaultValue) {
	return value.trim() === '' ? defaultValue : value;
}
