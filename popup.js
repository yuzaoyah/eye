/**
 * Eye 浏览器扩展 - 弹出窗口逻辑
 * 优化后的代码结构：
 * - 更好的用户体验
 * - 错误处理
 * - 表单验证
 * - 加载状态
 */

document.addEventListener("DOMContentLoaded", function () {
  const saveBtn = document.getElementById("saveBtn");
  const newTabContentInput = document.getElementById("newTabContent");

  // 加载已保存的内容
  loadSavedContent();

  // 保存按钮点击事件
  saveBtn.addEventListener("click", handleSave);

  // 回车键保存
  newTabContentInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleSave();
    }
  });

  /**
   * 加载已保存的内容
   */
  function loadSavedContent() {
    chrome.storage.sync.get("newTabContent", (data) => {
      if (data.newTabContent) {
        newTabContentInput.value = data.newTabContent;
      }
    });
  }

  /**
   * 处理保存操作
   */
  function handleSave() {
    const newTabContent = newTabContentInput.value.trim();

    // 表单验证
    if (!newTabContent) {
      showMessage("请输入内容", "error");
      return;
    }

    // 显示加载状态
    saveBtn.disabled = true;
    saveBtn.textContent = "保存中...";

    // 保存到 Chrome Storage
    chrome.storage.sync.set({ newTabContent: newTabContent }, () => {
      // 检查是否有错误
      if (chrome.runtime.lastError) {
        showMessage("保存失败：" + chrome.runtime.lastError.message, "error");
      } else {
        showMessage("保存成功！", "success");
        // 1秒后自动关闭 popup
        setTimeout(() => {
          window.close();
        }, 1000);
      }

      // 恢复按钮状态
      saveBtn.disabled = false;
      saveBtn.textContent = "保存";
    });
  }

  /**
   * 显示消息提示
   */
  function showMessage(text, type = "info") {
    // 移除已存在的消息
    const existingMessage = document.querySelector(".message");
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = text;

    // 样式
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 10px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      max-width: 250px;
      text-align: center;
      background: ${type === "error" ? "#dc3545" : "#28a745"};
    `;

    document.body.appendChild(messageDiv);

    // 3秒后自动移除
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 3000);
  }
});
