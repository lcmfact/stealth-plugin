
# Document Helper Browser Extension

*A lightweight browser extension that enhances your reading experience by providing a floating text panel for selected content.*

---

## ✨ Features

- **Floating Text Panel**: View selected text in a movable, resizable overlay  
- **Stay Focused**: Keep important text visible while browsing different parts of a page  
- **Simple Controls**: Intuitive drag-and-drop movement and resizing  
- **Minimal Design**: Clean interface that works across all websites  
- **Privacy-Focused**: Operates locally with no data collection  

---

## 🛠 Installation

### Developer Mode Installation

1. Download or clone this repository  
2. Open your browser's extension page:
   - **Chrome**: `chrome://extensions/`  
   - **Edge**: `edge://extensions/`  
   - **Brave**: `brave://extensions/`  
3. Enable **Developer mode** (toggle in the top-right corner)  
4. Click **"Load unpacked"** and select the extension directory  
5. The extension icon will appear in your browser toolbar  

---

## 🚀 Usage

- Click the extension icon to activate the panel  
- Select any text on a webpage to display it in the panel  
- Drag the panel by its header to reposition  
- Resize by dragging the bottom-right corner  
- Minimize with the `_` button when not in use  
- Close with the `×` button or toggle with the extension icon  

---

## 🧱 Technical Implementation

### 📁 Project Structure

```
document-helper/
├── manifest.json     # Extension configuration
├── content.js        # Page interaction logic
├── background.js     # Extension service worker
```

### 🧠 Architecture

- Framework-less implementation for optimal performance  
- Uses **Shadow DOM** for reliable rendering across all websites  
- Event-based communication between components  
- Stateful panel management across browser tabs  

---

## 🌐 Browser Compatibility

- Google Chrome (v88+)  
- Microsoft Edge (v88+)  
- Brave Browser (v1.20+)  
- Opera (v74+)  

---

## ⚙️ Performance Considerations

- Minimal DOM manipulation for best performance  
- Low memory footprint  
- Non-blocking event listeners  
- Efficient state management  

---

## 📄 License

**MIT License** – See [LICENSE](LICENSE) file for details  

---

## 🔒 Privacy Policy

This extension:
- Does **not** collect any user data  
- Does **not** communicate with external servers  
- Does **not** store selected text beyond the current browsing session  
- Does **not** inject ads or tracking code  

---

## 🧑‍💻 Development

### 🧱 Building from Source

No build step required. The extension can be loaded directly from the source files.

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request:

```bash
# Fork the repository
git checkout -b feature/amazing-feature  # Create your feature branch
git commit -m 'Add some amazing feature' # Commit your changes
git push origin feature/amazing-feature  # Push to the branch
```

Then open a Pull Request 🚀

---

> **Note:** This extension is designed for personal productivity and research purposes.  
> Please respect website terms of service when using this tool.
