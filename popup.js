document.addEventListener("DOMContentLoaded", () => {
  const determineSelectedContent = (value) => {
    if (value === "myLikes") {
      return "liked photos";
    }
    if (value === "myPhotos") {
      return "photos";
    }
    return "";
  };

  chrome.storage.sync.get(
    { selectedContent: "myLikes", username: "" },
    (items) => {
      document.getElementById("selectedContentValue").innerText =
        determineSelectedContent(items.selectedContent);
      document.getElementById("usernameValue").innerText = items.username;

      if (items.username === "") {
        document.getElementById("notConfiguredWarning").style.display = "block";
      } else {
        document.getElementById("currentConfiguration").style.display = "block";
      }
    }
  );
});
