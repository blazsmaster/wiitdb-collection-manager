/**
 * Check if a value is empty and return a default value if it is
 * @param {string} value
 * @param {string} defaultValue
 */
export function ifEmpty(value, defaultValue) {
	return value.trim() === '' ? defaultValue : value;
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

/**
 * Check if a value is empty or unknown
 * @param {string|Array} value - The value to check
 */
export const isEmptyOrUnknown = (value) => {
	if (Array.isArray(value)) {
		return value.length === 0 || value.every((val) => !val || val.trim().toLowerCase() === 'unknown');
	}
	return !value || value.trim().toLowerCase() === 'unknown';
};
