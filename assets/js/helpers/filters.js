import {
	clearFilterButtonElement,
	developerFilterElement,
	hideCustomElement,
	hideDemoElement,
	hideHomebrewElement,
	hideIncompleteElement,
	hideServiceElement,
	hideVirtualConsoleElement,
	hideWiiWareElement,
	languageFilterElement,
	publisherFilterElement,
	regionCodeFilterElement,
	regionFilterElement,
	searchFieldElement,
	searchInputElement,
	statsElement,
	systemTypeFilterElement,
} from '../ui/domElements.js';
import { getActiveFilters, getDb, getFilteredGames, getFilters, setActiveFilters, setFilteredGames } from '../state.js';
import { parseAttributeString } from '../utils.js';
import { DISPLAY_UNKNOWN_FILTER } from '../globals.js';
import { languageNames, regionCodeNames, regionNames, systemTypeNames } from '../data/mappings.js';

export function applyFilters() {
	const searchTerm = searchInputElement.value.toLowerCase();
	const searchField = searchFieldElement.value;
	const hideDemo = hideDemoElement.checked;
	const hideService = hideServiceElement.checked;
	const hideCustom = hideCustomElement.checked;
	const hideIncomplete = hideIncompleteElement.checked;
	const hideVirtualConsole = hideVirtualConsoleElement.checked;
	const hideWiiWare = hideWiiWareElement.checked;
	const hideHomebrew = hideHomebrewElement.checked;

	const db = getDb();

	const filteredGames = db.filter((game) => {
		const gameType = game.type.toLowerCase();
		if (
			(hideCustom && gameType === 'custom') ||
			(hideVirtualConsole && gameType.startsWith('vc-')) ||
			(hideWiiWare && gameType === 'wiiware') ||
			(hideHomebrew && gameType === 'homebrew') ||
			(hideDemo && isMatchingDemo(game)) ||
			(hideService && isServiceTitle(game)) ||
			(hideIncomplete && hasUnknownValue(game))
		) {
			return false;
		}

		delete game.searchMatchDetails;

		if (searchTerm && searchField) {
			const result = matchesSearchTerm(game, searchField, searchTerm);
			if (!result.matches) {
				return false;
			}
			if (result.matchDetails) {
				game.searchMatchDetails = result.matchDetails;
			}
		}

		return matchesFilter(game, 'region') &&
			matchesFilter(game, 'language') &&
			matchesFilter(game, 'developer') &&
			matchesFilter(game, 'publisher') &&
			matchesFilter(game, 'regionCode') &&
			matchesFilter(game, 'type');
	});

	setFilteredGames(filteredGames);
	clearFilterButtonElement.style.display = atLeastOneActiveFilter() ? 'inline-block' : 'none';

	updateStats();
	renderTable();
}

export function clearFilters() {
	const activeFilters = {
		region: '',
		language: '',
		developer: '',
		publisher: '',
		regionCode: '',
		type: '',
	};

	setActiveFilters(activeFilters);

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
	const activeFilters = getActiveFilters();
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
 * @returns {MatchResult}
 */
function matchesSearchTerm(game, field, searchTerm) {
	if (!game[field]) {
		return { matches: false };
	}
	if (game[field].toLowerCase() === 'unknown') {
		return { matches: false };
	}

	if (field === 'developer' || field === 'publisher') {
		return matchDeveloperOrPublisher(game[field], field, searchTerm);
	}

	if (field === 'name') {
		return matchGameName(game, searchTerm);
	}

	return matchGenericField(game[field], field, searchTerm);
}

/**
 * Match developer or publisher fields
 * @param {string} fieldValue
 * @param {string} fieldName
 * @param {string} searchTerm
 * @returns {MatchResult}
 */
function matchDeveloperOrPublisher(fieldValue, fieldName, searchTerm) {
	const values = parseAttributeString(fieldValue);

	for (const value of values) {
		const valueLower = value.toLowerCase();
		const matchIndex = valueLower.indexOf(searchTerm);

		if (matchIndex !== -1) {
			return {
				matches: true,
				matchDetails: {
					field: fieldName,
					index: matchIndex,
					length: searchTerm.length,
					matchedValue: value,
				},
			};
		}
	}

	return { matches: values.some(value => value.toLowerCase().includes(searchTerm)) };
}

/**
 * Match game name field
 * @param {Game} game
 * @param {string} searchTerm
 * @returns {MatchResult}
 */
function matchGameName(game, searchTerm) {
	const titleLower = game['title'].toLowerCase();
	const titleIndex = titleLower.indexOf(searchTerm);

	if (titleIndex !== -1) {
		return {
			matches: true,
			matchDetails: {
				field: 'title',
				index: titleIndex,
				length: searchTerm.length,
			},
		};
	}

	const nameLower = game['name'].toLowerCase();
	const nameIndex = nameLower.indexOf(searchTerm);

	if (nameIndex !== -1) {
		return {
			matches: true,
			matchDetails: {
				field: 'name',
				index: nameIndex,
				length: searchTerm.length,
			},
		};
	}

	return { matches: false };
}

/**
 * Match a generic field with the search term
 * @param {string} fieldValue
 * @param {string} fieldName
 * @param {string} searchTerm
 * @returns {MatchResult}
 */
function matchGenericField(fieldValue, fieldName, searchTerm) {
	const valueLower = fieldValue.toLowerCase();
	const index = valueLower.indexOf(searchTerm);

	return {
		matches: index !== -1,
		matchDetails: index !== -1 ? {
			field: fieldName,
			index: index,
			length: searchTerm.length,
		} : undefined,
	};
}

/**
 * Check if a game matches a specific filter
 * @param {Game} game
 * @param {FilterOptions} filterType
 */
function matchesFilter(game, filterType) {
	const activeFilters = getActiveFilters();
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
	const db = getDb();
	const filteredGames = getFilteredGames();
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

export function populateFilterDropdowns() {
	const db = getDb();
	const filters = getFilters();
	const activeFilters = getActiveFilters();

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
