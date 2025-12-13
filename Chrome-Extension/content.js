// Content script to inject color picker and apply background colors
let colorPickerVisible = false;
let colorPickerElement = null;
let originalBackgroundColor = null;

// Create and inject color picker UI
function createColorPicker() {
  if (colorPickerElement) {
    return colorPickerElement;
  }

  const picker = document.createElement('div');
  picker.id = 'color-picker-container';
  picker.innerHTML = `
    <div class="color-picker-wrapper">
      <div class="color-picker-header">
        <h3>Background Color</h3>
        <button id="close-picker" class="close-btn">×</button>
      </div>
      <div class="color-picker-body">
        <div class="color-wheel-container">
          <canvas id="color-wheel" width="200" height="200"></canvas>
          <div id="color-wheel-selector"></div>
        </div>
        <div class="color-sidebar">
          <div class="color-presets">
            <div class="preset-title">Presets</div>
            <div class="preset-colors">
              <div class="preset-color" data-color="#ffffff" style="background: #ffffff"></div>
              <div class="preset-color" data-color="#f5f5f5" style="background: #f5f5f5"></div>
              <div class="preset-color" data-color="#e8e8e8" style="background: #e8e8e8"></div>
              <div class="preset-color" data-color="#000000" style="background: #000000"></div>
              <div class="preset-color" data-color="#1e1e1e" style="background: #1e1e1e"></div>
              <div class="preset-color" data-color="#2d2d2d" style="background: #2d2d2d"></div>
              <div class="preset-color" data-color="#ff6b6b" style="background: #ff6b6b"></div>
              <div class="preset-color" data-color="#4ecdc4" style="background: #4ecdc4"></div>
              <div class="preset-color" data-color="#45b7d1" style="background: #45b7d1"></div>
              <div class="preset-color" data-color="#f9ca24" style="background: #f9ca24"></div>
              <div class="preset-color" data-color="#6c5ce7" style="background: #6c5ce7"></div>
              <div class="preset-color" data-color="#a29bfe" style="background: #a29bfe"></div>
            </div>
          </div>
          <div class="color-input-section">
            <div class="input-group">
              <label>Hex:</label>
              <input type="text" id="hex-input" value="#ffffff" maxlength="7">
            </div>
            <div class="input-group">
              <label>RGB:</label>
              <input type="text" id="rgb-input" value="rgb(255, 255, 255)" readonly>
            </div>
            <div class="color-preview">
              <div class="preview-label">Preview</div>
              <div id="color-preview" style="background: #ffffff"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="color-picker-footer">
        <div class="mode-buttons">
          <button id="light-mode-btn" class="btn btn-mode">Light</button>
          <button id="dark-mode-btn" class="btn btn-mode">Dark</button>
        </div>
        <div class="action-buttons">
          <button id="reset-btn" class="btn btn-secondary">Reset</button>
          <button id="apply-btn" class="btn btn-primary">Apply</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(picker);
  colorPickerElement = picker;

  // Initialize color wheel
  initColorWheel();
  
  // Setup event listeners
  setupEventListeners();
  
  // Set initial selector position (center of wheel, white color)
  setTimeout(() => {
    const canvas = document.getElementById('color-wheel');
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    updateSelectorPosition(centerX, centerY, centerX, centerY);
  }, 100);

  return picker;
}

// Initialize color wheel canvas
function initColorWheel() {
  const canvas = document.getElementById('color-wheel');
  const ctx = canvas.getContext('2d');
  const size = 200;
  const center = size / 2;
  const radius = center - 10;

  // Draw color wheel using image data for better performance
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= radius) {
        const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 180) % 360;
        const saturation = Math.min(distance / radius, 1);
        const lightness = 0.5;
        
        const color = hslToRgb(angle / 360, saturation, lightness);
        const index = (y * size + x) * 4;
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// HSL to RGB conversion
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// RGB to Hex
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

// Hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Update color from wheel position
function updateColorFromWheel(x, y) {
  const canvas = document.getElementById('color-wheel');
  const rect = canvas.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const radius = (rect.width / 2) - 10;
  
  if (distance > radius) return;
  
  const angle = Math.atan2(dy, dx) * 180 / Math.PI + 180;
  const saturation = Math.min(distance / radius, 1);
  const lightness = 0.5;
  
  const rgb = hslToRgb(angle / 360, saturation, lightness);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  
  updateColorDisplay(hex, rgb);
  updateSelectorPosition(x, y, centerX, centerY);
}

// Update selector position
function updateSelectorPosition(x, y, centerX, centerY) {
  const selector = document.getElementById('color-wheel-selector');
  const canvas = document.getElementById('color-wheel');
  const rect = canvas.getBoundingClientRect();
  
  // Calculate position relative to canvas
  const relX = x - rect.left;
  const relY = y - rect.top;
  
  selector.style.left = relX + 'px';
  selector.style.top = relY + 'px';
  selector.style.display = 'block';
}

// Update color display
function updateColorDisplay(hex, rgb) {
  document.getElementById('hex-input').value = hex;
  document.getElementById('rgb-input').value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  document.getElementById('color-preview').style.background = hex;
}

// Setup event listeners
function setupEventListeners() {
  const canvas = document.getElementById('color-wheel');
  const hexInput = document.getElementById('hex-input');
  const applyBtn = document.getElementById('apply-btn');
  const resetBtn = document.getElementById('reset-btn');
  const closeBtn = document.getElementById('close-picker');
  const presetColors = document.querySelectorAll('.preset-color');

  // Color wheel interaction
  let isDragging = false;
  
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateColorFromWheel(e.clientX, e.clientY);
    e.preventDefault();
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      updateColorFromWheel(e.clientX, e.clientY);
      e.preventDefault();
    }
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  canvas.addEventListener('click', (e) => {
    updateColorFromWheel(e.clientX, e.clientY);
  });

  // Hex input
  hexInput.addEventListener('input', (e) => {
    let hex = e.target.value.trim();
    // Auto-add # if missing
    if (hex && !hex.startsWith('#')) {
      hex = '#' + hex;
    }
    // Validate and update
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      const rgb = hexToRgb(hex);
      if (rgb) {
        updateColorDisplay(hex, rgb);
        e.target.value = hex;
      }
    }
  });
  
  // Handle hex input on blur to format properly
  hexInput.addEventListener('blur', (e) => {
    let hex = e.target.value.trim();
    if (hex && !hex.startsWith('#')) {
      hex = '#' + hex;
    }
    // Try to parse and format
    const rgb = hexToRgb(hex);
    if (rgb) {
      const formattedHex = rgbToHex(rgb.r, rgb.g, rgb.b);
      updateColorDisplay(formattedHex, rgb);
      e.target.value = formattedHex;
    }
  });

  // Preset colors
  presetColors.forEach(preset => {
    preset.addEventListener('click', () => {
      const color = preset.getAttribute('data-color');
      const rgb = hexToRgb(color);
      if (rgb) {
        updateColorDisplay(color, rgb);
      }
    });
  });

  // Apply button
  applyBtn.addEventListener('click', () => {
    const hex = document.getElementById('hex-input').value;
    applyBackgroundColor(hex);
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    resetBackgroundColor();
  });

  // Light mode button
  const lightModeBtn = document.getElementById('light-mode-btn');
  lightModeBtn.addEventListener('click', () => {
    applyLightMode();
  });

  // Dark mode button
  const darkModeBtn = document.getElementById('dark-mode-btn');
  darkModeBtn.addEventListener('click', () => {
    applyDarkMode();
  });

  // Close button
  closeBtn.addEventListener('click', () => {
    toggleColorPicker();
  });
}

// Apply background color to website
function applyBackgroundColor(color) {
  if (!originalBackgroundColor) {
    originalBackgroundColor = document.body.style.backgroundColor || 
                              window.getComputedStyle(document.body).backgroundColor;
  }
  document.body.style.backgroundColor = color;
}

// Reset background color
function resetBackgroundColor() {
  if (originalBackgroundColor) {
    document.body.style.backgroundColor = originalBackgroundColor;
  } else {
    document.body.style.backgroundColor = '';
  }
}

// Apply light mode
function applyLightMode() {
  const lightColor = '#ffffff';
  const rgb = hexToRgb(lightColor);
  if (rgb) {
    updateColorDisplay(lightColor, rgb);
    applyBackgroundColor(lightColor);
    
    // Update button states
    const lightBtn = document.getElementById('light-mode-btn');
    const darkBtn = document.getElementById('dark-mode-btn');
    lightBtn.classList.add('active');
    darkBtn.classList.remove('active');
  }
}

// Apply dark mode
function applyDarkMode() {
  const darkColor = '#1e1e1e';
  const rgb = hexToRgb(darkColor);
  if (rgb) {
    updateColorDisplay(darkColor, rgb);
    applyBackgroundColor(darkColor);
    
    // Update button states
    const lightBtn = document.getElementById('light-mode-btn');
    const darkBtn = document.getElementById('dark-mode-btn');
    darkBtn.classList.add('active');
    lightBtn.classList.remove('active');
  }
}

// Toggle color picker visibility
function toggleColorPicker() {
  if (!colorPickerVisible) {
    createColorPicker();
    colorPickerElement.style.display = 'flex';
    colorPickerVisible = true;
  } else {
    if (colorPickerElement) {
      colorPickerElement.style.display = 'none';
      colorPickerVisible = false;
    }
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleColorPicker") {
    toggleColorPicker();
    sendResponse({ success: true });
  }
  return true;
});

