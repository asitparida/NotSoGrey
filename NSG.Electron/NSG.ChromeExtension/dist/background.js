var _NSGCaptureId = '';
var _NSGClientWindowId = null;
var _chromeWindowCreated = false;
var _isWindows = false;

chrome.runtime.getPlatformInfo(function (info) {    
    if (info.os == "win")
        _isWindows = true;
})

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
                    state: 'fullscreen',
                    focused: true
                }, function (data) {
                    _NSGCaptureId = data.id;
                    chrome.windows.update(
                        _NSGCaptureId,
                        {
                            focused: true
                        }, function (data) {
                            chrome.tabs.query({currentWindow: true}, function(data){
                                console.log(data);
                            });
                        });
                });
            })
        }
    })
});

chrome.windows.onFocusChanged.addListener(function (data) {
    if (data != _NSGClientWindowId && _chromeWindowCreated) {
        console.log('CLIENT removed')
        chrome.windows.remove(_NSGClientWindowId, function (data) { })
        _chromeWindowCreated = false;
    }
});

chrome.windows.onRemoved.addListener(function (data) {
    if (data == _NSGClientWindowId && _chromeWindowCreated) {
        _chromeWindowCreated = false;
    }
});

chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
    if (req.type == 'NSG_COLOR_AVAILABLE') {
        chrome.windows.remove(_NSGCaptureId, function () {
            chrome.storage.local.set({ 'NSG_COLOR_DATA': req.data }, function () { });
            if (_chromeWindowCreated) {
                chrome.windows.remove(_NSGClientWindowId, function (data) { })
                _chromeWindowCreated = false;
            }
            if (!_chromeWindowCreated) {
                chrome.windows.create({
                    url: '../index.html',
                    type: 'popup',
                    focused: true,
                    height: 540,
                    width: 340,
                    top: _isWindows != true ? screen.height - 540 - 90 : screen.height - 540 - 60,
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
    else if(req.type == 'NSG_COLOR_AVAILABLE_OPEN_DRIBBBLE'){
        console.log(req.data);
        chrome.tabs.create({ url: 'https://dribbble.com/colors/' + req.data});
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
