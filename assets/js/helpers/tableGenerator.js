import { getCurrentPage, getDb, getFilteredGames, setCurrentPage } from '../state.js';
import { areaElement, paginationBottomElement, paginationTopElement, searchInputElement } from '../ui/domElements.js';
import { PAGINATION_TABLE_ROWS } from '../globals.js';
import { attachImageEventListeners, showMessage } from './ui.js';
import { escapeUnknownStr, highlightMatchedText, ifEmpty } from '../utils.js';
import { deleteGame } from './dataService.js';
import { languageNames } from '../data/mappings.js';

/**
 * Render the game table
 * @param {number} page
 */
export function renderTable(page = 1) {
	const db = getDb();
	const filteredGames = getFilteredGames();

	setCurrentPage(page);
	const currentPage = getCurrentPage();

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

	// Generate table
	let html = generateTableHeader();

	// Generate rows
	for (const game of displayGames) {
		html += generateTableRow(game);
	}

	// End table
	html += `</tbody></table>`;

	if (displayGames.length === 0) {
		html += '<p style="text-align: center"><i>No games found matching the current filters, please adjust your filters. :(</i></p>';
	}

	areaElement.innerHTML = html;

	attachImageEventListeners();
	renderPagination(totalPages, currentPage);
}

function generateTableHeader() {
	return `
	<table>
	  <thead>
	    <tr>
	    	<th></th>
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
}

/**
 * Generates a table row for a game
 * @param {Game} game - The game to generate a row for
 */
function generateTableRow(game) {
	let html = '<tr>';

	// Checkbox
	html += generateCheckboxCell(game);
	// Cover art
	html += generateImageCell(`index.php?action=get_asset&type=cover&id=${encodeURIComponent(game.id)}`);
	// Disc art
	html += generateImageCell(`index.php?action=get_asset&type=disc&id=${encodeURIComponent(game.id)}`);
	// ID
	html += generateIdCell(game);
	// Name
	html += generateNameCell(game);
	// Region
	html += generateRegionCell(game);
	// Languages
	html += generateLanguagesCell(game);
	// Developers
	html += generateAttributeCell(game, 'developer');
	// Publishers
	html += generateAttributeCell(game, 'publisher');
	// Action buttons
	html += generateActionCell(game);

	// End row
	html += '</tr>';

	return html;
}

/**
 * Generates the checkbox cell
 * @param {Game} game
 */
function generateCheckboxCell(game) {
	return `
	<td class='fit-cell'>
		<input
			type='checkbox'
			${game.checked ? 'checked' : ''}
			title='${game.checked ? 'Do I still want to keep this game?' : 'Do I own this game?'}'
			onchange='toggleChecked("${game.id}")'
		/>
	</td>`;
}

/**
 * Generates an image cell
 * @param {string} src
 */
function generateImageCell(src) {
	return `
	<td class='overflow-protect fit-cell'>
		<img
			src='${src}'
			data-img-src='${src}'
			alt=''
			loading='lazy'
			class='image-asset-inline'
		/>
	</td>`;
}

/**
 * Generates the ID cell
 * @param {Game} game
 */
function generateIdCell(game) {
	let cellContent;
	if (game.searchMatchDetails && game.searchMatchDetails.field === 'id') {
		cellContent = highlightMatchedText(
			game.id,
			game.searchMatchDetails.index,
			game.searchMatchDetails.length,
		);
	} else {
		cellContent = game.id;
	}
	return `<td class='mono'>${cellContent}</td>`;
}

/**
 * Generates the name cell
 * @param {Game} game
 */
function generateNameCell(game) {
	let nameContent;

	if (game.searchMatchDetails) {
		if (game.searchMatchDetails.field === 'title') {
			nameContent = highlightMatchedText(
				game.title,
				game.searchMatchDetails.index,
				game.searchMatchDetails.length,
			);
		} else if (game.searchMatchDetails.field === 'name') {
			nameContent = `${game.title}<br><span class='name-match-tag'>${highlightMatchedText(
				game.name,
				game.searchMatchDetails.index,
				game.searchMatchDetails.length,
			)}</span>`;
		} else {
			nameContent = game.title;
		}
	} else {
		nameContent = game.title;
	}

	return `
	<td
		class='overflow-protect ${ifEmpty(game.name, 'bg-cell-danger')}'
		style='max-width: 300px'
		title='${game.name}'
	>
		${nameContent}
	</td>`;
}

/**
 * Generates the region cell
 * @param {Game} game
 */
function generateRegionCell(game) {
	return `
	<td
		class='overflow-protect ${ifEmpty(game.region, 'bg-cell-danger')}'
		style='white-space: nowrap'
	>
		${generateRegionFlagHtml(game)}
	</td>`;
}

/**
 * Generates the languages cell
 * @param {Game} game
 */
function generateLanguagesCell(game) {
	let flagsHtml = '';
	const languageAssets = getFlagSrc(game);
	languageAssets.forEach((assetUrl) => {
		flagsHtml += buildFlagElement(assetUrl.code, assetUrl.name, assetUrl.url);
	});

	return `
	<td
		class='overflow-protect ${ifEmpty(game.language, 'bg-cell-danger')}'
		style='max-width: 150px'
	>
		${flagsHtml}
	</td>`;
}

/**
 * Generates a cell for developer or publisher
 * @param {Game} game
 * @param {string} fieldName
 */
function generateAttributeCell(game, fieldName) {
	let content = '';
	let fieldValue = game[fieldName];
	if (Array.isArray(fieldValue)) {
		fieldValue = fieldValue.join(' / ');
	}
	if (fieldValue) {
		content = generateSearchableList(
			fieldValue,
			fieldName,
			game.searchMatchDetails,
		);
	}
	return `
	<td
		class='overflow-protect ${ifEmpty(fieldValue, 'bg-cell-danger')}'
		style='max-width: 150px'
	>
		${content}
	</td>`;
}

/**
 * Generate list with search highlighting
 * @param {string} fieldValue
 * @param {string} fieldName
 * @param {Object} searchMatchDetails
 */
function generateSearchableList(fieldValue, fieldName, searchMatchDetails) {
	const items = fieldValue.split(' / ').map(item => item.trim());
	let html = '';

	if (searchMatchDetails && searchMatchDetails.field === fieldName) {
		const searchTerm = searchInputElement.value.toLowerCase();
		items.forEach((item, index) => {
			const itemLower = item.toLowerCase();
			if (itemLower.includes(searchTerm)) {
				const matchIndex = itemLower.indexOf(searchTerm);
				html += `${highlightMatchedText(
					item,
					matchIndex,
					searchTerm.length,
				)}${index < items.length - 1 ? '<br>' : ''}`;
			} else {
				html += `${escapeUnknownStr(item)}${index < items.length - 1 ? '<br>' : ''}`;
			}
		});
	} else {
		items.forEach((item, index) => {
			html += `${escapeUnknownStr(item)}${index < items.length - 1 ? '<br>' : ''}`;
		});
	}

	return html;
}

/**
 * Generates the action buttons cell
 * @param {Game} game
 */
function generateActionCell(game) {
	return `
	<td>
		<button class='btn-danger' onclick='showDeleteDialog("${game.id}")'>Delete</button>
	</td>`;
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
				switch (regCode) {
					case 'X':
						html += buildFlagElement('UN', 'Region Free', '', false);
						html += buildFlagElement('EU', game.region);
						break;
					case 'D':
						html += buildFlagElement('DE', game.region);
						break;
					case 'F':
						html += buildFlagElement('FR', game.region);
						break;
					case 'I':
						html += buildFlagElement('IT', game.region);
						break;
					case 'S':
						html += buildFlagElement('ES', game.region);
						break;
					default:
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

/**
 * Render pagination controls
 * @param {number} totalPages
 * @param {number} currentPage
 */
function renderPagination(totalPages, currentPage) {
	const scrollingEnabled = document.body.scrollHeight > window.innerHeight + 20;

	let html = '<div class="pagination-controls">';

	if (totalPages > 1) {
		html += `<button onclick='renderTable(${currentPage - 1})' ${currentPage <= 1 ? 'disabled' : ''}>&lt; Prev</button>`;
		html += `<button onclick='renderTable(${currentPage + 1})' ${currentPage >= totalPages ? 'disabled' : ''}>Next &gt;</button>`;

		const startPage = Math.max(1, currentPage - 5);
		const endPage = Math.min(totalPages, startPage + 9);

		for (let page = startPage; page <= endPage; page++) {
			const className = page === currentPage ? 'current' : '';
			html += `<button class='${className}' onclick='renderTable(${page})'>${page}</button>`;
		}

		html += `<span class='pagination-info'>Page ${currentPage} of ${totalPages}</span>`;
	}

	if (scrollingEnabled) {
		html += `<button class='jumper' onclick="jumpToPosition('bottom')">Jump to Bottom &darr;</button>`;
	}

	html += '</div>';

	paginationTopElement.innerHTML = html;

	let bottomHtml = html;
	if (scrollingEnabled) {
		bottomHtml = bottomHtml.replace('Jump to Bottom &darr;', 'Jump to Top &uarr;');
		bottomHtml = bottomHtml.replace('onclick="jumpToPosition(\'bottom\')"', 'onclick="jumpToPosition(\'top\')"');
	}

	paginationBottomElement.innerHTML = bottomHtml;
}

/**
 * Show a native confirmation dialog for deleting a game
 * @param {string} gameId
 */
export function showDeleteDialog(gameId) {
	const db = getDb();
	const game = db.find(g => g.id === gameId);
	if (!game) {
		showMessage(`Game with ID ${gameId} not found.`, 'error');
		return;
	}

	const existingDialog = document.getElementById(`dia-del-${gameId}`);
	if (existingDialog) {
		document.body.removeChild(existingDialog);
	}

	const dialog = document.createElement('dialog');
	dialog.id = `dia-del-${gameId}`;
	dialog.innerHTML = `
	<div class='dialog-container'>
		<img
			src='index.php?action=get_asset&type=cover&id=${encodeURIComponent(gameId)}'
			alt=''
			onerror="this.onerror=null; this.src='/assets/images/missing_cover.png';"
		/>
		<div class='dialog-body'>
			<h3>Do you want to <span style='color: var(--danger-color)'>delete</span> this game?</h3>
			<table>
				<tbody>
					<tr>
						<td>Game ID:</td>
						<td>${gameId}</td>
					</tr>
					<tr>
						<td>Game Name:</td>
						<td>${game.name}</td>
					</tr>
					<tr>
						<td>System Type:</td>
						<td>${game.type}</td>
					</tr>
				</tbody>
			</table>
			<div class='button-tray'>
				<button id='closeDeleteDialog-${gameId}'>Close</button>
				<button class='btn-danger' id='confirmDeleteBtn-${gameId}'>DELETE</button>
			</div>
		</div>
	</div>`;

	document.body.appendChild(dialog);

	const closeButton = document.getElementById(`closeDeleteDialog-${gameId}`);
	if (closeButton) {
		closeButton.addEventListener('click', () => {
			dialog.close();
			document.body.removeChild(dialog);
		});
	}

	const confirmButton = document.getElementById(`confirmDeleteBtn-${gameId}`);
	if (confirmButton) {
		confirmButton.addEventListener('click', () => {
			deleteGame(game);
			dialog.close();
			document.body.removeChild(dialog);
		});
	}

	dialog.showModal();
}
