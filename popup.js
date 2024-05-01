document.addEventListener("DOMContentLoaded", function () {
  var saveBtn = document.getElementById("saveBtn");
  var newTabContentInput = document.getElementById("newTabContent");

  saveBtn.addEventListener("click", function () {
    var newTabContent = newTabContentInput.value;
    chrome.storage.sync.set({ newTabContent: newTabContent }, function () {
      console.log("New tab content saved:", newTabContent);
      alert("New tab content saved successfully!");
    });
  });
});
