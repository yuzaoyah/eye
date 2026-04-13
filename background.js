/**
 * Eye 浏览器扩展 - 后台服务 Worker
 * 优化后的代码结构：
 * - 更好的错误处理
 * - 性能优化
 * - 日志记录
 */

/**
 * 扩展安装时触发
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("Eye 扩展已安装", details);

  // 根据安装原因执行不同操作
  switch (details.reason) {
    case "install":
      // 首次安装
      console.log("Eye 扩展首次安装");
      await initializeStorage();
      break;
    case "update":
      // 扩展更新
      console.log("Eye 扩展已更新", details.previousVersion);
      await handleUpdate(details.previousVersion);
      break;
    case "chrome_update":
    case "shared_module_update":
      // Chrome 或共享模块更新
      console.log("浏览器或共享模块更新");
      break;
  }
});

/**
 * 浏览器启动时触发
 */
chrome.runtime.onStartup.addListener(() => {
  console.log("Eye 扩展启动");
});

/**
 * 新标签页创建时触发
 */
chrome.tabs.onCreated.addListener((tab) => {
  console.log("新标签页创建:", tab);
});

/**
 * 初始化存储
 */
async function initializeStorage() {
  try {
    const defaultSettings = {
      searchEngine: "https://www.google.com/search?q=",
      newTabContent: "",
    };

    // 检查是否已存在设置
    const result = await chrome.storage.sync.get(defaultSettings);

    // 只在首次安装时设置默认值
    if (!result.searchEngine || !result.newTabContent) {
      await chrome.storage.sync.set(defaultSettings);
      console.log("存储初始化完成");
    }
  } catch (error) {
    console.error("存储初始化失败:", error);
  }
}

/**
 * 处理扩展更新
 */
async function handleUpdate(previousVersion) {
  try {
    console.log("处理版本更新:", previousVersion);

    // 版本更新逻辑
    const [major, minor, patch] = previousVersion.split(".").map(Number);

    // 示例：如果是从 0.1 版本更新到 0.2 版本
    if (major === 0 && minor < 2) {
      // 更新存储结构
      const result = await chrome.storage.sync.get();
      if (!result.searchEngine) {
        await chrome.storage.sync.set({
          searchEngine: "https://www.google.com/search?q=",
        });
      }
    }

    console.log("版本更新处理完成");
  } catch (error) {
    console.error("版本更新处理失败:", error);
  }
}

/**
 * 监听消息
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("收到消息:", request);

  switch (request.action) {
    case "getVersion":
      sendResponse({ version: chrome.runtime.getManifest().version });
      break;
    case "clearCache":
      clearCache();
      sendResponse({ success: true });
      break;
    default:
      console.warn("未知消息类型:", request.action);
      sendResponse({ error: "未知消息类型" });
  }
});

/**
 * 清除缓存
 */
async function clearCache() {
  try {
    // 清除所有存储的设置
    await chrome.storage.sync.clear();
    await initializeStorage();
    console.log("缓存清除完成");
  } catch (error) {
    console.error("清除缓存失败:", error);
  }
}

/**
 * 监听存储变化
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log("存储变化:", changes, namespace);
});
