// Storage keys
import { TABLE_COLUMNS } from './data/columns.js';

export const LS_GAME_DB_KEY = 'gameDB';
export const LS_FILTERS_KEY = 'filters';
export const LS_PAGINATION_LIMIT_KEY = 'paginationLimit';
export const LS_SETTINGS_KEY = 'settings';

// Values config
export const DEBOUNCE_DELAY = 300;
export const DISPLAY_UNKNOWN_FILTER = true;
export const MESSAGE_TIMEOUT_MS = 5000;

export const SORT_ORDERS = ['asc', 'desc'];

// Pagination
export const PAGINATION_LIMIT_OPTIONS = [10, 25, 50, 100, 250];
export const PAGINATION_DEFAULT_LIMIT = 100;

// Settings
/**
 * @type {Settings}
 */
export const DEFAULT_SETTINGS = {
	table: {
		columns: TABLE_COLUMNS.map((col) => col.id),
		sortBy: 'id',
		sortOrder: 'asc',
		pagination: {
			limit: PAGINATION_DEFAULT_LIMIT,
		},
	},
};
