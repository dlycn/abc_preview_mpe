(function() {
  console.log("abc-preview render.js loaded");
  
  const basePath = document.currentScript?.src.substring(
    0, document.currentScript.src.lastIndexOf('/') + 1
  ) || './media/';
  
  const opts = { 
    responsive: "resize", 
    scale: 1.8,
    add_classes: true
  };

  function showGlobalError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'abc-global-error';
    errorDiv.innerHTML = `${message} <button>重试</button>`;
    document.body.appendChild(errorDiv);
    errorDiv.querySelector('button').onclick = () => {
      errorDiv.remove();
      loadABCJS();
    };
  }

  function loadABCJS() {
    if (document.querySelector('script[data-abcjs]')) return;
    const script = document.createElement('script');
    script.src = basePath + 'abcjs-basic.min.js';
    script.dataset.abcjs = true;
    script.onload = () => {
      console.log("abcjs-basic.min.js loaded");
      init();
    };
    script.onerror = () => showGlobalError("加载 abcjs 库失败");
    try {
      document.head.appendChild(script);
    } catch (error) {
      showGlobalError(`无法插入脚本标签: ${error.message}`);
    }
  }

  function init() {
    if (typeof ABCJS === 'undefined') return loadABCJS();
    
    renderABCBlocks(opts);
    // 监听DOM变化渲染新的ABC块
    const observer = new MutationObserver(() => {
      try {
        renderABCBlocks(opts);
      } catch (error) {
        showGlobalError(`DOM观察器回调中发生错误: ${error.message}`);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function renderABCBlocks(opts) {
    document.querySelectorAll('.abc-preview:not(.rendered)').forEach(preview => {
      preview.classList.add('rendered');
      const abcCode = preview.dataset.abc;
      
      try {
        preview.innerHTML = '';
        ABCJS.renderAbc(preview, abcCode, opts);
      } catch (error) {
        console.error(`渲染ABC块时出错: ${error.message}`);
        preview.innerHTML = `<div class="abc-error">${error.message}</div>`;
      }
    });
  }

  // 启动渲染器
  if (typeof ABCJS !== 'undefined') {
    init();
  } else {
    loadABCJS();
  }
})();
