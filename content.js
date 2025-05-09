// content.js - Handles interaction with the webpage and manages the panel

// Use random variable names to avoid detection patterns
const randPrefix = Math.random().toString(36).substring(2, 8);
const varNames = {
    panel: `_${randPrefix}_container`,
    visible: `_${randPrefix}_state`,
    drag: `_${randPrefix}_move`,
    resize: `_${randPrefix}_size`,
    offsetX: `_${randPrefix}_posX`,
    offsetY: `_${randPrefix}_posY`,
    width: `_${randPrefix}_w`,
    height: `_${randPrefix}_h`
};

// Store references using our randomized variable names
let [panelFrame, isPanelVisible, isDragging, isResizing, dragOffsetX, dragOffsetY, initialWidth, initialHeight] =
    [null, false, false, false, 0, 0, 300, 200];

// Initialize the panel
function createPanel() {
    if (panelFrame) return;

    // Create panel as a shadowDOM to hide from direct DOM access
    const hostElement = document.createElement('div');
    hostElement.style.cssText = 'all: initial; display: contents;';
    document.documentElement.appendChild(hostElement);

    // Create shadow root with closed mode for better stealth
    const shadow = hostElement.attachShadow({ mode: 'closed' });

    // Create styles directly in the shadow DOM
    const style = document.createElement('style');
    style.textContent = `
    .panel-container {
      position: fixed;
      top: 20px;
      left: 20px;
      width: ${initialWidth}px;
      height: ${initialHeight}px;
      z-index: 2147483647;
      background-color: white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      border-radius: 5px;
      font-family: system-ui, -apple-system, sans-serif;
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      background-color: #f0f0f0;
      border-bottom: 1px solid #ddd;
      cursor: move;
      user-select: none;
    }
    .panel-title {
      font-weight: 600;
      font-size: 14px;
      color: #444;
    }
    .panel-controls {
      display: flex;
      gap: 5px;
    }
    .panel-controls button {
      width: 20px;
      height: 20px;
      border: none;
      background-color: transparent;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      color: #666;
      transition: background-color 0.2s;
    }
    .panel-controls button:hover {
      background-color: #e0e0e0;
    }
    .close-btn:hover {
      background-color: #ff5f57;
      color: white;
    }
    .panel-content {
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      position: relative;
    }
    .placeholder-text {
      color: #888;
      font-style: italic;
      text-align: center;
      margin-top: 20px;
    }
    .content-text {
      word-wrap: break-word;
      white-space: pre-wrap;
      line-height: 1.5;
    }
    .resize-handle {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 20px;
      height: 20px;
      cursor: nwse-resize;
    }
    .resize-handle::after {
      content: '';
      position: absolute;
      right: 5px;
      bottom: 5px;
      width: 8px;
      height: 8px;
      border-right: 2px solid #aaa;
      border-bottom: 2px solid #aaa;
    }
    .minimized .panel-content,
    .minimized .resize-handle {
      display: none;
    }
    .minimized {
      height: 36px !important;
    }
  `;

    // Create panel elements directly instead of using an iframe
    panelFrame = document.createElement('div');
    panelFrame.className = 'panel-container';
    panelFrame.innerHTML = `
    <div class="panel-header" id="${randPrefix}-drag-handle">
      <div class="panel-title">Notes</div>
      <div class="panel-controls">
        <button class="minimize-btn" title="Minimize">_</button>
        <button class="close-btn" title="Close">×</button>
      </div>
    </div>
    <div class="panel-content">
      <div class="placeholder-text">Select text to display here.</div>
      <div class="content-text" style="display: none;"></div>
    </div>
    <div class="resize-handle"></div>
  `;

    shadow.appendChild(style);
    shadow.appendChild(panelFrame);

    // Set up event listeners for panel controls
    setupPanelControls(shadow);

    // Request initial state without revealing extension nature
    setTimeout(() => {
        chrome.runtime.sendMessage({ action: "getInitialState" }, (response) => {
            if (response && response.isVisible) {
                showPanel();
            }
        });
    }, 500 + Math.random() * 1000); // Random delay to avoid detection patterns
}

// Set up panel controls within shadow DOM
function setupPanelControls(shadow) {
    const dragHandle = shadow.querySelector(`.panel-header`);
    const closeBtn = shadow.querySelector(`.close-btn`);
    const minimizeBtn = shadow.querySelector(`.minimize-btn`);
    const contentArea = shadow.querySelector(`.panel-content`);
    const selectedTextArea = shadow.querySelector(`.content-text`);
    const placeholderText = shadow.querySelector(`.placeholder-text`);
    const resizeHandle = shadow.querySelector(`.resize-handle`);

    // Close button
    closeBtn.addEventListener('click', () => {
        hidePanel();
    });

    // Minimize button
    minimizeBtn.addEventListener('click', () => {
        if (panelFrame.classList.contains('minimized')) {
            panelFrame.classList.remove('minimized');
            minimizeBtn.textContent = '_';
            minimizeBtn.title = 'Minimize';
        } else {
            panelFrame.classList.add('minimized');
            minimizeBtn.textContent = '□';
            minimizeBtn.title = 'Restore';
        }
    });

    // Handle panel dragging
    dragHandle.addEventListener('mousedown', (e) => {
        if (e.target !== closeBtn && e.target !== minimizeBtn) {
            const rect = panelFrame.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            isDragging = true;
            e.preventDefault();
        }
    });

    // Handle resizing
    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        e.preventDefault();
    });
}

// Show the panel
function showPanel() {
    if (!panelFrame) createPanel();
    panelFrame.style.display = 'flex';
    isPanelVisible = true;
    // Use a generic name in the message to avoid detection
    chrome.runtime.sendMessage({ action: "updateState", state: true });
}

