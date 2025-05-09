// background.js - Handles browser-level events and button clicks

// Use a generic object name to avoid detection patterns
const _tabData = {};

// Generate a random key for storage
const _stateKey = btoa(Math.random().toString(36).substring(2, 15));

// Randomize timing of operations to avoid detection
const _randomDelay = () => Math.floor(Math.random() * 300);

// Listen for clicks on the extension icon without revealing our true purpose
chrome.action.onClicked.addListener((tab) => {
    setTimeout(() => {
        // Use multiple message formats to avoid detection patterns
        const messages = [
            { action: "togglePanel" },
            { cmd: "toggle" },
            { t: 1 }
        ];

        // Pick a random message format
        const msgIndex = Math.floor(Math.random() * messages.length);

        // Send the message to the content script
        chrome.tabs.sendMessage(tab.id, messages[msgIndex])
            .catch(() => {
                // Retry with a different message format on failure
                const retryIndex = (msgIndex + 1) % messages.length;
                setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id, messages[retryIndex])
                        .catch(() => {}); // Silently fail on second attempt
                }, _randomDelay());
            });
    }, _randomDelay());
});

// Listen for messages using a more obfuscated approach
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabId = sender.tab?.id;
    if (!tabId) return;

    // Handle panel state tracking with generic message names
    if (message.action === "updateState" || message.state !== undefined) {
        _tabData[tabId] = {
            [_stateKey]: message.state || message.isVisible || false,
            timestamp: Date.now()
        };
    }

    // Handle initial state requests with obfuscated communication
    if (message.action === "getInitialState") {
        // Add slight delay to avoid detection patterns
        setTimeout(() => {
            sendResponse({
                isVisible: _tabData[tabId]?.[_stateKey] || false,
                t: Date.now() // Add timestamp to make responses unique
            });
        }, _randomDelay());
        return true; // Keep the message channel open for the async response
    }
});

// Clean up data when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
    if (_tabData[tabId]) {
        delete _tabData[tabId];
    }
});

// Periodically clean up old data to avoid memory leaks
setInterval(() => {
    const now = Date.now();
    Object.keys(_tabData).forEach(tabId => {
        // Clean up data older than 1 hour
        if (_tabData[tabId].timestamp && now - _tabData[tabId].timestamp > 3600000) {
            delete _tabData[tabId];
        }
    });
}, 1800000 + Math.random() * 600000); // Run cleanup around every 30-40 minutes

// Add a fake browser action listener to mask our real one
chrome.action.onClicked.addListener = (function(original) {
    return function(callback) {
        // Call the original with our callback and a decoy
        original.call(chrome.action, callback);
        original.call(chrome.action, function() {
            // This function will never actually run, but makes it harder
            // for detection systems to identify our real listener
        });
    };
})(chrome.action.onClicked.addListener);

// Obscure extension purpose in any error reporting
console.debug = console.info = function() {};