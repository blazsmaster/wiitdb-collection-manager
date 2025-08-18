import { DEFAULT_SETTINGS, LS_SETTINGS_KEY, SORT_ORDERS } from '../globals.js';
import { compactModeElement, settingsDialogElement, showTooltipsElement, tabColumnsElement } from '../ui/domElements.js';
import { TABLE_COLUMNS } from '../data/columns.js';

function validateSettings(settings) {
	if (typeof settings !== 'object' || typeof settings.table !== 'object' || settings.table === null) {
		return DEFAULT_SETTINGS;
	}

	const table = settings.table;

	const validatedTable = {
		columns: Array.isArray(table.columns) ? table.columns : [...DEFAULT_SETTINGS.table.columns],
		sortBy: typeof table.sortBy === 'string' ? table.sortBy : DEFAULT_SETTINGS.table.sortBy,
		sortOrder: SORT_ORDERS.includes(table.sortOrder) ? table.sortOrder : DEFAULT_SETTINGS.table.sortOrder,
		pagination: (table.pagination && typeof table.pagination.limit === 'number')
			? { limit: table.pagination.limit }
			: { limit: DEFAULT_SETTINGS.table.pagination.limit },
		compactMode: typeof table.compactMode === 'boolean' ? table.compactMode : DEFAULT_SETTINGS.table.compactMode,
	};

	return {
		...DEFAULT_SETTINGS,
		table: validatedTable,
	};
}

export function initSettingsDialog() {
	if (settingsDialogElement) {
		initSettingsControls();
	}
}

function createColumnCheckboxItem(col, checked) {
	return `
		<li>
			<label>
				<input type='checkbox' value='${col.id}' ${checked ? 'checked' : ''}>
				<span>${col.label || col.id}</span>
			</label>
		</li>
	`;
}

function initSettingsControls() {
	const settings = getSettings();

	// TABLE SETTINGS
	const tabColumnsList = tabColumnsElement;
	tabColumnsList.innerHTML = TABLE_COLUMNS.map((col) =>
		createColumnCheckboxItem(col, Array.isArray(settings.table.columns) && settings.table.columns.includes(col.id)),
	).join('');

	tabColumnsList.querySelectorAll('input[type=\'checkbox\'][value]').forEach((checkbox) => {
		checkbox.addEventListener('change', () => {
			updateTableColumnsSetting();
		});
	});

	// Display
	if (compactModeElement) {
		compactModeElement.checked = settings.table.compactMode || false;
		compactModeElement.addEventListener('change', () => {
			updateDisplaySettings();
		});
	}
}

function updateTableColumnsSetting() {
	const columnCheckboxes = tabColumnsElement.querySelectorAll('input[type="checkbox"][value]');
	const columns = Array.from(columnCheckboxes).filter((cb) => cb.checked).map(cb => cb.value);
	const settings = getSettings();
	settings.table.columns = columns;
	saveSettings(settings);
	if (window.renderTable) window.renderTable();
}

function updateDisplaySettings() {
	const settings = getSettings();
	settings.compactMode = compactModeElement?.checked || false;
	settings.showTooltips = showTooltipsElement?.checked !== false;

	saveSettings(settings);
	if (window.renderTable) window.renderTable();
}

export function getSettings() {
	let settings;
	try {
		settings = JSON.parse(localStorage.getItem(LS_SETTINGS_KEY));
	} catch {
		settings = DEFAULT_SETTINGS;
	}
	return validateSettings(settings);
}

function saveSettings(settings) {
	const validSettings = validateSettings(settings);
	localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(validSettings));
}

export function initSettingsIfMissing() {
	let settings;
	try {
		settings = JSON.parse(localStorage.getItem(LS_SETTINGS_KEY));
	} catch {
		settings = null;
	}
	if (!settings || typeof settings !== 'object' || typeof settings.table !== 'object' || settings.table === null) {
		localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
	}
}
