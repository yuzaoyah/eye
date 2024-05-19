document.addEventListener("DOMContentLoaded", function () {
  var searchBtn = document.getElementById("searchBtn");
  var searchInput = document.getElementById("searchInput");
  var searchEngine = document.getElementById("searchEngine");
  var shortcutIconsContainer = document.getElementById("shortcutIcons");

  // Load shortcuts from JSON file
  fetch("shortcuts.json")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((shortcut) => {
        var div = document.createElement("div"); // 创建一个 div 元素用于包含图标和描述
        var a = document.createElement("a");
        var img = document.createElement("img");
        var p = document.createElement("p"); // 创建一个 p 元素用于文字描述
        var flexContainer = document.createElement("div"); // 创建一个用于包含图标和文字的 Flex 容器
        a.href = shortcut.url;
        a.target = "_blank";
        img.src = shortcut.icon;
        img.alt = shortcut.alt;
        a.appendChild(img);
        p.textContent = shortcut.desc; // 设置 p 元素的文字描述
        p.style.textAlign = "center"; // 设置文字居中
        p.style.wordWrap = "break-word"; // 设置自动换行
        flexContainer.style.display = "flex"; // 设置 Flexbox 布局
        flexContainer.style.flexDirection = "column"; // 垂直方向布局
        flexContainer.style.alignItems = "center"; // 居中对齐
        flexContainer.style.width = "66px"; // 设置 Flex 容器宽度为100%
        flexContainer.appendChild(a); // 将图标链接添加到 Flex 容器中
        flexContainer.appendChild(p); // 将 p 元素添加到 Flex 容器中
        div.appendChild(flexContainer); // 将 Flex 容器添加到 div 中
        shortcutIconsContainer.appendChild(div); // 将包含图标和描述的 div 添加到容器中
      });
    })
    .catch((error) => console.error("Error loading shortcuts:", error));

  searchBtn.addEventListener("click", function () {
    var query = searchInput.value;
    var engine = searchEngine.value;
    if (query.trim() !== "") {
      var searchUrl = engine + encodeURIComponent(query);
      window.open(searchUrl, "_blank");
    }
  });
  
  // 为搜索输入框添加键盘事件，按回车时进行搜索
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === 'Enter') {
        searchBtn.click();
    }
  });

  // Save selected search engine to storage when changed
  searchEngine.addEventListener("change", function () {
    var selectedEngine = searchEngine.value;
    chrome.storage.sync.set({ searchEngine: selectedEngine });
  });

  // Retrieve search engine preference from storage and set it as default
  chrome.storage.sync.get("searchEngine", function (data) {
    if (data.searchEngine) {
      searchEngine.value = data.searchEngine;
    }
  });
});