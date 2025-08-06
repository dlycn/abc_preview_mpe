const vscode = require('vscode');

function activate() {
  return {
    extendMarkdownIt(md) {
      const defaultRender = md.renderer.rules.fence;
      
      md.renderer.rules.fence = function(tokens, idx, options, env, self) {
        const token = tokens[idx];
        
        // 检查是否为非 abc 代码块
        if (token.info.trim() !== 'abc') {
          // 关键修复：使用正确上下文和参数调用默认渲染
          return defaultRender.call(this, tokens, idx, options, env, self);
        }
        
        return `
          <div class="abc-container">
            <div class="abc-preview" data-abc="${escape(token.content)}">
              <div class="abc-loading">加载中...</div>
            </div>
          </div>
        `;
      };
      
      return md;
    }
  };
}

function escape(html) {
  return html.replace(/[&<>"']/g, 
    ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[ch])
  );
}

module.exports = { activate };