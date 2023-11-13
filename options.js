import { pruneDatabase } from "./app.js";

// Save extension options to `chrome.storage`
const saveOptions = () => {
  const useRandomPhotos = document.getElementById("useRandomPhotos").checked;
  const username = document.getElementById("username").value;
  const selectedContent = document.getElementById("selectedContent").value;

  if (
    (document.getElementById("username").value === "" ||
      document.getElementById("username").value.includes("@")) &&
    document.getElementById("useRandomPhotos").checked === false
  ) {
    const status = document.getElementById("status");
    status.textContent = "Username should not contain @ or be blank ❌";
    return;
  }

  // Clear all of the photos out of the database since we're changing the
  // extension options and we want new photo content, not old photo content.
  // This will force the extension to re-fetch the photos from the API on the
  // next tab open.
  pruneDatabase(0);

  chrome.storage.sync.set(
    {
      useRandomPhotos: useRandomPhotos,
      selectedContent: selectedContent,
      username: username,
    },
    () => {
      const status = document.getElementById("status");
      status.textContent = "Options saved 👍";
      setTimeout(() => {
        status.textContent = "";
      }, 888);
    }
  );
};

const disableElements = (elementIds, disable) => {
  elementIds.forEach((elementId) => {
    document.getElementById(elementId).disabled = disable;
  });
};

const restoreOptions = () => {
  chrome.storage.sync.get(
    { useRandomPhotos: true, selectedContent: "myLikes", username: "" },
    (items) => {
      document.getElementById("useRandomPhotos").checked =
        items.useRandomPhotos;
      document.getElementById("selectedContent").value = items.selectedContent;
      document.getElementById("username").value = items.username;

      if (items.useRandomPhotos) {
        disableElements(["selectedContent", "username"], true);
      }
    }
  );
};

document.addEventListener("DOMContentLoaded", () => {
  restoreOptions();

  document
    .getElementById("useRandomPhotos")
    .addEventListener("click", (event) => {
      disableElements(["selectedContent", "username"], event.target.checked);
      document.getElementById("username").value = "";
    });

  document.getElementById("save").addEventListener("click", saveOptions);
});
