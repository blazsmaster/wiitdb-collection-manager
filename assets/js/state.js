import { LS_PAGINATION_LIMIT_KEY, PAGINATION_DEFAULT_LIMIT, PAGINATION_LIMIT_OPTIONS } from './globals.js';

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
let paginationLimit = PAGINATION_DEFAULT_LIMIT;

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

export function setPaginationLimit(limit) {
	if (typeof limit === 'number' && PAGINATION_LIMIT_OPTIONS.includes(limit)) {
		paginationLimit = limit;
	} else {
		paginationLimit = PAGINATION_DEFAULT_LIMIT;
	}

	localStorage.setItem(LS_PAGINATION_LIMIT_KEY, paginationLimit);
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

export function getPaginationLimit() {
	const limit = localStorage.getItem(LS_PAGINATION_LIMIT_KEY);
	if (limit && PAGINATION_LIMIT_OPTIONS.includes(Number(limit))) {
		return Number(limit);
	}
	return paginationLimit;
}
