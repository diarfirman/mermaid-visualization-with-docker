(function () {
  var css = `
    .drf-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }
    .drf-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: system-ui, sans-serif;
      transition: opacity 0.2s;
    }
    .drf-btn:hover { opacity: 0.85; }
    .drf-btn-pdf { background: #e53935; color: white; }
    .drf-btn-png { background: #1976d2; color: white; }
    @media print {
      .drf-actions { display: none !important; }
    }
  `;

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function savePDF() {
    window.print();
  }

  function savePNG() {
    var svg = document.querySelector('.mermaid svg');
    if (!svg) { alert('Diagram is not ready yet, please try again in a moment.'); return; }

    var id = document.title.replace('Diagram - ', '') || 'diagram';
    var svgData = new XMLSerializer().serializeToString(svg);
    var canvas = document.createElement('canvas');
    var scale = 2;
    var bbox = svg.getBoundingClientRect();
    canvas.width  = bbox.width  * scale;
    canvas.height = bbox.height * scale;

    var ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, bbox.width, bbox.height);

    var img = new Image();
    img.onload = function () {
      ctx.drawImage(img, 0, 0, bbox.width, bbox.height);
      var a = document.createElement('a');
      a.download = 'diagram-' + id + '.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }

  function injectButtons() {
    if (document.querySelector('.drf-actions')) return;
    var actions = document.createElement('div');
    actions.className = 'drf-actions';

    var btnPDF = document.createElement('button');
    btnPDF.className = 'drf-btn drf-btn-pdf';
    btnPDF.textContent = 'Save as PDF';
    btnPDF.onclick = savePDF;

    var btnPNG = document.createElement('button');
    btnPNG.className = 'drf-btn drf-btn-png';
    btnPNG.textContent = 'Download PNG';
    btnPNG.onclick = savePNG;

    actions.appendChild(btnPDF);
    actions.appendChild(btnPNG);
    document.body.appendChild(actions);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButtons);
  } else {
    injectButtons();
  }
})();
