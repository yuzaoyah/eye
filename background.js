chrome.runtime.onInstalled.addListener(function () {
  console.log("Extension Installed");
});

chrome.runtime.onStartup.addListener(function () {
  console.log("Extension Started");
});

chrome.tabs.onCreated.addListener(function (tab) {
  console.log("New tab created:", tab);
  // You can add your logic here to customize the new tab behavior
});
