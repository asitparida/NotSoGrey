var _NSGCaptureId = '';
var _NSGClientWindowId = null;
var _chromeWindowCreated = false;

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (data) {
        if (data.length > 0) {
            var tab = data[0];
            chrome.tabs.captureVisibleTab(function (img) {
                var _imgData = {
                    width: tab.width,
                    height: tab.height,
                    imgData: img
                };
                chrome.storage.local.set({ 'NSG_IMG': _imgData },
                    function () {
                    });
                chrome.windows.create({
                    url: '../capture.html',
                    state: 'fullscreen'
                }, function (data) {
                    _NSGCaptureId = data.id;
                });
            })
        }
    })
});

chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
    if (req.type == 'NSG_COLOR_AVAILABLE') {
        chrome.windows.remove(_NSGCaptureId, function () {
            chrome.storage.local.set({ 'NSG_COLOR_DATA': req.data }, function () { });
            if (!_chromeWindowCreated) {
                chrome.windows.create({
                    url: '../index.html',
                    type: 'popup',
                    focused: true,
                    height: 540,
                    width: 340,
                    top: screen.height - 540 - 45,
                    left: screen.width - 340 - 30
                }, function (data) {
                    _chromeWindowCreated = true;
                    _NSGClientWindowId = data.id;
                });
            } else {
                chrome.windows.update(
                _NSGClientWindowId,
                {
                    focused: true
                }, function (data) {
                });
            }
        });
    }
});

chrome.windows.onRemoved.addListener(function (windowId) {
    if (windowId == _NSGClientWindowId) {
        _chromeWindowCreated = false;
    }
});

chrome.runtime.onInstalled.addListener(function () {
    console.log('installed');
});

chrome.runtime.onSuspend.addListener(function () {
    // Do some simple clean-up tasks.
});
