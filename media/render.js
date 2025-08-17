
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

  // 全局播放状态管理
  let currentPlayback = {
    synth: null,
    audioCtx: null,
    button: null,
    preview: null
  };
  
  // SVG图标定义
  const playSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>`;
  const stopSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 6h12v12H6z"/></svg>`;
  const loadingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>`;

  // 初始化函数
  function init() {
    // 使用等待策略确保 ABCJS 可用
    waitForABCJS()
      .then(() => {
        renderABCBlocks(opts);
        setupMutationObserver();
      });
  }

  // 等待 ABCJS 可用的函数
  function waitForABCJS(timeout = 3000, interval = 100) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      function check() {
        if (typeof ABCJS !== 'undefined' && ABCJS.synth && ABCJS.synth.CreateSynth) {
          resolve();
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error('ABCJS加载超时'));
        } else {
          setTimeout(check, interval);
        }
      }
      
      check();
    });
  }

  // 设置 DOM 变化观察器
  function setupMutationObserver() {
    const observer = new MutationObserver(() => {
      try {
        renderABCBlocks(opts);
      } catch (error) {
        console.error(`DOM观察器回调中发生错误: ${error.message}`);
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // 渲染 ABC 代码块
  function renderABCBlocks(opts) {
    document.querySelectorAll('.abc-preview:not(.rendered)').forEach(preview => {
      preview.classList.add('rendered');
      const abcCode = preview.dataset.abc;
      
      try {
        preview.innerHTML = '';
        const renderResult = ABCJS.renderAbc(preview, abcCode, opts);
        // 保存visualObj用于播放
        preview._visualObj = renderResult[0];
        
        // 添加播放按钮
        const playButton = document.createElement('div');
        playButton.className = 'abc-play-button';
        playButton.title = '播放乐谱';
        playButton.innerHTML = playSvg;
        playButton.addEventListener('click', () => handlePlayButtonClick(preview, playButton));
        
        // 添加导出按钮
        const exportButton = document.createElement('div');
        exportButton.className = 'abc-export-button';
        exportButton.title = '导出为SVG';
        exportButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect x="15" y="40" width="70" height="40" fill="none" stroke="currentColor" stroke-width="4" rx="5"/>
          <rect x="25" y="50" width="50" height="6" fill="currentColor"/>
          <rect x="25" y="60" width="50" height="6" fill="currentColor"/>
          <rect x="25" y="70" width="50" height="6" fill="currentColor"/>
          <rect x="40" y="15" width="20" height="25" fill="none" stroke="currentColor" stroke-width="4"/>
          <rect x="35" y="30" width="30" height="15" fill="currentColor" rx="2"/>
        </svg>`;
        
        exportButton.addEventListener('click', () => {
          exportSvg(preview);
        });
        
        preview.appendChild(playButton);
        preview.appendChild(exportButton);
      } catch (error) {
        console.error(`渲染ABC块时出错: ${error.message}`);
        preview.innerHTML = `<div class="abc-error">ABC渲染错误: ${error.message}</div>`;
      }
    });
  }

  // 处理播放按钮点击
  async function handlePlayButtonClick(preview, button) {
    // 如果点击的是当前正在播放的按钮
    if (currentPlayback.button === button && currentPlayback.synth) {
      await stopCurrentPlayback();
      return;
    }
    
    // 停止任何正在进行的播放
    await stopCurrentPlayback();
    
    // 设置加载状态
    button.innerHTML = loadingSvg;
    button.classList.add('loading');
    
    try {
      // 创建新的音频上下文
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const synth = new ABCJS.synth.CreateSynth();
      const visualObj = preview._visualObj;
      
      // 初始化合成器
      await synth.init({
        visualObj: visualObj,
        audioContext: audioCtx,
        millisecondsPerMeasure: visualObj.millisecondsPerMeasure?.(),
        options: {
          onEnded: () => {
            stopCurrentPlayback().catch(console.error);
          }
        }
      });
      
      await synth.prime();
      await synth.start();
      
      // 更新UI和状态
      button.innerHTML = stopSvg;
      button.classList.remove('loading');
      
      currentPlayback = {
        synth: synth,
        audioCtx: audioCtx,
        button: button,
        preview: preview
      };
    } catch (error) {
      console.error('播放失败:', error);
      button.innerHTML = playSvg;
      button.classList.remove('loading');
      await stopCurrentPlayback();
    }
  }

  // 停止当前播放
  async function stopCurrentPlayback() {
    if (currentPlayback.synth) {
      try {
        await currentPlayback.synth.stop();
      } catch (e) {
        console.warn('停止合成器时出错:', e);
      }
    }
    
    if (currentPlayback.audioCtx) {
      try {
        await currentPlayback.audioCtx.close();
      } catch (e) {
        console.warn('关闭音频上下文时出错:', e);
      }
    }
    
    if (currentPlayback.button) {
      currentPlayback.button.innerHTML = playSvg;
      currentPlayback.button.classList.remove('loading');
    }
    
    // 重置状态
    currentPlayback = {
      synth: null,
      audioCtx: null,
      button: null,
      preview: null
    };
  }

  function exportSvg(preview) {
      if (!preview) return;
      const svg = preview.querySelector('svg');
      if (!svg) return;
      try {
          const svgData = new XMLSerializer().serializeToString(svg);
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = 'score.svg';
          a.click();
          URL.revokeObjectURL(url);
      } catch (error) {
          console.error('SVG 导出失败:', error);
      }
  }

  // 启动渲染器 - 添加等待机制
  setTimeout(() => {
    if (typeof ABCJS !== 'undefined' && ABCJS.synth) {
      init();
    } else {
      // 先尝试等待一小段时间再检查
      setTimeout(() => {
        if (typeof ABCJS !== 'undefined' && ABCJS.synth) {
          init();
        } else {
          setTimeout(init, 500);
        }
      }, 200);
    }
  }, 100);
})();