// Hide the panel
function hidePanel() {
    if (panelFrame) {
        panelFrame.style.display = 'none';
        isPanelVisible = false;
        // Use a generic name in the message to avoid detection
        chrome.runtime.sendMessage({ action: "updateState", state: false });
    }
}

// Toggle panel visibility
function togglePanel() {
    if (isPanelVisible) {
        hidePanel();
    } else {
        showPanel();
    }
}

// Send selected text to panel
function sendSelectedTextToPanel() {
    // Only run this with some delay to avoid detection patterns
    setTimeout(() => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText && isPanelVisible && panelFrame) {
            const contentText = panelFrame.getRootNode().querySelector('.content-text');
            const placeholder = panelFrame.getRootNode().querySelector('.placeholder-text');

            if (contentText && placeholder) {
                contentText.textContent = selectedText;
                contentText.style.display = 'block';
                placeholder.style.display = 'none';
            }
        }
    }, 100 + Math.random() * 200); // Random delay
}

// Handle mouse events for dragging and resizing
function handleDragAndResize(e) {
    if (!isPanelVisible || !panelFrame) return;

    if (isDragging) {
        const newLeft = Math.max(0, e.clientX - dragOffsetX);
        const newTop = Math.max(0, e.clientY - dragOffsetY);

        // Ensure panel doesn't go off screen
        const maxLeft = window.innerWidth - panelFrame.offsetWidth;
        const maxTop = window.innerHeight - panelFrame.offsetHeight;

        panelFrame.style.left = Math.min(newLeft, maxLeft) + 'px';
        panelFrame.style.top = Math.min(newTop, maxTop) + 'px';
    } else if (isResizing) {
        const rect = panelFrame.getBoundingClientRect();
        const newWidth = Math.max(200, e.clientX - rect.left);
        const newHeight = Math.max(100, e.clientY - rect.top);

        panelFrame.style.width = newWidth + 'px';
        panelFrame.style.height = newHeight + 'px';
    }
}

function stopDragAndResize() {
    isDragging = false;
    isResizing = false;
}

// Set up event listeners in a stealthy way
function setupEventListeners() {
    // Use passive event listeners where possible to avoid detection
    // Store event listeners so we can potentially remove them later
    const eventHandlers = [];

    // Function to add event listeners in a way that's harder to detect
    const addStealthyEventListener = (obj, type, fn, options) => {
        // Add with random timing to avoid detection patterns
        setTimeout(() => {
            obj.addEventListener(type, fn, options);
            eventHandlers.push({obj, type, fn});
        }, Math.random() * 500);
    };

    // Listen for text selection using multiple approaches to be robust
    addStealthyEventListener(document, 'mouseup', sendSelectedTextToPanel, {passive: true});
    addStealthyEventListener(document, 'selectionchange', () => {
        // Only respond to some selection change events to avoid detection
        if (Math.random() > 0.5) {
            sendSelectedTextToPanel();
        }
    }, {passive: true});

    // Listen for panel movement and resizing
    addStealthyEventListener(document, 'mousemove', handleDragAndResize, {passive: true});
    addStealthyEventListener(document, 'mouseup', stopDragAndResize, {passive: true});

    // Use a MutationObserver to detect elements that might be scanning for extensions
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check for potential extension detectors (common techniques)
                    if (node.id && (
                        node.id.includes('extension') ||
                        node.id.includes('detect') ||
                        node.id.includes('check'))) {
                        // Potential extension detector found, temporarily hide our panel
                        if (isPanelVisible) {
                            panelFrame.style.opacity = '0';
                            setTimeout(() => {
                                if (isPanelVisible) panelFrame.style.opacity = '1';
                            }, 2000);
                        }
                    }
                }
            }
        }
    });

    // Start observing with a delay
    setTimeout(() => {
        observer.observe(document.body, { childList: true, subtree: true });
    }, 1000 + Math.random() * 2000);

    // Listen for messages from background script using a more generic approach
    chrome.runtime.onMessage.addListener((message) => {
        // Check for toggle signal without using obvious action names
        if (message.action === "togglePanel" ||
            message.cmd === "toggle" ||
            message.t === 1) {
            togglePanel();
        }
    });
}

// Initialize everything with a random delay to avoid detection patterns
setTimeout(() => {
    createPanel();
    setupEventListeners();

    // Add a decoy function that looks like normal website functionality
    window[`util_${randPrefix}`] = function() {
        // This looks like a harmless utility function
        return document.documentElement.clientWidth;
    };
}, 800 + Math.random() * 1500);

// Fingerprinting protection - override some properties to make it harder to detect
// the extension through fingerprinting
try {
    // Make it harder to detect our extension through chrome.runtime
    const originalGetURL = chrome.runtime.getURL;
    chrome.runtime.getURL = function(path) {
        // Log a fake call to a popular library to create noise
        console.debug("Loading resource:", "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css");
        return originalGetURL(path);
    };

    // Hide our extension from extension enumeration attempts
    if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        const originalSendMessage = chrome.runtime.sendMessage;
        chrome.runtime.sendMessage = function(extensionId, message, options, callback) {
            // Add some randomness to timing to avoid detection
            setTimeout(() => {
                if (typeof extensionId === 'object') {
                    callback = options;
                    options = message;
                    message = extensionId;
                    extensionId = undefined;
                }
                return originalSendMessage.call(chrome.runtime, extensionId, message, options, callback);
            }, Math.random() * 100);
        };
    }
} catch (e) {
    // Silently fail if we can't modify these properties
}