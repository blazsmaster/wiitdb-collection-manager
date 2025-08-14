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
import { renderTable, showDeleteDialog } from './helpers/tableGenerator.js';
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
	hideDemoElement.addEventListener('change', applyFilters);
	hideServiceElement.addEventListener('change', applyFilters);
	hideCustomElement.addEventListener('change', applyFilters);
	hideIncompleteElement.addEventListener('change', applyFilters);
	hideVirtualConsoleElement.addEventListener('change', applyFilters);
	hideWiiWareElement.addEventListener('change', applyFilters);
	hideHomebrewElement.addEventListener('change', applyFilters);

	// Filters
	regionFilterElement.addEventListener('change', function () {
		const activeFilters = {
			region: this.value,
			language: languageFilterElement.value,
			developer: developerFilterElement.value,
			publisher: publisherFilterElement.value,
			regionCode: regionCodeFilterElement.value,
			type: systemTypeFilterElement.value,
		};
		setActiveFilters(activeFilters);
		applyFilters();
	});

	languageFilterElement.addEventListener('change', function () {
		const activeFilters = {
			region: regionFilterElement.value,
			language: this.value,
			developer: developerFilterElement.value,
			publisher: publisherFilterElement.value,
			regionCode: regionCodeFilterElement.value,
			type: systemTypeFilterElement.value,
		};
		setActiveFilters(activeFilters);
		applyFilters();
	});

	developerFilterElement.addEventListener('change', function () {
		const activeFilters = {
			region: regionFilterElement.value,
			language: languageFilterElement.value,
			developer: this.value,
			publisher: publisherFilterElement.value,
			regionCode: regionCodeFilterElement.value,
			type: systemTypeFilterElement.value,
		};
		setActiveFilters(activeFilters);
		applyFilters();
	});

	publisherFilterElement.addEventListener('change', function () {
		const activeFilters = {
			region: regionFilterElement.value,
			language: languageFilterElement.value,
			developer: developerFilterElement.value,
			publisher: this.value,
			regionCode: regionCodeFilterElement.value,
			type: systemTypeFilterElement.value,
		};
		setActiveFilters(activeFilters);
		applyFilters();
	});

	regionCodeFilterElement.addEventListener('change', function () {
		const activeFilters = {
			region: regionFilterElement.value,
			language: languageFilterElement.value,
			developer: developerFilterElement.value,
			publisher: publisherFilterElement.value,
			regionCode: this.value,
			type: systemTypeFilterElement.value,
		};
		setActiveFilters(activeFilters);
		applyFilters();
	});

	systemTypeFilterElement.addEventListener('change', function () {
		const activeFilters = {
			region: regionFilterElement.value,
			language: languageFilterElement.value,
			developer: developerFilterElement.value,
			publisher: publisherFilterElement.value,
			regionCode: regionCodeFilterElement.value,
			type: this.value,
		};
		setActiveFilters(activeFilters);
		applyFilters();
	});
}

window.toggleChecked = toggleChecked;
window.showDeleteDialog = showDeleteDialog;
window.renderTable = renderTable;
window.jumpToPosition = jumpToPosition;

setupEventListeners();

export { initApp, setupEventListeners };
