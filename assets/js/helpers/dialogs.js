export function setupDialogEventListeners() {
	document.querySelectorAll('button[data-dialog-open]').forEach((btn) => {
		btn.addEventListener('click', function () {
			const dialogId = btn.getAttribute('data-dialog-open');
			const dialog = document.getElementById(dialogId);
			if (dialog) {
				dialog.showModal();
			}
		});
	});
	document.querySelectorAll('dialog').forEach((dialog) => {
		const closeBtn = dialog.querySelector('button[id$="Close"]');
		if (closeBtn) {
			closeBtn.addEventListener('click', handleDialogClose);
		}
		// Tab switching
		dialog.querySelectorAll('.btn[data-tab]').forEach((tabBtn) => {
			tabBtn.addEventListener('click', handleTabSwitch);
		});
	});
}

function handleTabSwitch(event) {
	const tabBtn = event.currentTarget;
	const dialog = tabBtn.closest('dialog');
	const targetTab = tabBtn.getAttribute('data-tab');
	dialog.querySelectorAll('.tab-content').forEach((content) => {
		content.classList.remove('active');
	});
	dialog.querySelectorAll('.btn[data-tab]').forEach((btn) => {
		btn.classList.remove('active');
	});
	dialog.querySelector(`#${targetTab}-content`).classList.add('active');
	tabBtn.classList.add('active');
}

function handleDialogClose(event) {
	event.currentTarget.closest('dialog').close();
}
