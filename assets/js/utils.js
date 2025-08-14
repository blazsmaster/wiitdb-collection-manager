/**
 * Check if a value is empty and return a default value if it is
 * @param {string} value
 * @param {string} defaultValue
 */
export function ifEmpty(value, defaultValue) {
	return value.trim() === '' ? defaultValue : value;
}

/**
 * Parse a string of attributes separated by slashes and commas
 * @param {string} attrStr
 */
export function parseAttributeString(attrStr) {
	if (!attrStr) {
		return [];
	}
	const companySuffixes = [
		'Inc', 'Inc.',
		'LLC',
		'Ltd', 'Ltd.',
		'Limited',
		'Corp.', 'Corporation', 'Co.',
		'Co., Ltd.', 'Co. Ltd.', 'Co Ltd',
		'GmbH',
		'S.A.B.',
	];

	const isCompanySuffix = (str) => companySuffixes.some(suffix => str.trim().toLowerCase() === suffix.toLowerCase());

	const slashParts = attrStr.split('/').map(part => part.trim());
	let values = [];

	slashParts.forEach(part => {
		const commaParts = part.split(',').map(p => p.trim());
		let currentValue = '';
		commaParts.forEach(commaPart => {
			if (isCompanySuffix(commaPart) && currentValue) {
				currentValue += ', ' + commaPart;
			} else {
				if (currentValue) {
					values.push(currentValue);
				}
				currentValue = commaPart;
			}
		});
		if (currentValue) {
			values.push(currentValue);
		}
	});

	return values.filter(Boolean);
}

/**
 * Escape "unknown" string values
 * @param {string} value
 */
export function escapeUnknownStr(value) {
	return value.toLocaleLowerCase() === 'unknown' ? '' : value;
}

/**
 * Debounce function to limit how often a function can be called
 * @param func
 * @param delayMs
 */
export function debounce(func, delayMs) {
	let timeout;
	return function (...args) {
		const ctx = this;
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(ctx, args), delayMs);
	};
}

/**
 * Highlights the matched part of a text string
 * @param {string} text - Original text to process
 * @param {number} index - Starting index of the match
 * @param {number} length - Length of the matched part
 */
export function highlightMatchedText(text, index, length) {
	if (index < 0 || !text) {
		return text;
	}

	const before = text.substring(0, index);
	const match = text.substring(index, index + length);
	const after = text.substring(index + length);

	return `${before}<span class='search-match-highlight'>${match}</span>${after}`;
}
