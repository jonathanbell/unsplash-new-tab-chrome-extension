import { pruneDatabase, placeImageOnNewTab, addImageToStore } from "./app.js";
import {
  NUMBER_OF_PHOTOS_TO_FETCH,
  IMAGE_RESOLUTION,
  DEFAULT_UNSPASH_URL,
} from "./constants.js";

document.addEventListener("DOMContentLoaded", () => {
  let unsplashUrl = DEFAULT_UNSPASH_URL;

  chrome.storage.sync.get(
    { useRandomPhotos: true, selectedContent: "myLikes", username: "" },
    (items) => {
      const isExtensionConfigured =
        !items.useRandomPhotos && items.username !== "" ? true : false;

      if (isExtensionConfigured) {
        unsplashUrl = `https://source.unsplash.com/user/${items.username}${
          items.selectedContent === "myLikes" ? "/likes" : ""
        }/${IMAGE_RESOLUTION}`;
      }

      // Place a new image on the new tab page. If there is a cached image, use it.
      placeImageOnNewTab();

      // Use the proper Unsplash URL to download images and add them to our
      // store.
      for (let i = 0; i < NUMBER_OF_PHOTOS_TO_FETCH; i++) {
        addImageToStore(unsplashUrl);
      }

      // Tidy up the database by removing the old images. We keep the default
      // number of items. Remeber that this extension shows random images so
      // there is a chance that the same image will be re-shown and/or
      // re-downloaded from Unsplash.
      pruneDatabase();
    }
  );
});
