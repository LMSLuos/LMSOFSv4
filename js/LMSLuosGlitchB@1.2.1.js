/**
 * LMSLuosGlitchB - 罗斯第二类故障引擎
 * @param {Element} element - 目标 DOM 元素
 * @param {number} [size=2] - 像素块大小（px）
 * @param {Object} [adjust] - 调整参数
 * @param {number} adjust.dd - 抖动强度 [0,1]，默认 0
 * @param {number} adjust.qs - 侵蚀强度 [0,3]，默认 0（算法未实现，此处保留占位）
 * @param {number} adjust.ld - 亮度 [-60,60]，默认 0
 * @param {number} adjust.dbd - 对比度 [-60,60]，默认 0
 * @param {number} adjust.bhd - 饱和度 [0,2]，默认 1
 * @param {Object} [fx] - 特效开关与间隔
 * @param {boolean} fx.gz - 故障（Glitch），默认 false
 * @param {boolean} fx.crt - CRT 扫描线，默认 false
 * @param {boolean} fx.sxh - 色循环（Palette Cycle），默认 false
 * @param {boolean} fx.cy - 残影（Ghost），默认 false
 * @param {boolean} fx.dd - 抖动淡入（Dither Fade），默认 false
 * @param {number} fx.time - 特效刷新间隔（ms），默认 50
 * @param {number} colorPanel - 调色板编号（1~18），默认 1
 * @param {Object} [box] - 对话框配置
 * @param {number} box.style - 对话框风格编号（0~5），0 表示关闭，1=Win95, 2=Terminal, 3=8bit, 4=16bit, 5=Retro
 * @param {string} box.title - 对话框标题，默认 ''
 * @param {string} box.content - 对话框内容，默认 ''
 * @param {number} box.position - 对话框垂直位置 [0,1]，默认 0.7
 * @param {number} getDOM - 重新截取 DOM 的间隔（ms），0 表示永不重新截取，默认 0
 * @returns {Object} { canvas, start, stop, updateParams } 控制句柄
 */
