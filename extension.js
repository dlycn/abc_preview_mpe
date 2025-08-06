const vscode = require('vscode');

function activate() {
  return {
    extendMarkdownIt(md) {
      const defaultRender = md.renderer.rules.fence;
      
      md.renderer.rules.fence = (tokens, idx) => {
        const token = tokens[idx];
        if (token.info.trim() !== 'abc') 
          return defaultRender(tokens, idx);
        
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