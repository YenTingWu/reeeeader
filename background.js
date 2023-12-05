// when the icon was clicked, send a message to the content script
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(
    tab.id,
    {
      type: "ICON_CLICKED",
    },
    (data) => {
      if (data?.message === "opened") {
        console.log(data?.message);
        chrome.action.setIcon({ path: "assets/icons/icon-colored-16.png" });
      } else {
        console.log(data?.message);
        chrome.action.setIcon({ path: "assets/icons/icon-16.png" });
      }
    }
  );
});
