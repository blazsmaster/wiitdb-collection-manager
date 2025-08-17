import {
	advancedFilterElements,
	clearFilterButtonElement,
	developerFilterElement,
	filterElements,
	languageFilterElement,
	publisherFilterElement,
	regionCodeFilterElement,
	regionFilterElement,
	searchFieldElement,
	searchInputElement,
	systemTypeFilterElement,
} from './ui/domElements.js';
import { renderTable, showDeleteDialog, updatePaginationLimit } from './helpers/tableGenerator.js';
import { applyFilters, clearFilters } from './helpers/filters.js';
import { DEBOUNCE_DELAY } from './globals.js';
import { debounce } from './utils.js';
import { setActiveFilters } from './state.js';
import { jumpToPosition } from './helpers/ui.js';
import { loadGamesFromLocalStorage, toggleChecked } from './helpers/dataService.js';
import { setupDialogEventListeners } from './helpers/dialogs.js';

// Initialize the application
function initApp() {
	loadGamesFromLocalStorage();
}

function setupEventListeners() {
	document.addEventListener('DOMContentLoaded', initApp);

	// Clear filters
	clearFilterButtonElement.addEventListener('click', clearFilters);

	// Search
	searchInputElement.addEventListener('input', debounce(applyFilters, DEBOUNCE_DELAY));
	searchFieldElement.addEventListener('change', applyFilters);

	// Advanced checkbox filters
	advancedFilterElements.forEach((el) => el.addEventListener('change', applyFilters));

	// Filters
	filterElements.forEach((el) => {
		el.addEventListener('change', function () {
			const activeFilters = {
				region: regionFilterElement.value,
				language: languageFilterElement.value,
				developer: developerFilterElement.value,
				publisher: publisherFilterElement.value,
				regionCode: regionCodeFilterElement.value,
				type: systemTypeFilterElement.value,
			};
			setActiveFilters(activeFilters);
			applyFilters();
		});
	});
}

window.toggleChecked = toggleChecked;
window.showDeleteDialog = showDeleteDialog;
window.renderTable = renderTable;
window.jumpToPosition = jumpToPosition;
window.updatePaginationLimit = updatePaginationLimit;

setupEventListeners();
setupDialogEventListeners();

export { initApp, setupEventListeners };
