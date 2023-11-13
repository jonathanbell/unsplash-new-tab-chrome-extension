import {
  DB_NAME,
  DB_TABLE,
  MAX_CACHED_IMAGES,
  NUMBER_OF_PHOTOS_TO_FETCH,
  DEFAULT_UNSPASH_URL,
  BACKGROUND_IMAGE_ID,
  TEXT_ID,
} from "./constants.js";

/**
 * Get a reference to the IndexedDB database.
 * @returns {IDBRequest<IDBDatabase>}
 */
const _imageDb = () => {
  const dbRequest = indexedDB.open(DB_NAME, 1);

  dbRequest.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(DB_TABLE)) {
      db.createObjectStore(DB_TABLE, { autoIncrement: true });
    }
  };

  dbRequest.onerror = function (error) {
    console.error("IndexedDB error: ", error);
    console.dir(error);
  };

  return dbRequest;
};

/**
 * Use a URI to set the page background image. Can be a data URI or a URL.
 * @param {string} imageUri - The URI of the image to set as the page background
 * @returns {void}
 */
const _setBackgroundImage = (imageUri) => {
  const ogImg = document.getElementById(BACKGROUND_IMAGE_ID);
  if (ogImg !== null) {
    ogImg.style.opacity = "0";
    ogImg.remove();
  }
  const img = document.createElement("img");
  img.id = BACKGROUND_IMAGE_ID;
  img.src = imageUri;
  img.onload = function () {
    this.style.opacity = "1";
    document.getElementById(TEXT_ID).style.opacity = "0";
  };
  document.body.appendChild(img);
};

/**
 * Convert an image blob to a base64 string.
 * @param {string} blob - The blob to convert to a base64 string.
 * @returns {Promise<string>} - The base64 string.
 */
const _blobToBase64 = (blob) => {
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

/**
 * Checks if a string is a valid Unsplash image URL.
 * @param {string} string - The string to check.
 * @returns {boolean} - True if the string is a valid Unsplash URL, false otherwise.
 */
const _isValidUnspalshUrl = (string) => {
  if (!string.includes("source.unsplash.com")) {
    return false;
  }

  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Fetch an image from Unsplash and convert it to a base64 string.
 * @param {string} unsplashImageUrl - The URL of the image to fetch from Unsplash.
 * @returns {Promise<string>} - The base64 string of the Unsplash image.
 * @throws {Error} - If the image cannot be fetched from Unsplash.
 */
const _getImageBlobFromUnsplash = async (unsplashImageUrl) => {
  try {
    const response = await fetch(unsplashImageUrl);
    const blob = await response.blob();
    const imgBase64 = await _blobToBase64(blob);
    return imgBase64;
  } catch (error) {
    console.error(error);
    throw new Error("Unable to fetch image from Unsplash");
  }
};

/**
 * Add an image to the IndexedDB database.
 * @param {string} url - The URL of the Unsplash image to add to the IndexedDB database.
 * @returns {Promise<void>} - A promise that resolves when the image has been added to the database.
 * @throws {Error} - If the URL is not a valid Unsplash URL.
 */
export const addImageToStore = async (url) => {
  if (!_isValidUnspalshUrl(url)) {
    throw new Error("Invalid Unsplash URL");
  }

  // Fetch the image from Unsplash and convert it to a base64 string.
  const imgBase64 = await _getImageBlobFromUnsplash(url);

  // Get a reference to the IndexedDB database.
  const imageStore = _imageDb();

  // Add the image to the IndexedDB database.
  imageStore.onsuccess = (e) => {
    try {
      const db = e.target.result;
      const tx = db.transaction(DB_TABLE, "readwrite");
      tx.objectStore(DB_TABLE).put({
        createdAt: new Date().getTime(),
        imageData: imgBase64,
      });
    } catch (error) {
      console.error(error);
      throw new Error("Unable to open IndexedDB");
    }
  };
};

/**
 * Prune the IndexedDB database by removing the oldest images.
 * @param {number} maxItems - The maximum number of images to keep in the IndexedDB database.
 * @returns {void}
 * @throws {Error} - If the IndexedDB database cannot be opened.
 */
export const pruneDatabase = async (maxItems = MAX_CACHED_IMAGES) => {
  maxItems = maxItems - NUMBER_OF_PHOTOS_TO_FETCH;

  if (maxItems < 0) {
    return;
  }

  const imageStore = _imageDb();

  const storePromise = new Promise((resolve, reject) => {
    imageStore.onerror = () => reject(new Error("Unable to open IndexedDB"));

    imageStore.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(DB_TABLE, "readwrite");
      const images = tx.objectStore(DB_TABLE);

      images.getAll().onsuccess = (e) => {
        const allImages = e.target.result;

        if (allImages.length > maxItems) {
          const imagesToDelete = allImages
            .slice(0, allImages.length - maxItems)
            .map((image) => image.createdAt);

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

        resolve();
      };

      tx.onerror = () => reject(new Error("Error occurred during transaction"));
    };
  });

  try {
    await storePromise;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Get an image from the cache and set it as the page background. If no images
 * are cached, fetch a new image from Unsplash and use that.
 * @param {string} fallbackImgUrl - If no images are cached, use this URL to fetch an image from Unsplash.
 * @returns {void}
 * @throws {Error} - If the IndexedDB database cannot be opened/accesed.
 */
export const placeImageOnNewTab = (fallbackImgUrl = DEFAULT_UNSPASH_URL) => {
  const imageStore = _imageDb();

  imageStore.onsuccess = (e) => {
    try {
      const db = e.target.result;
      const tx = db.transaction(DB_TABLE, "readwrite");
      const images = tx.objectStore(DB_TABLE);
      images.getAll().onsuccess = async (e) => {
        if (e.target.result.length === 0) {
          document.getElementById(TEXT_ID).style.opacity = "1";
          const tmpImg = await _getImageBlobFromUnsplash(fallbackImgUrl);
          _setBackgroundImage(tmpImg);
        } else {
          const i = Math.floor(Math.random() * e.target.result.length);
          _setBackgroundImage(e.target.result[i].imageData);
        }
      };
    } catch (error) {
      console.error(error);
      throw new Error("Unable to open IndexedDB");
    }
  };
};
