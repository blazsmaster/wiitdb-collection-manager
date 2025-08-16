import {
	clearFilterButtonElement,
	closeHelpButtonElement,
	developerFilterElement,
	helpButtonElement,
	helpDialogElement,
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
	systemTypeFilterElement,
} from './ui/domElements.js';
import { renderTable, showDeleteDialog, updatePaginationLimit } from './helpers/tableGenerator.js';
import { applyFilters, clearFilters } from './helpers/filters.js';
import { DEBOUNCE_DELAY } from './globals.js';
import { debounce } from './utils.js';
import { setActiveFilters } from './state.js';
import { jumpToPosition } from './helpers/ui.js';
import { loadGamesFromLocalStorage, toggleChecked } from './helpers/dataService.js';

// Initialize the application
function initApp() {
	loadGamesFromLocalStorage();
}

function setupEventListeners() {
	document.addEventListener('DOMContentLoaded', initApp);

	// Clear filters
	clearFilterButtonElement.addEventListener('click', clearFilters);

	// Help dialog
	helpButtonElement.addEventListener('click', function () {
		helpDialogElement.showModal();
	});
	closeHelpButtonElement.addEventListener('click', function () {
		helpDialogElement.close();
	});

	// Help dialog tabs
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

	// Search
	searchInputElement.addEventListener('input', debounce(applyFilters, DEBOUNCE_DELAY));
	searchFieldElement.addEventListener('change', applyFilters);

	// Advanced checkbox filters
	[
		hideDemoElement,
		hideServiceElement,
		hideCustomElement,
		hideIncompleteElement,
		hideVirtualConsoleElement,
		hideWiiWareElement,
		hideHomebrewElement,
	].forEach(el => el.addEventListener('change', applyFilters));

	// Filters
	const filterElements = [
		regionFilterElement,
		languageFilterElement,
		developerFilterElement,
		publisherFilterElement,
		regionCodeFilterElement,
		systemTypeFilterElement,
	];

	filterElements.forEach(el => {
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

export { initApp, setupEventListeners };
