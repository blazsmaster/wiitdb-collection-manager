import { loadingElement, messageElement } from '../ui/domElements.js';
import { MESSAGE_TIMEOUT_MS } from '../globals.js';

// Track message timeout
let messageTimeout;

/**
 * Show a message element
 * @param {string} text  - The message text to display
 * @param {MessageType} type - The type of message
 */
export function showMessage(text, type) {
	if (messageTimeout) {
		clearTimeout(messageTimeout);
		messageTimeout = null;
	}

	if (text) {
		messageElement.textContent = text;
		messageElement.className = type ? `message ${type}` : 'message';
		messageElement.style.display = 'block';

		messageTimeout = setTimeout(() => {
			messageElement.style.display = 'none';
			messageTimeout = null;
		}, MESSAGE_TIMEOUT_MS);
	} else {
		messageElement.style.display = 'none';
	}
}

/**
 * Show or hide the loading element
 * @param {boolean} show - Whether to show or hide the loading element
 */
export function showLoading(show) {
	loadingElement.style.display = show ? 'block' : 'none';
}

// Hover effect for images
let hoverTimeout;

/**
 * Handle mouse over event for images
 * @param {string} src - The source URL of the image
 * @param {MouseEvent} event
 */
export function handleImgMouseOver(src, event) {
	clearTimeout(hoverTimeout);
	hoverTimeout = setTimeout(() => {
		const tooltip = document.getElementById('imgTooltip');
		tooltip.innerHTML = `<img src='${src}' alt='' class='img-tooltip-preview' />`;
		positionFixedTooltip(tooltip, event);
		tooltip.style.display = 'block';
	}, 300);
}

/**
 * Position the tooltip based on the mouse event
 * @param {HTMLElement} tooltip
 * @param {MouseEvent} event
 */
function positionFixedTooltip(tooltip, event) {
	const vw = window.innerWidth;
	const vh = window.innerHeight;

	tooltip.style.maxWidth = '250px';
	tooltip.style.maxHeight = '250px';
	tooltip.style.display = 'block';
	tooltip.style.left = '-9999px';
	tooltip.style.top = '-9999px';

	const tooltipWidth = Math.min(tooltip.offsetWidth, 250);
	const tooltipHeight = Math.min(tooltip.offsetHeight, 250);
	const padding = 20;

	let left = event.clientX + padding;
	if (left + tooltipWidth + padding > vw) {
		left = event.clientX - tooltipWidth - padding;
	}
	left = Math.max(padding, left);
	left = Math.min(left, vw - tooltipWidth - padding);

	let top = event.clientY + padding;
	if (top + tooltipHeight + padding > vh) {
		top = event.clientY - tooltipHeight - padding;
	}
	top = Math.max(padding, top);
	top = Math.min(top, vh - tooltipHeight - padding);

	tooltip.style.left = `${left}px`;
	tooltip.style.top = `${top}px`;
}

export function handleImgMouseOut() {
	clearTimeout(hoverTimeout);
	hideImgTooltip();
}

export function hideImgTooltip() {
	const tooltip = document.getElementById('imgTooltip');
	if (tooltip) {
		tooltip.style.display = 'none';
	}
}

export function attachImageEventListeners() {
	const images = document.querySelectorAll('.image-asset-inline');
	images.forEach(img => {
		img.addEventListener('mouseover', /*** @param {MouseEvent} event */ function (event) {
			const src = this.getAttribute('data-img-src');
			handleImgMouseOver(src, event);
		});

		img.addEventListener('mouseout', function () {
			handleImgMouseOut();
		});
	});
}

/**
 * @param {JumpPosition} position
 */
export function jumpToPosition(position) {
	if (position === 'top') {
		window.scrollTo({ top: 0, behavior: 'instant' });
	} else if (position === 'bottom') {
		window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
	}
}
