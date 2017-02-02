﻿angular.module('NotSoGrey')
.controller('ColorPickerController', ['$state', 'SharedService', '$window', '$timeout', function ($state, SharedService, $window, $timeout) {
    var self = this;
    self.state = $state;
    self.shared = SharedService;
    self.window = $window;
    self.showElements = false;
    self.animTop = false;
    self.showBadge = false;
    var _actions = [
        //{ id: 1, name: 'close', icon: 'icon-png back', fn: 'app.closeApp()', title: 'Back To Launcher', active: true },
        { id: 2, name: 'accept', icon: 'icon-png accept', fn: 'app.goColorDetails()', title: 'Choose Color Shade', active: true },
    ];
    self.shared.loadActions(_actions, 'ColorPicker');
    self.topnav = { 'isActive1': true, 'isActive2': false, 'isActive3': false };
    self.name = 'Diablo Red';
    console.log(self.shared);
    self.color = self.origColorPrimary = self.shared.activeColor;
    console.log(self.origColorPrimary);
    console.log(self.shared.activeColor);
    self.foreColor = '#fff';
    self.cmyk = { c: 80, m: 33, y: 20, k: 14 };
    self.rgb = { r: 80, g: 10, b: 2 };
    self.hsb = { h: 80, s: 10, b: 2 };
    self.hex = '1ca32d';
    var _cardPanInitAfter = false;
    var _cardPanInitBefore = false;
    var _cardPanInit = false;
    var _cardPanElement = null;
    var _cardPanElementBefore = null;
    var _cardPanElementAfter = null;
    var marginTopBeforePan = 0;
    self.height = 0;
    self.goDetails = function () {
        self.state.go('ColorDetails');
    }
    self.activateShade = function (shade) {
        _.each(self.shades, function (sh) {
            if (sh.id == shade.id)
                sh.active = !sh.active;
            else
                sh.active = false;
            if (sh.active == true)
                self.shared.activeColor = sh.hexCode;
        });
    }

    self.canvas = { id: _.uniqueId('canvasPicker'), top: null, instance: null, ctx: null, instanceBefore: null, instanceAfter: null, ctxBefore: null, ctxAfter: null, leftBefore: -340, leftAfter: 340, colorCurrent: '#fff', colorAfter: '#fff', colorBefore: '#fff' };
    self.canvasIdBefore = _.uniqueId('canvasPicker');
    self.canvasIdCurrent = _.uniqueId('canvasPicker');
    self.canvasIdAfter = _.uniqueId('canvasPicker');

    self.init = function (_color) {
        self.origColorPrimary = _color;
        var _height = self.window.innerHeight;
        var _width = self.window.innerWidth;

        self.canvas.instance = document.getElementById(self.canvasIdCurrent);
        self.canvas.instanceBefore = document.getElementById(self.canvasIdBefore);
        self.canvas.instanceAfter = document.getElementById(self.canvasIdAfter);
        self.canvas.instance.height = self.canvas.instanceBefore.height = self.canvas.instanceAfter.height = _height - 48;
        self.canvas.instance.width = self.canvas.instanceBefore.width = self.canvas.instanceAfter.width = _width;

        self.canvas.ctx = self.canvas.instance.getContext("2d");
        self.canvas.ctxBefore = self.canvas.instanceBefore.getContext("2d");
        self.canvas.ctxAfter = self.canvas.instanceAfter.getContext("2d");

        var _grd = self.canvas.ctx.createLinearGradient(0, 0, 0, self.canvas.instance.height);
        _grd.addColorStop(0, "white");
        self.canvas.colorCurrent = _color;
        _grd.addColorStop(0.5, tinycolor(self.canvas.colorCurrent).toRgbString());
        _grd.addColorStop(1, "black");
        self.canvas.ctx.fillStyle = _grd;
        self.canvas.ctx.fillRect(0, 0, _width, self.canvas.instance.height);

        _grd = self.canvas.ctxBefore.createLinearGradient(0, 0, 0, self.canvas.instanceBefore.height);
        _grd.addColorStop(0, "white");
        self.canvas.colorBefore = self.shared.getPreviousHueHex(_color);
        _grd.addColorStop(0.5, tinycolor(self.canvas.colorBefore).toRgbString());
        _grd.addColorStop(1, "black");
        self.canvas.ctxBefore.fillStyle = _grd;
        self.canvas.ctxBefore.fillRect(0, 0, _width, self.canvas.instanceBefore.height);

        _grd = self.canvas.ctxAfter.createLinearGradient(0, 0, 0, self.canvas.instanceAfter.height);
        _grd.addColorStop(0, "white");
        self.canvas.colorAfter = self.shared.getNextHueHex(_color);
        _grd.addColorStop(0.5, tinycolor(self.canvas.colorAfter).toRgbString());
        _grd.addColorStop(1, "black");
        self.canvas.ctxAfter.fillStyle = _grd;
        self.canvas.ctxAfter.fillRect(0, 0, _width, self.canvas.instanceAfter.height);


        self.canvas.top = self.canvas.instance.height / 2;
        document.getElementById('id_cardPannableContent').style.top = self.canvas.top + 'px';
        self.currenTopPosition = self.canvas.top;
        self.getBadgeColor();
        document.getElementById('id_cardPannableContent').focus();
        if (self.animTop == false) {
            $timeout(function () {
                self.animTop = true;
                if (self.showBadge == false)
                    self.showBadge = true;
            }, 200);
        }
    }

    self.shared.initPicker = self.init;

    self.getBadgeColor = function () {
        var _imgData = document.getElementById(self.canvasIdCurrent).getContext("2d").getImageData(self.canvas.instance.width / 2, self.currenTopPosition, 1, 1).data;
        var _rgb = { r: _imgData[0], g: _imgData[1], b: _imgData[2] };
        self.badgeColor = tinycolor(_rgb).toHexString();
        self.badgeForeColor = self.shared.getForegrundContrastedColor(self.badgeColor);
        self.badgeShadow = '0px 0px 26px 0px' + tinycolor(self.badgeForeColor).setAlpha(.05).toHexString();
        self.shared.activeColor = self.color = self.badgeColor;
    }

    $timeout(function () {
        self.showElements = true;
        if (chrome) {
            chrome.storage.local.get('NSG_COLOR_DATA', function (data) {
                self.shared.activeColor = self.color = tinycolor(data['NSG_COLOR_DATA']).toHexString();                
                $timeout(self.init(self.color));
            });
        }        
    }, 33);

    self.pan = function (e, type) {
        console.log('panstart ' + type, e);
    }

    self.resetColor = function () {
        self.canvas.top = self.canvas.instance.height / 2;
        document.getElementById('id_cardPannableContent').style.top = self.canvas.top + 'px';
        self.currenTopPosition = self.canvas.top;
        self.getBadgeColor();
    }

    self.initializeCardPanElement = function () {
        if (_cardPanInit == false) {
            _cardPanElement = document.getElementById('id_cardPannableContent');
            _cardPanInit == true;
        }
    }

    self.initializeCardPanElementBefore = function () {
        if (_cardPanInitBefore == false) {
            _cardPanElementBefore = document.getElementById(self.canvasIdBefore);
            _cardPanInitBefore == true;
        }
    }

    self.initializeCardPanElementAfter = function () {
        if (_cardPanInitAfter == false) {
            _cardPanElementAfter = document.getElementById(self.canvasIdAfter);
            _cardPanInitAfter == true;
        }
    }

    self.panStart = function (e) {
        self.initializeCardPanElement();
        self.initializeCardPanElementBefore();
        self.initializeCardPanElementAfter();
        self.topBeforePan = (parseInt(_cardPanElement.style.top) || 0);
        self.leftBeforePanForBefore = (parseInt(_cardPanElementBefore.style.left) || 0);
        self.leftBeforePanForAfter = (parseInt(_cardPanElementAfter.style.left) || 0);
    }

    self.panvert = function (e, type) {
        self.initializeCardPanElement();
        var _cardPanElementProps = _cardPanElement.getBoundingClientRect();
        var _cardHolderProps = document.getElementById('id_cardPannableContentHolder').getBoundingClientRect();
        var _newTop = self.topBeforePan + (parseInt(e.deltaY) || 0);
        self.maxTop = _cardHolderProps.height - 40;
        if (_newTop > self.maxTop)
            _newTop = self.maxTop;
        else if (_newTop < 40) {
            _newTop = 40;
        }
        document.getElementById('id_cardPannableContent').style.top = _newTop + 'px';
        self.canvas.top = _newTop;
        self.currenTopPosition = self.canvas.top;
        self.getBadgeColor();
    }

        self.panhorz = function (e, type) {
            if (type == 'right' || (type == 'left' && self.panRightStart == true)) {
                if (self.panRightStart == false) self.panRightStart = true;
                self.initializeCardPanElementBefore();
                var _newLeft = self.leftBeforePanForBefore + (parseInt(e.deltaX) || 0);
                self.canvas.leftBefore = _newLeft;
            }
            else if (type == 'left' || (type == 'right' && self.panLeftStart == true)) {
                if (self.panLeftStart == false) self.panLeftStart = true;
                self.initializeCardPanElementAfter();
                var _newLeft = self.leftBeforePanForAfter + (parseInt(e.deltaX) || 0);
                self.canvas.leftAfter = _newLeft;
            }
        }

        self.panHorzEnd = function (e) {
            var _skipBefore = _skipAfter = false;
            if (self.canvas.leftBefore >= -170) {
                self.init(self.canvas.colorBefore);
                _skipBefore = true;
            }
            if (self.canvas.leftAfter <= 170) {
                self.init(self.canvas.colorAfter);
                _skipAfter = true;
            }
            if (!_skipBefore) document.getElementById(self.canvasIdBefore).className += ' anim';
            if (!_skipAfter) document.getElementById(self.canvasIdAfter).className += ' anim';
            self.canvas.leftBefore = -340;
            self.canvas.leftAfter = 340;
            self.panLeftStart = false;
            self.panRightStart = false;
            $timeout(function () {
                document.getElementById(self.canvasIdBefore).className = document.getElementById(self.canvasIdBefore).className.replace(' anim', '');
                document.getElementById(self.canvasIdAfter).className = document.getElementById(self.canvasIdAfter).className.replace(' anim', '');
            }, 200);
        }

    self.mouseWheelUp = function () {
        self.initializeCardPanElement();
        self.topBeforePan = (parseInt(_cardPanElement.style.top) || 0);
        self.panvert({ 'deltaY': -5 }, 'down');
    }

    self.mouseWheelDown = function () {
        self.initializeCardPanElement();
        self.topBeforePan = (parseInt(_cardPanElement.style.top) || 0);
        self.panvert({ 'deltaY': 5 }, 'up');
    }
    self.swipeLeft = function () {
        //self.color = self.shared.getNextHueHex(self.color);
        //self.shared.activeColor = self.color;
        //self.init();
    }
    self.swipeRight = function () {
        //self.color = self.shared.getPreviousHueHex(self.color);
        //self.shared.activeColor = self.color;
        //self.init();
    }
    self.keyUp = function (e) {
        if (e.keyCode == 38) {
            self.mouseWheelUp();
        }
        else if (e.keyCode == 40) {
            self.mouseWheelDown();
        }
    }
}]);