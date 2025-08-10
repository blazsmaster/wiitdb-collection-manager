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
	regionCode: '',
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

// UI Filters
const regionFilterElement = document.getElementById('regionFilter');
const languageFilterElement = document.getElementById('languageFilter');
const developerFilterElement = document.getElementById('developerFilter');
const publisherFilterElement = document.getElementById('publisherFilter');
const searchInputElement = document.getElementById('searchInput');
const searchFieldElement = document.getElementById('searchField');
const hideDemoElement = document.getElementById('hideDemo');
const regionCodeFilterElement = document.getElementById('regionCodeFilter');

// Event listeners
document.addEventListener('DOMContentLoaded', initApp);

searchInputElement.addEventListener('input', debounce(applyFilters, DEBOUNCE_DELAY));
searchFieldElement.addEventListener('change', applyFilters);

hideDemoElement.addEventListener('change', applyFilters);

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

	filteredGames = db.filter((game) => {
		if (hideDemo && isMatchingDemo(game)) {
			return false;
		}
		if (searchTerm && searchField && !matchesSearchTerm(game, searchField, searchTerm)) {
			return false;
		}
		return matchesFilter(game, 'region') &&
			matchesFilter(game, 'language') &&
			matchesFilter(game, 'developer') &&
			matchesFilter(game, 'publisher') &&
			matchesFilter(game, 'regionCode');
	});

	updateStats();
	renderTable();
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
		const values = game[field].toLowerCase().split(',').map(v => v.trim());
		return values.some(value => value.includes(searchTerm));
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

	if (filterType === 'language' && gameValue) {
		return gameValue.toLowerCase().includes(activeValue.toLowerCase());
	}

	if ((filterType === 'developer' || filterType === 'publisher') && gameValue) {
		const values = gameValue.split(',').map(v => v.trim());
		return values.includes(activeValue);
	}

	if (filterType === 'regionCode' && game.id) {
		const regionCode = game.id[3];
		if (!regionCode) {
			return false;
		}
		return regionCode === activeValue;
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
	populateDropdown(
		regionCodeFilterElement,
		Array.from(
			new Set(db.map((game) => game.id?.[3]).filter((c) => RegExp(/[A-Z]/i).exec(c))),
		).sort(),
		activeFilters.regionCode,
	);
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
		html += `<td class='overflow-protect' style='max-width: 300px' title='${game.name}'>${game.title}</td>`;
		// Region
		html += `<td class='overflow-protect' style='white-space: nowrap'>${generateRegionFlagHtml(game)}</td>`;

		// Languages
		html += `<td class='overflow-protect' style='max-width: 150px'>`;

		const languageAssets = getFlagSrc(game);
		languageAssets.forEach((assetUrl) => {
			html += buildFlagElement(assetUrl.code, assetUrl.name, assetUrl.url);
		});

		html += `</td>`;

		// Developer
		html += `<td class='overflow-protect' style='max-width: 150px'>${escapeUnknownStr(game.developer)}</td>`;
		// Publisher
		html += `<td class='overflow-protect' style='max-width: 150px'>${escapeUnknownStr(game.publisher)}</td>`;

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

	attachImageEventListeners();
	renderPagination(totalPages, currentPage);
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
	if (totalPages <= 1) {
		paginationTopElement.innerHTML = '';
		paginationBottomElement.innerHTML = '';
		return;
	}

	let html = '<div class="pagination-controls">';

	if (currentPage > 1) {
		html += `<button onclick='renderTable(${currentPage - 1})'>&lt; Prev</button>`;
	}

	if (currentPage < totalPages) {
		html += `<button onclick='renderTable(${currentPage + 1})'>Next &gt;</button>`;
	}

	const startPage = Math.max(1, currentPage - 5);
	const endPage = Math.min(totalPages, startPage + 9);

	for (let page = startPage; page <= endPage; page++) {
		const className = page === currentPage ? 'current' : '';
		html += `<button class='${className}' onclick='renderTable(${page})'>${page}</button>`;
	}

	html += `<span class='pagination-info'>Page ${currentPage} of ${totalPages}</span>`;
	html += '</div>';

	paginationTopElement.innerHTML = html;
	paginationBottomElement.innerHTML = html;
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
