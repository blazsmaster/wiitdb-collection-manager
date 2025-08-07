/**
 * @type {Game[]}
 */
let db = [];

// Storage keys
const LS_GAME_DB_KEY = 'gameDB';

// UI
const messageElement = document.getElementById('message');
const loadingElement = document.getElementById('loading');
const statsElement = document.getElementById('stats');
const areaElement = document.getElementById('area');

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
	loadGamesFromLocalStorage();
}

function loadGamesFromLocalStorage() {
	const games = localStorage.getItem(LS_GAME_DB_KEY);

	if (games) {
		db = JSON.parse(games);
	} else {
		importXML();
	}

	updateStats();
	renderTable();
}

function importXML() {
	showLoading(true);
	showMessage('', '');

	fetch('index.php?action=import_xml')
		.then((response) => response.json())
		.then(/*** @param {ImportXmlResponse} data*/(data) => {
			if (data.success) {
				db = data.games;
				showMessage(`XML data imported successfully: ${data.message}`, 'success');
				localStorage.setItem(LS_GAME_DB_KEY, JSON.stringify(db));
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

function updateStats() {
	statsElement.innerHTML = `<b>Stats:</b> ${db.length} games`;
}

function renderTable() {
	if (db.length === 0) {
		areaElement.innerHTML = '<p><i>No games loaded. Please import XML data.</i></p>';
		return;
	}

	// Table generator start
	let html = `
	<table>
	  <thead>
	    <tr>
	      <th>ID</th>
        <th>Name</th>
        <th>Region</th>
        <th>Languages</th>
        <th>Developer</th>
        <th>Publisher</th>
	    </tr>
	  </thead>
	  <tbody>
	`;

	for (const game of db) {
		// Start row
		html += '<tr>';
		// ID
		html += `<td class='mono'>${game.id}</td>`;
		// Name
		html += `<td class='overflow-protect'>${game.name}</td>`;
		// Region
		html += `<td style='white-space: nowrap'>${game.region}</td>`;
		// Languages
		html += `<td class='overflow-protect'>${game.language}</td>`;
		// Developer
		html += `<td class='overflow-protect'>${game.developer}</td>`;
		// Publisher
		html += `<td class='overflow-protect'>${game.publisher}</td>`;
		// End row
		html += '</tr>';
	}

	// Fix table generator end
	html += `</tbody></table>`;

	console.log(html);

	areaElement.innerHTML = html;
}

// COMMON

/**
 * Show a message element
 * @param text {string} - The message text to display
 * @param type {'success' | 'error' | ''} - The type of message
 */
function showMessage(text, type) {
	if (text) {
		messageElement.textContent = text + type;
		messageElement.style.display = 'block';

		setTimeout(() => messageElement.style.display = 'none', 5000);
	} else {
		messageElement.style.display = 'none';
	}
}

/**
 * Show or hide the loading element
 * @param show {boolean} - Whether to show or hide the loading element
 */
function showLoading(show) {
	loadingElement.style.display = show ? 'block' : 'none';
}