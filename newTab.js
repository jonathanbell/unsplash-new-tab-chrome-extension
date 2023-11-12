const DB_NAME = 'unsplash-new-tab';
const DB_TABLE = 'images';
const DEFAULT_IMAGE = 'default.png';
const MAX_CACHED_IMAGES = 5;
// 2560x1920 is the minimum resolution allowed on Unsplash.
// 4096x2160 == 4k resolution
const IMAGE_RESOLUTION = `${screen.width}x${screen.height}`;

const imageDb = () => {
	const dbRequest = indexedDB.open(DB_NAME, 1);

	dbRequest.onupgradeneeded = (e) => {
		const db = e.target.result;
		if (!db.objectStoreNames.contains(DB_TABLE)) {
			db.createObjectStore(DB_TABLE, { autoIncrement: true });
		}
	};

	dbRequest.onerror = function (error) {
		console.error('IndexedDB error: ', error);
		console.dir(error);
	};

	return dbRequest;
};

const setBackgroundImage = (uri = null) => {
	if (uri === null) {
		uri = DEFAULT_IMAGE;
		// Show the default copy.
		document.getElementById('default-copy').style.display = 'block';
	}

	const ogImg = document.getElementById('background-image');
	if (ogImg !== null) {
		ogImg.style.opacity = '0';
		ogImg.remove();
	}
	const img = document.createElement('img');
	img.id = 'background-image';
	img.src = uri;
	img.onload = function () {
		this.style.opacity = '1';
	};
	document.body.appendChild(img);
}

const blobToBase64 = (blob) => {
	return new Promise((resolve, _) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.readAsDataURL(blob);
	});
}

const getImageFromUnsplash = async (url) => {
	try {
		const response = await fetch(url);
		const blob = await response.blob();
		const imgBase64 = await blobToBase64(blob);
		return imgBase64;
	} catch (error) {
		console.error('getImageFromUnsplash() error: ', error);
		// TODO: do we want to return a default image? Throw fatal error?
	}
};

const addImageToStore = async (url) => {
	const imgBase64 = await getImageFromUnsplash(url);

	const imageStore = imageDb();

	imageStore.onsuccess = (e) => {
		const db = e.target.result;
		const tx = db.transaction(DB_TABLE, 'readwrite');
		tx.objectStore(DB_TABLE).put({
			createdAt: new Date().getTime(),
			imageData: imgBase64
		});
	};
}

const pruneDatabase = (maxItems = MAX_CACHED_IMAGES) => {
	const imageStore = imageDb();

	imageStore.onsuccess = (e) => {
		try {
			const db = e.target.result;
			const tx = db.transaction(DB_TABLE, 'readwrite');
			const images = tx.objectStore(DB_TABLE);
			images.getAll().onsuccess = (e) => {
				const allImages = e.target.result;
				if (allImages.length > maxItems) {
					const imagesToDelete = allImages.slice(0, allImages.length - maxItems).map(image => image.createdAt);
					images.openCursor().onsuccess = function (event) {
						const cursor = event.target.result;
						if (cursor) {
							if (imagesToDelete.includes(cursor.value.createdAt)) {
								cursor.delete();
							}
							cursor.continue();
						}
					};
				}
			};
		} catch (error) {
			console.error(error);
			throw new Error('Unable to open IndexedDB');
		}
	};
};

const placeCachedImageOnBackground = () => {
	const imageStore = imageDb();

	imageStore.onsuccess = (e) => {
		try {
			const db = e.target.result;
			const tx = db.transaction(DB_TABLE, 'readwrite');
			const images = tx.objectStore(DB_TABLE);
			images.getAll().onsuccess = (e) => {
				if (e.target.result.length === 0) {
					console.warn('0 images available in unsplash new tab imageStore');
					setBackgroundImage(null);
				} else {
					const i = Math.floor(Math.random() * e.target.result.length);
					setBackgroundImage(e.target.result[i].imageData);
				}
			};
		} catch (error) {
			console.error(error);
			throw new Error('Unable to open IndexedDB');
		}
	};
}

placeCachedImageOnBackground();
pruneDatabase();

document.addEventListener('DOMContentLoaded', () => {
	chrome.storage.sync.get(
		{ selectedContent: 'myLikes', username: '' },
		(items) => {
			if (items.username !== '') {
				const url = `https://source.unsplash.com/user/${items.username}/likes/${IMAGE_RESOLUTION}`;
				for (let i = 0; i < MAX_CACHED_IMAGES; i++) {
					addImageToStore(url);
				}
			} else {
				pruneDatabase(0);
				// Extension is still not configured.
				document.getElementById('default-copy').style.display = 'block';
				// TODO: show default image??????? or just show nothing?
				// Prompt for the user to configure the extension.
			}
		}
	);
});
