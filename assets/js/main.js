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
};
/**
 * @type {ActiveFilter}
 */
let activeFilters = {
	region: '',
	language: '',
	developer: '',
	publisher: '',
};

// Storage keys
const LS_GAME_DB_KEY = 'gameDB';
const LS_FILTERS_KEY = 'filters';

// Values config
const DEBOUNCE_DELAY = 300;
const DISPLAY_UNKNOWN_FILTER = true;
const MESSAGE_TIMEOUT_MS = 5000;

// UI
const messageElement = document.getElementById('message');
const loadingElement = document.getElementById('loading');
const statsElement = document.getElementById('stats');
const areaElement = document.getElementById('area');

// UI Filters
const regionFilterElement = document.getElementById('regionFilter');
const languageFilterElement = document.getElementById('languageFilter');
const developerFilterElement = document.getElementById('developerFilter');
const publisherFilterElement = document.getElementById('publisherFilter');
const searchInputElement = document.getElementById('searchInput');
const searchFieldElement = document.getElementById('searchField');

// Event listeners
document.addEventListener('DOMContentLoaded', initApp);

searchInputElement.addEventListener('input', debounce(applyFilters, DEBOUNCE_DELAY));
searchFieldElement.addEventListener('change', applyFilters);

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

	filteredGames = db.filter((game) => {
		if (searchTerm && searchField && !matchesSearchTerm(game, searchField, searchTerm)) {
			return false;
		}
		return matchesFilter(game, 'region') &&
			matchesFilter(game, 'language') &&
			matchesFilter(game, 'developer') &&
			matchesFilter(game, 'publisher');
	});

	updateStats();
	renderTable();
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
		const values = game[field].toLowerCase().split(',').map(v => v.trim());
		return values.some(value => value.includes(searchTerm));
	}
	return game[field].toLowerCase().includes(searchTerm);
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

	if (filterType === 'language' && gameValue) {
		return gameValue.toLowerCase().includes(activeValue.toLowerCase());
	}

	if ((filterType === 'developer' || filterType === 'publisher') && gameValue) {
		const values = gameValue.split(',').map(v => v.trim());
		return values.includes(activeValue);
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
 */
function populateDropdown(selectElement, options, selectedValue) {
	const placeholder = selectElement.options[0];
	selectElement.innerHTML = '';
	selectElement.appendChild(placeholder);

	const sortedOptions = [...options].filter(option => option !== 'Unknown');
	sortedOptions.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

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
		optionElement.value = option;
		optionElement.textContent = option;

		if (option === selectedValue) {
			optionElement.selected = true;
		}

		selectElement.appendChild(optionElement);
	});
}

function populateFilterDropdowns() {
	populateDropdown(regionFilterElement, filters.region, activeFilters.region);
	populateDropdown(languageFilterElement, filters.language, activeFilters.language);
	populateDropdown(developerFilterElement, filters.developer, activeFilters.developer);
	populateDropdown(publisherFilterElement, filters.publisher, activeFilters.publisher);
}

function calculateFilterOptions() {
	let regions = new Set();
	let languages = new Set();
	let developers = new Set();
	let publishers = new Set();

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
	}

	filters = {
		region: Array.from(regions).sort(),
		language: Array.from(languages).sort(),
		developer: Array.from(developers).sort(),
		publisher: Array.from(publishers).sort(),
	};

	localStorage.setItem(LS_FILTERS_KEY, JSON.stringify(filters));
}

function renderTable() {
	if (db.length === 0) {
		areaElement.innerHTML = '<p><i>No games loaded. Importing XML data...</i></p>';
		return;
	}

	// Table generator start
	let html = `
	<table>
	  <thead>
	    <tr>
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

	for (const game of filteredGames) {
		// Start row
		html += '<tr>';
		// ID
		html += `<td class='mono'>${game.id}</td>`;
		// Name
		html += `<td class='overflow-protect' style='max-width: 300px'>${game.name}</td>`;
		// Region
		html += `<td class='overflow-protect' style='white-space: nowrap'>${escapeUnknownStr(game.region)}</td>`;
		// Languages
		html += `<td class='overflow-protect' style='max-width: 150px'>${escapeUnknownStr(game.language)}</td>`;
		// Developer
		html += `<td class='overflow-protect' style='max-width: 200px'>${escapeUnknownStr(game.developer)}</td>`;
		// Publisher
		html += `<td class='overflow-protect' style='max-width: 200px'>${escapeUnknownStr(game.publisher)}</td>`;

		// Action buttons
		html += `
    <td>
			<button class='btn' onclick='deleteGame("${game.id}", "${game.name}")'>Delete</button>
		</td>
		`;

		// End row
		html += '</tr>';
	}

	// Fix table generator end
	html += `</tbody></table>`;

	areaElement.innerHTML = html;
}

/**
 * Delete a game from the database
 * @param {string} gameId
 * @param {string} gameName
 */
function deleteGame(gameId, gameName) {
	const dia = confirm(`Are you sure you want to delete this game?\n\n"${gameName}" (ID: ${gameId})`);
	if (dia) {
		const gameIndex = db.findIndex((g) => g.id === gameId);
		if (gameIndex !== -1) {
			db.splice(gameIndex, 1);
			localStorage.setItem(LS_GAME_DB_KEY, JSON.stringify(db));

			showMessage(`"${gameName}" (ID: ${gameId}) has been deleted successfully.`, 'success');
			applyFilters();
		}
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
