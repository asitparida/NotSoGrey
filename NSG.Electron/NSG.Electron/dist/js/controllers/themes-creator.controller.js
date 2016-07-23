angular.module('NotSoGrey')
.controller('ThemesCreatorController', ['$state', 'SharedService', '$timeout', function ($state, SharedService, $timeout) {
    var self = this;
    self.state = $state;
    self.shared = SharedService;
    self.sharePanelShow = false;
    self.toggleSharePanel = function () { self.sharePanelShow = !self.sharePanelShow; }
    self.sharePanelHide = function () {
        self.sharePanelShow = false;
    }
    self.shared.toggleSharePanel = self.toggleSharePanel;
    var _actions = [
       { id: 1, name: 'back-72b', icon: 'icon-png back', fn: 'app.goThemesPopular()', title: 'Back To Popular Themes' },
       { id: 1, name: 'back-72b', icon: 'icon-png shuffle', fn: 'app.createThemeShuffle()', active: false, title: 'Shuffle Palette' },
       { id: 3, name: 'color-SHARE', icon: 'icon-png share', fn: 'app.shared.toggleSharePanel()', title: 'Share / Export Palette' },
    ];
    //self.shared.loadActions(_actions);
    self.themeGeneratorOptions = self.shared.themeGeneratorOptions;
    if (self.shared.preLoadedThemeInEdit != true) {
        self.mode = self.themeGeneratorOptions[1];
        self.colors = self.shared.generateMonochromeColorPaletteForColor(self.shared.activeColor);
    }
    else if (self.shared.preLoadedThemeInEdit == true) {
        self.colors = self.shared.preLoadedTheme;
        self.mode = self.themeGeneratorOptions[0];
    }
    self.foreColor = self.shared.getForegrundContrastedColor(self.colors[0].color);
    self.foreColorIsLight = self.shared.isLight(self.foreColor);
    self.toggle = function (color) {
        _.each(self.colors, function (_color) {
            if (_color.id == color.id)
                _color.locked = !_color.locked;
        });
    }
    self.goPicker = function () {
        self.state.go('ColorPicker');
    }

    self.keyUp = function (e) {
        if (e.keyCode == 32) {
            self.shufflePalette();
        }
    }

    self.shufflePalette = function () {
        self.colors = self.shared.generateColorPalette(self.colors, self.mode);
        self.foreColor = self.shared.getForegrundContrastedColor(self.colors[0].color);
        self.foreColorIsLight = self.shared.isLight(self.foreColor);
    }
    self.shared.shufflePalette = self.shufflePalette;

    self.share = function () {
        console.log('share start');
    }
    self.writeSCSSFile = function () {
        try {
            var _colors = [];
            _.each(self.colors, function (_color) {
                var _tc = tinycolor(_color.color);
                _colors.push({ 'hex': _tc.toHexString(), 'rgb': _tc.toRgbString() });
            });
            let electron = require('electron');
            electron.ipcRenderer.send('write-scss', JSON.stringify(_colors));
            electron.ipcRenderer.on('write-scss-reply', (event, arg) => {
                self.sharePanelShow = false;
                self.shared.notifySave(arg);
            });
        } catch (e) {
            console.log(e);
        }
    }
    self.writePNGFile = function () {
        try {
            var _canvas = self.getCanvasFromColors(self.colors);
            var canvasBuffer = require('electron-canvas-to-buffer');
            var buffer = canvasBuffer(_canvas, 'image/png');
            let electron = require('electron');
            electron.ipcRenderer.send('write-png', buffer);
            electron.ipcRenderer.on('write-png-reply', (event, arg) => {
                self.sharePanelShow = false;
                self.shared.notifySave(arg);
            });
        } catch (e) {
            console.log(e);
        }
    }
    self.writeSVGFile = function () {
        try {
            var _canvas = self.getCanvasFromColors(self.colors);
            let electron = require('electron');
            electron.ipcRenderer.send('write-svg', _canvas.toDataURL());
            electron.ipcRenderer.on('write-svg-reply', (event, arg) => {
                self.sharePanelShow = false;
                self.shared.notifySave(arg);
            });
        } catch (e) {
            console.log(e);
        }
    }
    self.getCanvasFromColors = function (colors) {
        var startX = 0;
        var startY = 0;
        var lengthX = 400;
        var lengthY = 80;
        var canvas = document.createElement('canvas');
        canvas.width = lengthX;
        canvas.height = lengthY * (self.colors.length);
        var context = canvas.getContext('2d');
        _.each(self.colors, function (_color, i) {
            var _tc = tinycolor(_color.color);
            context.fillStyle = _color.color;
            context.fillRect(startX, startY, lengthX, lengthY);
            startX = 0;
            startY = ((i + 1) * lengthY);
        });
        return canvas;
    }
    self.getASESJson = function (_colors) {
        var _json = {
            "version": "1.0",
            "groups": [],
            "colors": []
        };
        _.each(_colors, function (_color) {
            var _tc = tinycolor(_color.color);
            var _tcRGB = _tc.toRgb();
            var _resColor = [];
            _tcRGB.r = Math.round((_tcRGB.r / 255) * 100) / 100;
            _tcRGB.g = Math.round((_tcRGB.g / 255) * 100) / 100;
            _tcRGB.b = Math.round((_tcRGB.b / 255) * 100) / 100;
            _resColor.push(_tcRGB.r);
            _resColor.push(_tcRGB.g);
            _resColor.push(_tcRGB.b);
            var _swColor = {
                "name": "RGB Red",
                "model": "RGB",
                "color": _resColor,
                "type": "global"
            };
            _json.colors.push(_swColor);
        });
        return _json;
    }
    self.writeToPDF = function () {
        try {
            let electron = require('electron');
            electron.ipcRenderer.send('write-pdf');
            electron.ipcRenderer.on('write-pdf-reply', (event, arg) => {
                self.sharePanelShow = false;
                self.shared.notifySave(arg);
            });
        } catch (e) {
            console.log(e);
        }
    }
    self.writeToASE = function () {
        try {
            var _json = self.getASESJson(self.colors);
            let electron = require('electron');
            electron.ipcRenderer.send('write-ase', _json);
            electron.ipcRenderer.on('write-ase-reply', (event, arg) => {
                self.sharePanelShow = false;
                self.shared.notifySave(arg);
            });
        } catch (e) {
            console.log(e);
        }
    }
    self.shared.createdThemeShare = self.share;
    $timeout(function () {
        document.getElementById('_nsg_themesCreator').focus();
    }, 100);
}]);