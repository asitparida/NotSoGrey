const electron = require('electron');
const remote = electron.remote;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;
let startWindow;
let cameraWindow;

let readyToQuit = true;
let forceShow = false;
let activeColor;

function createMainWindow(color) {
    activeColor = color || '#0073c6';
    let waSize = electron.screen.getPrimaryDisplay().workAreaSize;
    let posX = waSize.width - 340 - 15;
    let posY = waSize.height - 540 - 15;
    mainWindow = new BrowserWindow({ width: 340, height: 540, x: posX, y: posY, icon: 'images/icon@2x.ico', resizable: false, movable: true, minimizable: false, maximizable: false, alwaysOnTop: true, frame: false, backgroundColor: '#1ca32d', title: 'Not So Grey', show: false });
    mainWindow.activeColor = activeColor;
    mainWindow.loadURL('file://' + __dirname + '/index.html')
    //mainWindow.webContents.openDevTools()
    mainWindow.on('closed', function () {
        if (readyToQuit == true && process.platform !== 'darwin') {
            mainWindow = null;
            app.quit();
        }
    })
    mainWindow.once('ready-to-show', () => {
        readyToQuit = true;
        mainWindow.show()
    })
}

function createCameraWindow() {
    let waSize = electron.screen.getPrimaryDisplay().workAreaSize;
    let posX = waSize.width - 340 - 15;
    let posY = waSize.height - 540 - 15;
    cameraWindow = new BrowserWindow({ width: waSize.width, height: waSize.height, x: 0, y: 0, icon: 'images/icon@2x.ico', resizable: false, movable: true, minimizable: false, maximizable: false, alwaysOnTop: true, frame: false, title: 'Not So Grey', show: false, fullscreen: true });
    cameraWindow.dimensionsWidth = waSize.width;
    cameraWindow.dimensionsHeight = waSize.height;
    cameraWindow.loadURL('file://' + __dirname + '/camera.html')
    //cameraWindow.webContents.openDevTools()
    cameraWindow.on('closed', function () {
        cameraWindow = null;
    });
}

function createStartWindow() {
    let waSize = electron.screen.getPrimaryDisplay().workAreaSize;
    let posX = waSize.width - 120 - 15;
    let posY = waSize.height - 120 - 15;
    startWindow = new BrowserWindow({ width: 120, height: 120, x: posX, y: posY, icon: 'images/icon@2x.ico', resizable: false, movable: true, minimizable: false, maximizable: false, alwaysOnTop: true, frame: false, backgroundColor: '#231f20', title: 'Not So Grey', show: false });
    startWindow.loadURL('file://' + __dirname + '/start.html');
    //startWindow.webContents.openDevTools()
    startWindow.on('closed', function () {
        if (process.platform !== 'darwin') {
            startWindow = null;
            app.quit();
        }
    })
    startWindow.once('ready-to-show', () => {
        readyToQuit = true;
        startWindow.show();
        createCameraWindow();
    })
}

