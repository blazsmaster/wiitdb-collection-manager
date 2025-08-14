import { LS_FILTERS_KEY, LS_GAME_DB_KEY } from '../globals.js';
import { getDb, setDb, setFilters } from '../state.js';
import { applyFilters, populateFilterDropdowns } from './filters.js';
import { showLoading, showMessage } from './ui.js';

export function loadGamesFromLocalStorage() {
	const storedGames = localStorage.getItem(LS_GAME_DB_KEY);
	const storedFilters = localStorage.getItem(LS_FILTERS_KEY);

	if (storedGames) {
		setDb(JSON.parse(storedGames));
		if (storedFilters) {
			setFilters(JSON.parse(storedFilters));
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

export function importXML() {
	showLoading(true);
	showMessage('', '');

	fetch('index.php?action=import_xml')
		.then((response) => response.json())
		.then(/*** @param {ImportXmlResponse} data*/(data) => {
			if (data.success) {
				setDb(data.games);
				setFilters(data.filters);

				localStorage.setItem(LS_GAME_DB_KEY, JSON.stringify(data.games));
				localStorage.setItem(LS_FILTERS_KEY, JSON.stringify(data.filters));

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

export function calculateFilterOptions() {
	let regions = new Set();
	let languages = new Set();
	let developers = new Set();
	let publishers = new Set();
	let systemTypes = new Set();

	const db = getDb();

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

	const filters = {
		region: Array.from(regions).sort(),
		language: Array.from(languages).sort(),
		developer: Array.from(developers).sort(),
		publisher: Array.from(publishers).sort(),
		type: Array.from(systemTypes).sort(),
	};

	setFilters(filters);
	localStorage.setItem(LS_FILTERS_KEY, JSON.stringify(filters));
}

/**
 * Toggle the checked state of a game
 * @param {string} gameId
 */
export function toggleChecked(gameId) {
	const db = getDb();
	const index = db.findIndex((game) => game.id === gameId);
	if (index !== -1) {
		db[index].checked = !db[index].checked;
		localStorage.setItem(LS_GAME_DB_KEY, JSON.stringify(db));
		applyFilters();
	}
}

/**
 * Delete a game from the database
 * @param {Game} game
 */
export function deleteGame(game) {
	const db = getDb();
	const index = db.findIndex((g) => g.id === game.id);
	if (index !== -1) {
		db.splice(index, 1);
		localStorage.setItem(LS_GAME_DB_KEY, JSON.stringify(db));
		showMessage(`"${game.name}" (ID: ${game.id}) has been deleted successfully.`, 'success');
		applyFilters();
	} else {
		showMessage(`Game with ID ${game.id} not found.`, 'error');
	}
}
