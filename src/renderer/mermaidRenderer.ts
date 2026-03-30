import fs from 'fs/promises';
import path from 'path';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Membuat file HTML yang merender diagram Mermaid secara client-side di browser.
 * Tidak memerlukan Chrome/Puppeteer — diagram dirender oleh browser pengguna via CDN.
 */
export async function createMermaidHtmlPage(
  mermaidCode: string,
  id: string,
  outputPath: string
): Promise<void> {
  const escapedCode = escapeHtml(mermaidCode);

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diagram - ${id}</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
      font-family: system-ui, sans-serif;
      padding: 24px;
      gap: 16px;
    }
    .diagram-container {
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      width: 95vw;
      max-width: 1400px;
      overflow: auto;
    }
    .diagram-container svg {
      width: 100% !important;
      height: auto !important;
      min-height: 400px;
    }
    .diagram-id {
      font-size: 11px;
      color: #aaa;
      letter-spacing: 0.5px;
    }
    .error-box {
      background: #fff0f0;
      border: 1px solid #f00;
      padding: 16px;
      border-radius: 8px;
      color: #c00;
      display: none;
    }
    .actions {
      display: flex;
      gap: 12px;
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.85; }
    .btn-pdf  { background: #e53935; color: white; }
    .btn-png  { background: #1976d2; color: white; }
    @media print {
      body { background: white; padding: 0; }
      .actions, .diagram-id, .error-box { display: none !important; }
      .diagram-container {
        box-shadow: none;
        border-radius: 0;
        width: 100%;
        max-width: 100%;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="diagram-container">
    <pre class="mermaid">${escapedCode}</pre>
  </div>
  <div class="error-box" id="error-box"></div>
  <div class="actions">
    <button class="btn btn-pdf" onclick="savePDF()">Save as PDF</button>
    <button class="btn btn-png" onclick="savePNG()">Download PNG</button>
  </div>
  <span class="diagram-id">ID: ${id}</span>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: { useMaxWidth: true },
      sequence: { useMaxWidth: true },
    });
    mermaid.init(undefined, '.mermaid').catch(function(err) {
      var box = document.getElementById('error-box');
      box.textContent = 'Gagal merender diagram: ' + err.message;
      box.style.display = 'block';
    });

    function savePDF() {
      window.print();
    }

    function savePNG() {
      var svg = document.querySelector('.mermaid svg');
      if (!svg) { alert('Diagram belum siap, coba beberapa saat lagi.'); return; }

      var svgData = new XMLSerializer().serializeToString(svg);
      var canvas = document.createElement('canvas');
      var scale = 2; // retina quality
      var bbox = svg.getBoundingClientRect();
      canvas.width  = bbox.width  * scale;
      canvas.height = bbox.height * scale;

      var ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, bbox.width, bbox.height);

      var img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0, bbox.width, bbox.height);
        var a = document.createElement('a');
        a.download = 'diagram-${id}.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  </script>
</body>
</html>`;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, 'utf-8');
}