app.on('ready', createStartWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

//app.on('activate', function () {
//    // On OS X it's common to re-create a window in the app when the
//    // dock icon is clicked and there are no other windows open.
//    if (mainWindow === null) {
//        createMainWindow()
//    }
//})

electron.ipcMain.on('capture-desktop-ready', (event, arg) => {
    readyToQuit = true;
    cameraWindow.show();
});

electron.ipcMain.on('start-main-data', (event, arg) => {
    cameraWindow.close();
    cameraWindow = null;
    createMainWindow(arg);
});

electron.ipcMain.on('asynchronous-message', (event, arg) => {
    electron.globalShortcut.register('Shift+G', () => {
        event.sender.send('asynchronous-reply', 'pong');
    });
});

electron.ipcMain.on('asynchronous-unregister', (event, arg) => {
    electron.globalShortcut.unregister('Shift+X');
});

electron.ipcMain.on('start-main', (event, arg) => {
    readyToQuit = false;
    if (!mainWindow || mainWindow == null) {
        //createMainWindow()
        //createCameraWindow()
    }
    else
        mainWindow.show();
    if (startWindow) {
        startWindow.hide();
    }
});

electron.ipcMain.on('start-capture', (event, arg) => {
    cameraWindow.webContents.send('capture-desktop');
});

electron.ipcMain.on('close-main', (event, arg) => {
    readyToQuit = false;
    if (mainWindow) {
        mainWindow.close();
        mainWindow = null;
    }
    if (startWindow === 'undefined' || !startWindow || startWindow == null) {
        createStartWindow();
    }
    else {
        startWindow.show();
        createCameraWindow();
    }
});

electron.ipcMain.on('write-scss', (event, arg) => {
    var _colors = JSON.parse(arg);
    var dialog = electron.dialog;
    var fs = require('fs');
    var _content =
         '$color1: COLOR0_HEX;'
       + '$color2: COLOR1_HEX;'
       + '$color3: COLOR2_HEX;'
       + '$color4: COLOR3_HEX;'
       + '$color5: COLOR4_HEX;'
       + '$color1: COLOR0_RGB;'
       + '$color2: COLOR1_RGB;'
       + '$color3: COLOR2_RGB;'
       + '$color4: COLOR3_RGB;'
       + '$color5: COLOR4_RGB;';
    _colors.forEach(function (elem, index) {
        var _token = 'COLOR' + index + '_HEX';
        _content = _content.replace(_token, elem.hex);
        _token = 'COLOR' + index + '_RGB';
        _content = _content.replace(_token, elem.rgb);
    });
    dialog.showSaveDialog(null, { 'title': 'Save SCSS as', 'filters': [{ name: 'SCSS', extensions: ['scss'] }] }, function (fileName) {
        if (fileName === undefined) {
            console.log("You didn't save the file");
            return;
        }
        fs.writeFile(fileName, _content, function (err) {
            if (err) {
                event.sender.send('write-scss-reply', { 'isSuccess': false, 'msg': 'An error ocurred while saving the file.' });
            }
            event.sender.send('write-scss-reply', { 'isSuccess': true, 'msg': 'The file has been saved as ' + fileName });
        });
    });
});

electron.ipcMain.on('write-png', (event, arg) => {
    var dialog = electron.dialog;
    var fs = require('fs');
    dialog.showSaveDialog(null, { 'title': 'Save PNG as', 'filters': [{ name: 'PNG', extensions: ['png'] }] }, function (fileName) {
        if (fileName === undefined) {
            console.log("You didn't save the file");
            return;
        }
        fs.writeFile(fileName, arg, function (err) {
            if (err) {
                event.sender.send('write-png-reply', { 'isSuccess': false, 'msg': 'An error ocurred while saving the file.' });
            }
            event.sender.send('write-png-reply', { 'isSuccess': true, 'msg': 'The file has been saved as <br />' + fileName });
        });
    });
});

electron.ipcMain.on('write-svg', (event, arg) => {
    var dialog = electron.dialog;
    var fs = require('fs');
    var _content = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="400" viewBox="0 0 400 400"><image id="Rounded_Rectangle_1" data-name="Rounded Rectangle 1" width="400" height="400" xlink:href="CANVAS_SVG"/></svg>';
    _content = _content.replace('CANVAS_SVG', arg);
    dialog.showSaveDialog(null, { 'title': 'Save SVG as', 'filters': [{ name: 'SVG', extensions: ['svg'] }] }, function (fileName) {
        if (fileName === undefined) {
            console.log("You didn't save the file");
            return;
        }
        fs.writeFile(fileName, _content, function (err) {
            if (err) {
                event.sender.send('write-svg-reply', { 'isSuccess': false, 'msg': 'An error ocurred while saving the file.' });
            }
            event.sender.send('write-svg-reply', { 'isSuccess': true, 'msg': 'The file has been saved as <br />' + fileName });
        });
    });
});

electron.ipcMain.on('write-pdf', (event, arg) => {
    var dialog = electron.dialog;
    var fs = require('fs');
    mainWindow.webContents.printToPDF({ 'printBackground': true }, (error, data) => {
        if (error) throw error;
        dialog.showSaveDialog(null, { 'title': 'Save PDF as', 'filters': [{ name: 'PDF', extensions: ['pdf'] }] }, function (fileName) {
            if (fileName === undefined) {
                console.log("You didn't save the file");
                return;
            }
            fs.writeFile(fileName, data, function (err) {
                if (err) {
                    event.sender.send('write-pdf-reply', { 'isSuccess': false, 'msg': 'An error ocurred while saving the file.' });
                }
                event.sender.send('write-pdf-reply', { 'isSuccess': true, 'msg': 'The file has been saved as <br />' + fileName });
            });
        });
    });
});

electron.ipcMain.on('write-ase', (event, arg) => {
    var ase = require('ase-utils');
    var dialog = electron.dialog;
    var fs = require('fs');
    dialog.showSaveDialog(null, { 'title': 'Save ASE as', 'filters': [{ name: 'ASE', extensions: ['ase'] }] }, function (fileName) {
        if (fileName === undefined) {
            console.log("You didn't save the file");
            return;
        }
        fs.writeFile(fileName, ase.encode(arg), function (err) {
            if (err) {
                event.sender.send('write-ase-reply', { 'isSuccess': false, 'msg': 'An error ocurred while saving the file.' });
            }
            event.sender.send('write-ase-reply', { 'isSuccess': true, 'msg': 'The file has been saved as <br />' + fileName });
        });
    });
});

electron.ipcMain.on('get-dribbble', (event, arg) => {
    var Xray = require('x-ray');
    var x = Xray();
    var url = 'https://dribbble.com/colors/' + arg;
    x(url, 'ol.dribbbles li.group .dribbble-img', [{
        href: '.dribbble-link@href',
        img: '.dribbble-link [data-picture] div:nth-child(2)@data-src',
    }])
        (function (err, data) {
            console.log(err);
            if (data)
                event.sender.send('get-dribbble-reply', data);
        });
});

//["https://d13yacurqjgara.cloudfront.net/users/275149/screenshots/2831723/maplooper_1x.png", "https://d13yacurqjgara.cloudfront.net/users/698732/screenshots/2831032/004_1x.png", "https://d13yacurqjgara.cloudfront.net/users/124800/screenshots/2830714/workspace_1x.jpg", "https://d13yacurqjgara.cloudfront.net/users/14224/screenshots/2830043/03_1x.png", "https://d13yacurqjgara.cloudfront.net/users/159078/screenshots/2829616/landing-joined_1x.png", "https://d13yacurqjgara.cloudfront.net/users/159078/screenshots/2829606/signup-joined_1x.png", "https://d13yacurqjgara.cloudfront.net/users/159078/screenshots/2829591/checkout-joined_1x.png", "https://d13yacurqjgara.cloudfront.net/users/361038/screenshots/2829283/400.jpg", "https://d13yacurqjgara.cloudfront.net/users/790168/screenshots/2829055/dk_currency_1x.jpg", "https://d13yacurqjgara.cloudfront.net/users/261966/screenshots/2828771/untitled-1.png", "https://d13yacurqjgara.cloudfront.net/users/970944/screenshots/2827706/dribbble_0-60_1x.gif", "https://d13yacurqjgara.cloudfront.net/users/17255/screenshots/2826939/kaleidoscope_1x.png"]
//"package": "electron-packager . --platform=win32 --arch=x64 --prune --asar --out=releases/alpha --icon=images/icon@2x.ico"