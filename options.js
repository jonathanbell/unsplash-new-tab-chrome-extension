// Saves options to chrome.storage
const saveOptions = () => {
	const username = document.getElementById('username').value;
	const selectedContent = document.getElementById('selectedContent').value;

	chrome.storage.sync.set(
		{ selectedContent: selectedContent, username: username },
		() => {
			const status = document.getElementById('status');
			status.textContent = 'Options saved 👍';
			setTimeout(() => {
				status.textContent = '';
			}, 888);
		}
	);
};

// Restores input element values using the preferences stored in
// `chrome.storage`.
const restoreOptions = () => {
	chrome.storage.sync.get(
		{ selectedContent: 'myLikes', username: '' },
		(items) => {
			document.getElementById('selectedContent').value = items.selectedContent;
			document.getElementById('username').value = items.username;
		}
	);
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
