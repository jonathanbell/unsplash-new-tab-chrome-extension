chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    const internalUrl = chrome.runtime.getURL("onboarding.html");
    chrome.tabs.create({
      url: internalUrl,
    });
  }
});
