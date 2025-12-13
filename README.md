# Website Background Color Changer - Chrome Extension

A Chrome Extension that allows you to dynamically change the background color of any website using a beautiful VS Code-style color picker.

## Features

- 🎨 **VS Code-inspired Color Picker**: Beautiful, modern UI with a color wheel and sidebar
- 🌈 **Interactive Color Wheel**: Click and drag to select any color
- 📋 **Color Presets**: Quick access to common colors
- 💻 **Hex & RGB Input**: Manual color input with live preview
- 🔄 **Reset Functionality**: Restore original background color
- ✨ **Smooth Animations**: Polished user experience

## Installation

1. **Download or Clone** this repository to your local machine

2. **Open Chrome Extensions Page**:
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or go to Menu (⋮) → More Tools → Extensions

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**:
   - Click "Load unpacked"
   - Select the folder containing this extension
   - The extension should now appear in your extensions list

5. **Optional - Add Icons**:
   - Create three icon files: `icon16.png`, `icon48.png`, and `icon128.png`
   - Place them in the extension folder
   - Or remove the `icons` section from `manifest.json` if you don't have icons

## Usage

1. **Navigate to any website** you want to modify

2. **Open the Color Picker**:
   - Click the extension icon in the Chrome toolbar
   - Or use the keyboard shortcut (if configured)

3. **Select a Color**:
   - **Color Wheel**: Click and drag on the circular color wheel
   - **Presets**: Click any preset color in the sidebar
   - **Hex Input**: Type a hex color code (e.g., `#ff6b6b`)

4. **Apply the Color**:
   - Click the "Apply" button to change the website background
   - Click "Reset" to restore the original background
   - Click "×" to close the color picker

## Files Structure

```
Chrome Extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for extension icon click
├── content.js             # Main script with color picker logic
├── color-picker.css       # Styles for the color picker UI
└── README.md             # This file
```

## How It Works

- **Content Script**: Injected into every webpage to add the color picker functionality
- **Color Wheel**: Renders a full-spectrum color wheel using HTML5 Canvas
- **Background Script**: Handles the extension icon click to toggle the color picker
- **DOM Manipulation**: Applies the selected color directly to the website's body element

## Customization

You can customize the extension by:

- **Adding more preset colors**: Edit the `preset-colors` section in `content.js`
- **Changing the UI theme**: Modify colors in `color-picker.css`
- **Adjusting the color wheel size**: Change the canvas size in `content.js`

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers

## Notes

- The background color change is temporary and only affects the current page
- Refreshing the page will restore the original background
- Some websites with complex CSS might override the background color

## License

Free to use and modify for personal or commercial projects.