function LMSLuosGlitchB(
  element,
  size = 2,
  adjust = { dd: 0, qs: 0, ld: 0, dbd: 0, bhd: 1 },
  fx = { gz: false, crt: false, sxh: false, cy: false, dd: false, time: 50 },
  colorPanel = 1,
  box = { style: 0, title: '', content: '', position: 0.7 },
  getDOM = 0
) {
  //'use strict'; 严于律己失败哩

  // -------- 调色板预设 --------
  const PALETTES = [
    { // 1: Sora
      colors: [
        [0, 0, 0], [8, 14, 32], [22, 32, 60], [36, 54, 92],
        [52, 76, 120], [72, 104, 152], [100, 140, 184], [168, 148, 40],
        [220, 200, 90], [248, 236, 160], [255, 252, 228], [224, 160, 128]
      ]
    },
    { // 2: Game Boy
      colors: [[8, 24, 32], [52, 104, 86], [136, 192, 112], [224, 248, 208]]
    },
    { // 3: NES
      colors: [
        [0, 0, 0], [252, 252, 252], [188, 188, 188], [124, 124, 124],
        [228, 0, 8], [248, 56, 0], [248, 184, 0], [172, 124, 0],
        [0, 184, 0], [88, 216, 84], [0, 168, 68], [0, 232, 216],
        [0, 120, 248], [104, 68, 252], [216, 0, 204], [248, 120, 88]
      ]
    },
    { // 4: CGA
      colors: [[0, 0, 0], [85, 255, 255], [255, 85, 255], [255, 255, 255]]
    },
    { // 5: C64
      colors: [
        [0, 0, 0], [255, 255, 255], [136, 0, 0], [170, 255, 238],
        [204, 68, 204], [0, 204, 85], [0, 0, 170], [238, 238, 119],
        [136, 68, 0], [102, 68, 0], [255, 119, 119], [51, 51, 51],
        [119, 119, 119], [170, 255, 102], [0, 136, 255], [187, 187, 187]
      ]
    },
    { // 6: PICO-8
      colors: [
        [0, 0, 0], [29, 43, 83], [126, 37, 83], [0, 135, 81],
        [171, 82, 54], [95, 87, 79], [194, 195, 199], [255, 241, 232],
        [255, 0, 77], [255, 163, 0], [255, 236, 39], [0, 228, 54],
        [41, 173, 255], [131, 118, 156], [255, 119, 168], [255, 204, 170]
      ]
    },
    { // 7: Sweetie 16
      colors: [
        [26, 28, 44], [93, 39, 93], [177, 62, 83], [239, 125, 87],
        [255, 205, 117], [167, 240, 112], [56, 183, 100], [37, 113, 121],
        [41, 54, 111], [59, 93, 201], [65, 166, 246], [115, 239, 247],
        [244, 244, 244], [148, 176, 194], [86, 108, 134], [51, 60, 87]
      ]
    },
    { // 8: Pastel
      colors: [
        [255, 179, 186], [255, 223, 186], [255, 255, 186], [186, 255, 201],
        [186, 225, 255], [218, 186, 255], [255, 186, 243], [255, 255, 255],
        [200, 200, 200], [120, 120, 120], [60, 60, 60], [0, 0, 0]
      ]
    },
    { // 9: Mono
      colors: [
        [0, 0, 0], [34, 34, 34], [68, 68, 68], [102, 102, 102],
        [136, 136, 136], [170, 170, 170], [204, 204, 204], [238, 238, 238],
        [255, 255, 255]
      ]
    },
    { // 10: Sepia
      colors: [
        [44, 28, 6], [72, 52, 18], [102, 78, 36], [138, 110, 60],
        [170, 142, 88], [198, 176, 122], [222, 204, 160], [242, 230, 200],
        [255, 245, 230]
      ]
    },
    { // 11: Sunset
      colors: [
        [13, 2, 33], [44, 6, 69], [87, 10, 82], [140, 15, 75],
        [191, 36, 51], [224, 80, 29], [240, 134, 28], [248, 190, 53],
        [255, 237, 120], [255, 255, 230]
      ]
    },
    { // 12: Ocean
      colors: [
        [0, 20, 40], [0, 40, 80], [0, 80, 120], [0, 120, 160],
        [0, 160, 200], [40, 200, 220], [80, 220, 240], [160, 240, 255],
        [200, 248, 255], [255, 255, 255]
      ]
    },
    { // 13: Earth
      colors: [
        [34, 32, 28], [69, 60, 44], [107, 95, 70], [140, 128, 96],
        [168, 156, 120], [96, 128, 56], [64, 96, 48], [140, 96, 64],
        [192, 160, 112], [220, 200, 168]
      ]
    },
    { // 14: Sakura
      colors: [
        [43, 30, 26], [80, 56, 44], [52, 80, 48], [120, 164, 84],
        [156, 48, 72], [200, 80, 108], [232, 140, 164], [248, 196, 208],
        [255, 232, 238], [255, 255, 255], [176, 164, 200], [140, 180, 220]
      ]
    },
    { // 15: Cyber
      colors: [
        [8, 4, 16], [20, 8, 40], [48, 12, 64], [100, 20, 100],
        [180, 20, 100], [255, 40, 120], [255, 140, 200], [10, 40, 80],
        [0, 160, 200], [80, 240, 255], [200, 160, 255], [255, 255, 255]
      ]
    },
    { // 16: Horror
      colors: [
        [0, 0, 0], [24, 4, 4], [60, 8, 8], [120, 16, 16],
        [180, 20, 20], [220, 60, 40], [40, 44, 16], [72, 80, 32],
        [48, 24, 48], [80, 72, 68], [200, 180, 140], [240, 220, 190]
      ]
    },
    { // 17: RISO
      colors: [[0, 50, 255], [232, 0, 28], [245, 240, 232]]
    },
    { // 18: CMYK
      colors: [[0, 174, 239], [236, 0, 140], [255, 242, 0], [0, 0, 0]]
    },
	{ //19:PSConsole
		colors:[[1,36,86],[255, 255, 255]]
	}
  ];

  // -------- 对话框样式（与原 Sc 一致） --------
  // 像素边框所需的网格（仅用于绘制边框，此处简化，直接用颜色边框）
  // CSS 边框模拟，使用边框绘制逻辑
  // 用颜色绘制简单像素边框。
  // 这里定义每种样式的配色：
  const DIALOG_STYLES = {
    1: { // Win95 Alert
      isWin95: true,
      bg: '#c0c0c0',
      border: '#808080',
      titleBg: '#000080',
      titleColor: '#ffffff',
      textColor: '#000000',
      boxShadow: 'inset -1px -1px 0 #000, inset 1px 1px 0 #dfdfdf, inset -2px -2px 0 #808080, inset 2px 2px 0 #ffffff'
    },
    2: { // Terminal
      isTerminal: true,
      bg: 'rgba(0,0,0,0.85)',
      border: '#33ff33',
      textColor: '#33ff33',
      fontFamily: "'Courier New', monospace"
    },
    3: { // 8bit
      bg: '#000000',
      border: '#ffffff',
      textColor: '#ffffff',
      titleBg: '#000000',
      titleColor: '#ffffff',
      borderWidth: 4
    },
    4: { // 16bit
      bg: '#000066',
      border: '#8888dd',
      textColor: '#ffffff',
      titleBg: '#000066',
      titleColor: '#ffffff',
      borderWidth: 3
    },
    5: { // Retro RPG
      bg: '#2a1a0a',
      border: '#c8a870',
      textColor: '#f0e0c0',
      titleBg: '#2a1a0a',
      titleColor: '#ffe0a0',
      borderWidth: 4
    }
  };

  // -------- 工具函数 --------
  function nearestColorIndex(r, g, b, palette) {
    let minDist = Infinity, idx = 0;
    for (let i = 0; i < palette.length; i++) {
      const [pr, pg, pb] = palette[i];
      const dr = r - pr, dg = g - pg, db = b - pb;
      const dist = dr * dr + dg * dg + db * db;
      if (dist < minDist) { minDist = dist; idx = i; }
    }
    return idx;
  }

  // 抖动（Floyd-Steinberg）
  function applyDither(imageData, width, height, palette, intensity) {
    const data = imageData.data;
    const copy = new Uint8ClampedArray(data);
    const factor = Math.min(1, Math.max(0, intensity));
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (data[idx + 3] < 30) continue;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        const ci = nearestColorIndex(r, g, b, palette);
        const [pr, pg, pb] = palette[ci];
        const errR = (r - pr) * factor;
        const errG = (g - pg) * factor;
        const errB = (b - pb) * factor;
        data[idx] = pr; data[idx+1] = pg; data[idx+2] = pb;
        const neighbors = [[x+1,y,7/16],[x-1,y+1,3/16],[x,y+1,5/16],[x+1,y+1,1/16]];
        for (const [nx, ny, w] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const ni = (ny * width + nx) * 4;
            if (copy[ni + 3] > 30) {
              data[ni] = Math.max(0, Math.min(255, data[ni] + errR * w));
              data[ni+1] = Math.max(0, Math.min(255, data[ni+1] + errG * w));
              data[ni+2] = Math.max(0, Math.min(255, data[ni+2] + errB * w));
            }
          }
        }
      }
    }
  }

  // 量化（无抖动）
  function quantize(imageData, width, height, palette) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 30) continue;
      const ci = nearestColorIndex(data[i], data[i+1], data[i+2], palette);
      const [r, g, b] = palette[ci];
      data[i] = r; data[i+1] = g; data[i+2] = b;
    }
  }

  // 调整：亮度、对比度、饱和度
  function applyAdjustments(imageData, brightness, contrast, saturation) {
    const data = imageData.data;
    const b = brightness || 0;
    const c = ((contrast || 0) / 100) + 1; // 0.4~1.6
    const sat = saturation || 1;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 30) continue;
      let r = data[i] + b, g = data[i+1] + b, bl = data[i+2] + b;
      r = (r - 128) * c + 128;
      g = (g - 128) * c + 128;
      bl = (bl - 128) * c + 128;
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
      r = gray + (r - gray) * sat;
      g = gray + (g - gray) * sat;
      bl = gray + (bl - gray) * sat;
      data[i] = Math.max(0, Math.min(255, Math.round(r)));
      data[i+1] = Math.max(0, Math.min(255, Math.round(g)));
      data[i+2] = Math.max(0, Math.min(255, Math.round(bl)));
    }
  }

  // -------- 特效函数 --------
  function applyCRT(imageData, width, height) {
    const data = imageData.data;
    for (let y = 0; y < height; y++) {
      const dark = (y % 2 === 1) ? 0.65 : 1;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        data[idx] *= dark; data[idx+1] *= dark; data[idx+2] *= dark;
      }
    }
  }

  function applyPaletteCycle(imageData, width, height, palette, frame) {
    const data = imageData.data;
    const len = palette.length;
    if (!len) return;
    const offset = frame % len;
    // 建立颜色映射（通过当前颜色值查找新索引）
    // 由于量化后颜色是精确的调色板颜色，我们可以通过比较 RGB 来重新映射
    for (let i = 0; i < data.length; i += 4) {
      if (data[i+3] < 30) continue;
      const r = data[i], g = data[i+1], b = data[i+2];
      // 查找当前颜色在调色板中的索引（假定精确）
      let idx = -1;
      for (let j = 0; j < len; j++) {
        const [pr, pg, pb] = palette[j];
        if (r === pr && g === pg && b === pb) { idx = j; break; }
      }
      if (idx !== -1) {
        const newIdx = (idx + offset) % len;
        const [nr, ng, nb] = palette[newIdx];
        data[i] = nr; data[i+1] = ng; data[i+2] = nb;
      }
    }
  }

  function applyGhost(imageData, width, height, prevImageData, frame) {
    if (!prevImageData) return;
    const data = imageData.data;
    const prev = prevImageData.data;
    const mix = 0.7 + 0.05 * Math.sin(frame * 0.1);
    for (let i = 0; i < data.length; i += 4) {
      if (data[i+3] < 30) continue;
      data[i] = data[i] * mix + prev[i] * (1 - mix);
      data[i+1] = data[i+1] * mix + prev[i+1] * (1 - mix);
      data[i+2] = data[i+2] * mix + prev[i+2] * (1 - mix);
    }
  }

  function applyDitherFade(imageData, width, height, frame) {
    const data = imageData.data;
    const bayer = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
    const threshold = 8 + 6 * Math.sin(frame * 0.15);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (bayer[y % 4][x % 4] > threshold) {
          data[idx] *= 0.3; data[idx+1] *= 0.3; data[idx+2] *= 0.3;
        }
      }
    }
  }

  function applyGlitch(imageData, width, height, pixelSize) {
    const data = imageData.data;
    const copy = new Uint8ClampedArray(data);
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const y = Math.floor(Math.random() * height);
      const h = Math.max(1, Math.floor(Math.random() * (height / 10)));
      const shift = (Math.random() - 0.5) * pixelSize * 6;
      const offset = Math.round(shift);
      for (let dy = 0; dy < h && y + dy < height; dy++) {
        for (let x = 0; x < width; x++) {
          const srcX = Math.min(width - 1, Math.max(0, x + offset));
          const srcIdx = ((y + dy) * width + srcX) * 4;
          const dstIdx = ((y + dy) * width + x) * 4;
          data[dstIdx] = copy[srcIdx];
          data[dstIdx+1] = copy[srcIdx+1];
          data[dstIdx+2] = copy[srcIdx+2];
          data[dstIdx+3] = copy[srcIdx+3];
        }
      }
    }
  }

  // -------- 对话框绘制函数 --------
  function drawDialog(ctx, width, height, boxStyle, title, content, position, gridW, gridH, pixelSize) {
    if (boxStyle === 0 || !content) return;
    const style = DIALOG_STYLES[boxStyle];
    if (!style) return;

    const posY = position * height;
    const margin = 20;
    const maxWidth = width - margin * 2;
    const fontSize = Math.max(12, Math.min(20, pixelSize * 4));
    ctx.save();

    // 根据风格绘制不同的对话框
    if (style.isWin95) {
      // Win95 风格
      const boxW = maxWidth * 0.7;
      const boxH = Math.min(height * 0.5, 200);
      const x = (width - boxW) / 2;
      const y = posY - boxH - 10;
      // 绘制窗口
      ctx.fillStyle = '#c0c0c0';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;
      ctx.fillRect(x, y, boxW, boxH);
      ctx.shadowBlur = 0;
      // 边框
      ctx.strokeStyle = '#808080';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, boxW, boxH);
      // 标题栏
      const titleH = 22;
      ctx.fillStyle = '#000080';
      ctx.fillRect(x, y, boxW, titleH);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${fontSize * 0.8}px 'DotGothic16', monospace`;
      ctx.textBaseline = 'middle';
      ctx.fillText(title || 'System Failure', x + 8, y + titleH/2);
      // 关闭按钮
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(x + boxW - 22, y + 2, 18, 18);
      ctx.fillStyle = '#000';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('×', x + boxW - 13, y + 13);
      // 内容
      ctx.fillStyle = '#000';
      ctx.font = `${fontSize}px 'DotGothic16', monospace`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const lines = content.split('\n');
      const lineHeight = fontSize * 1.6;
      const startY = y + titleH + 12;
      for (let i = 0; i < lines.length && i < 6; i++) {
        ctx.fillText(lines[i], x + 12, startY + i * lineHeight);
      }
    } else if (style.isTerminal) {
      // Terminal
      const boxW = maxWidth * 0.8;
      const boxH = Math.min(height * 0.4, 150);
      const x = (width - boxW) / 2;
      const y = posY - boxH - 10;
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.shadowColor = 'rgba(0,255,51,0.2)';
      ctx.shadowBlur = 10;
      ctx.fillRect(x, y, boxW, boxH);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#33ff33';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, boxW, boxH);
      ctx.fillStyle = '#33ff33';
      ctx.font = `${fontSize}px 'Courier New', monospace`;
      ctx.textBaseline = 'top';
      const lines = content.split('\n');
      const lineHeight = fontSize * 1.4;
      const startY = y + 10;
      for (let i = 0; i < lines.length && i < 8; i++) {
        ctx.fillText('> ' + lines[i], x + 10, startY + i * lineHeight);
      }
    } else {
      // 其他像素风格（8bit, 16bit, Retro RPG）
      const borderW = style.borderWidth || 3;
      const boxW = maxWidth * 0.75;
      const boxH = Math.min(height * 0.45, 180);
      const x = (width - boxW) / 2;
      const y = posY - boxH - 10;
      // 背景
      ctx.fillStyle = style.bg;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.fillRect(x, y, boxW, boxH);
      ctx.shadowBlur = 0;
      // 边框（像素风格）
      ctx.strokeStyle = style.border;
      ctx.lineWidth = borderW;
      ctx.strokeRect(x, y, boxW, boxH);
      // 标题（如果有）
      if (title) {
        const titleH = 24;
        ctx.fillStyle = style.titleBg || style.bg;
        ctx.fillRect(x + borderW, y + borderW, boxW - 2*borderW, titleH);
        ctx.fillStyle = style.titleColor || style.textColor;
        ctx.font = `bold ${fontSize * 0.9}px 'DotGothic16', monospace`;
        ctx.textBaseline = 'middle';
        ctx.fillText(title, x + 12, y + borderW + titleH/2);
        // 内容区域
        const contentY = y + borderW + titleH + 8;
        ctx.fillStyle = style.textColor;
        ctx.font = `${fontSize}px 'DotGothic16', monospace`;
        ctx.textBaseline = 'top';
        const lines = content.split('\n');
        const lineHeight = fontSize * 1.5;
        for (let i = 0; i < lines.length && i < 6; i++) {
          ctx.fillText(lines[i], x + 12, contentY + i * lineHeight);
        }
      } else {
        // 无标题，直接显示内容
        ctx.fillStyle = style.textColor;
        ctx.font = `${fontSize}px 'DotGothic16', monospace`;
        ctx.textBaseline = 'top';
        const lines = content.split('\n');
        const lineHeight = fontSize * 1.5;
        const startY = y + 12;
        for (let i = 0; i < lines.length && i < 8; i++) {
          ctx.fillText(lines[i], x + 12, startY + i * lineHeight);
        }
      }
    }
    ctx.restore();
  }

  // -------- 主要逻辑 --------
  // 参数标准化，限制范围
  const pixelSize = Math.max(1, Math.min(10, size));//size==0?0:
  const dither = Math.min(1, Math.max(0, adjust.dd || 0));
  const erode = Math.min(3, Math.max(0, adjust.qs || 0)); // 未实现，保留
  const brightness = Math.min(60, Math.max(-60, adjust.ld || 0));
  const contrast = Math.min(60, Math.max(-60, adjust.dbd || 0));
  const saturation = Math.min(2, Math.max(0, adjust.bhd || 1));

  const fxGlitch = !!fx.gz;
  const fxCRT = !!fx.crt;
  const fxCycle = !!fx.sxh;
  const fxGhost = !!fx.cy;
  const fxDitherFade = !!fx.dd;
  const fxTime = Math.max(10, fx.time || 50);

  const paletteIndex = Math.min(19, Math.max(1, colorPanel)) - 1;
  const paletteColors = PALETTES[paletteIndex] ? PALETTES[paletteIndex].colors : PALETTES[0].colors;

  const boxStyle = Math.min(5, Math.max(0, box.style || 0));
  const boxTitle = box.title || '';
  const boxContent = box.content || '';
  const boxPosition = Math.min(1, Math.max(0, box.position || 0.7));

  const reCaptureInterval = Math.max(0, getDOM || 0);

  // 尝试创建style；如果已经有了，不再创建
  const LMSLuosGlitchBStyle=document.getElementById("LMSLuosGlitchBStyle");
  if(!LMSLuosGlitchBStyle){
	  const newLMSLuosGlitchBStyle=document.createElement("style");
	  newLMSLuosGlitchBStyle.id="LMSLuosGlitchBStyle";
	  newLMSLuosGlitchBStyle.textContent=`
		  canvas.LMSLuosGlitchB {
					  position: absolute;
					  top: 0;
					  /*left: 0;*/
					  width: 100%;
					  height: 100%;
					  pointer-events: none;
					  z-index: 2;
					  display: block;
					  border-radius: inherit;
				}
			`;
	  document.head.appendChild(newLMSLuosGlitchBStyle);
  }
  
  
  // 创建输出 canvas
  const outputCanvas = document.createElement('canvas');
  outputCanvas.classList.add("LMSLuosGlitchB");
  outputCanvas.style.display = 'block';
  outputCanvas.style.imageRendering = 'pixelated';
  // 插入到 element 之后
  //element.parentNode.insertBefore(outputCanvas, element.nextSibling);
  try{element.parentNode.appendChild(outputCanvas);}
  catch(err){element.appendChild(outputCanvas);}

  // 内部状态
  let baseImageData = null;        // 量化后的网格 ImageData
  let gridWidth = 0, gridHeight = 0;
  let prevFrameData = null;        // 用于残影
  let frameCounter = 0;
  let timerCapture = null;
  let timerEffect = null;
  let isRunning = false;
  let isCapturing = false;

  // 加载 html2canvas
  function loadHtml2canvas() {
    return new Promise((resolve, reject) => {
      if (window.html2canvas) {
        resolve(window.html2canvas);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdmirror.com/npm/html2canvas@1.4.1/dist/html2canvas.min.js';//cdn.jsdelivr.net
      script.onload = () => resolve(window.html2canvas);
      script.onerror = () => reject(new Error('Failed to load html2canvas'));
      document.head.appendChild(script);
    });
  }

  // 核心处理：截图 -> 量化 -> 存储基础数据
  async function captureAndProcess() {
    if (isCapturing) return;
    isCapturing = true;
    try {
      const html2canvas = await loadHtml2canvas();
      const captured = await html2canvas(element, {
        useCORS: true,
        allowTaint: false,
        scale: 1,
        backgroundColor: null,
        logging: false
      });

      // 获取尺寸
      let srcW = captured.width;
      let srcH = captured.height;
      // 限制输出尺寸防止过大
      const maxDim = 2048;
      if (srcW > maxDim || srcH > maxDim) {
        const ratio = Math.min(maxDim / srcW, maxDim / srcH);
        srcW = Math.floor(srcW * ratio);
        srcH = Math.floor(srcH * ratio);
      }

      // 设置输出 canvas 尺寸
      outputCanvas.width = srcW;
      outputCanvas.height = srcH;
      outputCanvas.style.width = srcW + 'px';
      outputCanvas.style.height = srcH + 'px';

      // 下采样到网格
      const gridW = Math.max(1, Math.floor(srcW / pixelSize));
      const gridH = Math.max(1, Math.floor(srcH / pixelSize));
      const gridCanvas = document.createElement('canvas');
      gridCanvas.width = gridW;
      gridCanvas.height = gridH;
      const gCtx = gridCanvas.getContext('2d');
      gCtx.imageSmoothingEnabled = true;
      gCtx.imageSmoothingQuality = 'high';
      gCtx.drawImage(captured, 0, 0, gridW, gridH);

      // 获取网格像素数据
      const imageData = gCtx.getImageData(0, 0, gridW, gridH);
      // 应用调整
      applyAdjustments(imageData, brightness, contrast, saturation);
      // 量化（带抖动）
      if (dither > 0) {
        applyDither(imageData, gridW, gridH, paletteColors, dither);
      } else {
        quantize(imageData, gridW, gridH, paletteColors);
      }

      // 存储基础数据
      baseImageData = new ImageData(new Uint8ClampedArray(imageData.data), gridW, gridH);
      gridWidth = gridW;
      gridHeight = gridH;
      prevFrameData = null; // 重置残影
      frameCounter = 0;

      // 立即绘制
      drawFrame();
    } catch (err) {
      console.error('Capture error:', err);
    } finally {
      isCapturing = false;
    }
  }

  // 绘制当前帧（应用特效 + 对话框）
  function drawFrame() {
    if (!baseImageData) return;
    const w = gridWidth, h = gridHeight;
    // 复制基础数据
    const dataCopy = new Uint8ClampedArray(baseImageData.data);
    const tempData = new ImageData(dataCopy, w, h);

    // 应用特效（按顺序）
    if (fxCRT) applyCRT(tempData, w, h);
    if (fxCycle) applyPaletteCycle(tempData, w, h, paletteColors, frameCounter);
    if (fxGhost) {
      applyGhost(tempData, w, h, prevFrameData, frameCounter);
      // 保存当前帧作为下一帧的 prev
      prevFrameData = new ImageData(new Uint8ClampedArray(tempData.data), w, h);
    }
    if (fxDitherFade) applyDitherFade(tempData, w, h, frameCounter);
    if (fxGlitch) applyGlitch(tempData, w, h, pixelSize);

    // 放大到输出 canvas
    const ctx = outputCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    // 将网格绘制到输出 canvas（最近邻放大）
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tCtx = tempCanvas.getContext('2d');
    tCtx.putImageData(tempData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0, outputCanvas.width, outputCanvas.height);

    // 绘制对话框
    if (boxStyle > 0 && boxContent) {
      drawDialog(ctx, outputCanvas.width, outputCanvas.height, boxStyle, boxTitle, boxContent, boxPosition, w, h, pixelSize);
    }

    frameCounter++;
  }

  // 特效循环定时器回调
  function effectLoop() {
    if (baseImageData) {
      drawFrame();
    }
  }

  // 启动
  function start() {
    if (isRunning) return;
    isRunning = true;

    // 首次处理
    captureAndProcess().then(() => {
      // 根据参数决定是否启动定时器
      const hasEffect = fxGlitch || fxCRT || fxCycle || fxGhost || fxDitherFade;
      const needCaptureLoop = reCaptureInterval > 0;

      if (needCaptureLoop) {
        timerCapture = setInterval(() => {
          captureAndProcess();
        }, reCaptureInterval);
      }

      if (hasEffect) {
        timerEffect = setInterval(effectLoop, fxTime);
      } else if (!needCaptureLoop) {
        // 无特效且无重新截图，只绘制一次，无需定时器
        // 但已经绘制过了，那就不管了。开摆
      }
    });
  }

  function stop() {
    isRunning = false;
    if (timerCapture) {
      clearInterval(timerCapture);
      timerCapture = null;
    }
    if (timerEffect) {
      clearInterval(timerEffect);
      timerEffect = null;
    }
  }

  // 更新参数（可选）
  function updateParams(newParams) {
    // 简化：停止并重新启动
    stop();
    // 可在此处修改内部参数，但为简化，仅重新启动
    // 由于参数已经闭包，无法直接修改，建议重新调用函数。
    console.warn('updateParams not fully implemented; please restart with new parameters.');
  }

  // 自动启动
  start();

  // 返回控制对象
  return {
    canvas: outputCanvas,
    start,
    stop,
    updateParams
  };
}