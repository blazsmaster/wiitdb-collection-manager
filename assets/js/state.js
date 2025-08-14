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

// Setters
export function setDb(newDb) {
	db = newDb;
}

export function setFilteredGames(newFilteredGames) {
	filteredGames = newFilteredGames;
}

export function setFilters(newFilters) {
	filters = newFilters;
}

export function setActiveFilters(newActiveFilters) {
	activeFilters = newActiveFilters;
}

export function setCurrentPage(page) {
	currentPage = page;
}

// Getters
export function getDb() {
	return db;
}

export function getFilteredGames() {
	return filteredGames;
}

export function getFilters() {
	return filters;
}

export function getActiveFilters() {
	return activeFilters;
}

export function getCurrentPage() {
	return currentPage;
}
