/**
 * Eye 浏览器扩展 - 新标签页逻辑
 * 优化后的代码结构：
 * - 模块化组织
 * - 更好的错误处理
 * - 性能优化
 * - 代码可读性提升
 */

class EyeExtension {
  constructor() {
    this.shortcuts = [];
    this.modal = null;
    this.modalBody = null;
  }

  /**
   * 初始化应用
   */
  init() {
    this.setupDOMReferences();
    this.setupEventListeners();
    this.searchInit();
    this.shortcutInit();
  }

  /**
   * 设置 DOM 引用
   */
  setupDOMReferences() {
    this.modal = document.getElementById("shortcut-item-expand-list");
    this.modalBody = document.querySelector(".shortcut-item-list");
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 点击模态框外部关闭
    window.addEventListener("click", (event) => {
      if (event.target === this.modal) {
        this.closeModal();
      }
    });
  }

  /**
   * 搜索功能初始化
   */
  searchInit() {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    const searchEngine = document.getElementById("searchEngine");

    // 搜索按钮点击事件
    searchBtn.addEventListener("click", () => this.handleSearch(searchInput, searchEngine));

    // 回车键搜索
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.handleSearch(searchInput, searchEngine);
      }
    });

    // 搜索引擎选择保存
    searchEngine.addEventListener("change", () => {
      chrome.storage.sync.set({ searchEngine: searchEngine.value });
    });

    // 恢复用户的搜索引擎偏好
    chrome.storage.sync.get("searchEngine", (data) => {
      if (data.searchEngine) {
        searchEngine.value = data.searchEngine;
      }
    });
  }

  /**
   * 处理搜索请求
   */
  handleSearch(searchInput, searchEngine) {
    const query = searchInput.value.trim();
    const engine = searchEngine.value;

    if (query) {
      const searchUrl = engine + encodeURIComponent(query);
      window.open(searchUrl, "_blank");
    }
  }

  /**
   * 快捷链接初始化
   */
  async shortcutInit() {
    try {
      this.shortcuts = await this.loadShortcuts();
      this.renderShortcuts();
    } catch (error) {
      console.error("加载快捷图标错误：", error);
      this.showError("加载快捷链接失败，请检查网络或文件配置");
    }
  }

  /**
   * 加载快捷链接配置
   */
  async loadShortcuts() {
    const response = await fetch("shortcuts.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * 渲染快捷链接
   */
  renderShortcuts() {
    const shortcutContainer = document.getElementById("shortcut-container");
    shortcutContainer.innerHTML = ""; // 清空容器

    this.shortcuts.forEach((item) => {
      if (item.hide) {
        return;
      }

      const shortcutElement = item.type === "dir"
        ? this.createShortcutItemDir(item)
        : this.createShortcutItem(item);

      shortcutContainer.appendChild(shortcutElement);
    });
  }

  /**
   * 创建单链接快捷方式
   */
  createShortcutItem(shortcut) {
    const div = document.createElement("div");
    div.className = "shortcut-item";

    // 图标
    const img = document.createElement("img");
    img.className = "shortcut-img";
    img.src = shortcut.icon;
    img.alt = shortcut.alt || shortcut.desc;
    img.onerror = () => this.handleImageError(img);

    // 链接
    const a = document.createElement("a");
    a.href = shortcut.url;
    a.target = "_blank";
    a.appendChild(img);

    // 图标容器
    const imgContainer = document.createElement("div");
    imgContainer.className = "shortcut-img-container";
    imgContainer.appendChild(a);

    // 描述容器
    const descContainer = document.createElement("div");
    descContainer.className = "shortcut-desc-container";
    descContainer.textContent = shortcut.desc;

    div.appendChild(imgContainer);
    div.appendChild(descContainer);

    return div;
  }

  /**
   * 创建文件夹快捷方式
   */
  createShortcutItemDir(shortcut) {
    const dirContainer = document.createElement("div");
    dirContainer.className = "shortcut-item-dir";

    // 图片列表容器
    const imgsContainer = document.createElement("div");
    imgsContainer.className = "shortcut-imgs-container";

    // 只显示前4个图标
    shortcut.shortcuts.slice(0, 4).forEach((item) => {
      const img = document.createElement("img");
      img.src = item.icon;
      img.alt = item.alt || item.desc;
      img.onerror = () => this.handleImageError(img);

      const imgContainer = document.createElement("div");
      imgContainer.className = "shortcut-sub-item";
      imgContainer.appendChild(img);

      imgsContainer.appendChild(imgContainer);
    });

    // 描述容器
    const descContainer = document.createElement("div");
    descContainer.className = "shortcut-desc-container";
    descContainer.textContent = shortcut.name;

    dirContainer.appendChild(imgsContainer);
    dirContainer.appendChild(descContainer);

    // 点击展开事件
    dirContainer.addEventListener("click", () => this.expandFolder(shortcut));

    return dirContainer;
  }

  /**
   * 展开文件夹显示所有链接
   */
  expandFolder(shortcut) {
    this.modalBody.innerHTML = ""; // 清空模态框内容

    shortcut.shortcuts.forEach((item) => {
      if (item.hide) {
        return;
      }
      this.modalBody.appendChild(this.createShortcutItem(item));
    });

    this.modal.style.display = "block";
  }

  /**
   * 关闭模态框
   */
  closeModal() {
    this.modal.style.display = "none";
  }

  /**
   * 处理图片加载错误
   */
  handleImageError(img) {
    console.warn(`图片加载失败: ${img.src}`);
    img.src = "img/ico/default/icon_v4.png"; // 默认图标
    img.alt = "默认图标";
  }

  /**
   * 显示错误信息
   */
  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 1000;
      max-width: 300px;
    `;

    document.body.appendChild(errorDiv);

    // 3秒后自动移除
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 3000);
  }
}

// 应用初始化
document.addEventListener("DOMContentLoaded", () => {
  const app = new EyeExtension();
  app.init();
});
