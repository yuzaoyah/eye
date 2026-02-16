document.addEventListener("DOMContentLoaded", function () {
  searchInit()
  shortcutInit()


});
// 点击模态框外部也关闭模态框
window.onclick = function (event) {
  modal = document.getElementById("shortcut-item-expand-list")
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// 初始化搜索框
function searchInit() {
  var searchBtn = document.getElementById("searchBtn");
  var searchInput = document.getElementById("searchInput");
  var searchEngine = document.getElementById("searchEngine");
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
    if (event.key === "Enter") {
      searchBtn.click();
    }
  });

  // 切换搜索引擎时保存该选择
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
}



function shortcutInit() {
  var shortcutContainer = document.getElementById("shortcut-container");

  // 从JSON文件中加载快捷图标
  fetch("shortcuts.json")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((item) => {
        if (item.hide) {
          return;
        }

        if (item.type != "dir") {
          div = createShortcutItem(item);
        } else {
          div = createShortcutItemDir(item)
        }
        shortcutContainer.appendChild(div);
      });
    })
    .catch((error) => console.error("加载快捷图标错误：", error));
}


function createShortcutItem(shortcut) {
  // 图标
  var img = document.createElement("img");
  img.className = "shortcut-img"
  img.src = shortcut.icon;
  img.alt = shortcut.alt;

  // 链接
  var a = document.createElement("a");
  a.href = shortcut.url;
  a.target = "_blank";
  a.appendChild(img);

  // 图标容器
  var imgContainer = document.createElement("div");
  imgContainer.className = "shortcut-img-container"
  imgContainer.appendChild(a)

  // 描述容器
  var descContainer = document.createElement("div");
  descContainer.className = "shortcut-desc-container"
  descContainer.textContent = shortcut.desc

  // 快捷图标容器
  var div = document.createElement("div");
  div.className = "shortcut-item"
  div.appendChild(imgContainer)
  div.appendChild(descContainer)

  return div
}


function createShortcutItemDir(shortcut) {
  // 图片列表容器
  var imgsContainer = document.createElement("div");
  imgsContainer.className = "shortcut-imgs-container"

  shortcut.shortcuts.slice(0, 4).forEach((item) => {
    // 图标
    var img = document.createElement("img");
    img.src = item.icon;
    img.alt = item.alt;
    // 图标容器
    var imgContainer = document.createElement("div");
    imgContainer.className = "shortcut-sub-item"
    imgContainer.appendChild(img)
    imgsContainer.appendChild(imgContainer)
  })

  // 描述容器
  var descContainer = document.createElement("div");
  descContainer.className = "shortcut-desc-container"
  descContainer.textContent = shortcut.name

  // 图标文件夹容器
  var dirContainer = document.createElement("div");
  dirContainer.className = "shortcut-item-dir"
  dirContainer.append(imgsContainer)
  dirContainer.append(descContainer)

  // 展开动作

  dirContainer.addEventListener("click", function () {
    var modalBody = document.querySelector(".shortcut-item-list");
    modalBody.innerHTML = ''; // 清空模态框内容
    // 动态添加 shortcut-item 到模态框
    shortcut.shortcuts.forEach((item) => {
      if (item.hide) {
        return
      }
      modalBody.appendChild(createShortcutItem(item))
    })
    modal = document.getElementById("shortcut-item-expand-list")
    modal.style.display = "block"
  });


  return dirContainer
}