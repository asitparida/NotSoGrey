angular.module('NotSoGrey')
.controller('ColorDetailsController', ['$state', 'SharedService', function ($state, SharedService) {
    var self = this;
    self.state = $state;
    self.shared = SharedService;

    //LOAD PAGE NAV ACTIONS
    var _actions = [
            { id: 1, name: 'color-picker', icon: 'icon-png jumptoMain48 reverse s24', fn: 'app.closeApp()', title: 'Back To Launcher' },
            { id: 2, name: 'color-picker', icon: 'icon-app-logo', fn: 'app.goColorDetails()', active: true, title: 'Color Details' },
            { id: 4, name: 'color-contrast', icon: 'icon-app-contrast', fn: 'app.goColorContrast()', title: 'Color Contrast' },
            { id: 3, name: 'color-theme', icon: 'icon-app-theme', fn: 'app.goThemesPopular()', title: 'Popular Themes' },
            { id: 5, name: 'color-dribbble', icon: 'icon-app-dribbble', fn: 'app.goDribbble()', title: 'Dribbble Shots' }
    ];
    self.shared.loadActions(_actions);

    // GET COLOR FROM SHARED SERVICE INSTANCE
    self.color = angular.copy(self.shared.activeColor) || '#1ca32d';
    self.activeColor = self.color;
    self.origColor = '#ffffff'
    self.foreColor = self.shared.getForegrundContrastedColor(self.color);
    self.name = 'Forest Green';
    self.activeChange = false;
    self.cmyk = self.shared.getPercentageCMYK(self.color);
    self.rgb = self.shared.getPercentageRGB(self.color);
    self.hsb = self.shared.getPercentageHSB(self.color);
    self.hex = self.shared.getCodeOnlyFromHexCode(self.activeColor);
    self.cmykValueChanged = function (flag) {
        if (flag) {
            self.cmyk.c = parseInt(self.cmyk.c);
            self.cmyk.m = parseInt(self.cmyk.m);
            self.cmyk.y = parseInt(self.cmyk.y);
            self.cmyk.k = parseInt(self.cmyk.k);
        }
        if (self.activeChange == false) {
            self.origColor = self.shared.origColor = self.activeColor;
            self.activeChange = true;
        }
        self.shared.handleChangeInCMYK(self.cmyk, self.activeColor)
            .then(function (data) {
                self.activeColor = data;
                self.foreColor = self.shared.getForegrundContrastedColor(self.activeColor);
                self.rgb = self.shared.getPercentageRGB(self.activeColor);
                self.hsb = self.shared.getPercentageHSB(self.activeColor);
                self.hex = self.shared.getCodeOnlyFromHexCode(self.activeColor);
            });
    }
    self.rgbValueChange = function (flag) {
        if (flag) {
            self.rgb.r = parseInt(self.rgb.r);
            self.rgb.g = parseInt(self.rgb.g);
            self.rgb.b = parseInt(self.rgb.b);
        }
        if (self.activeChange == false) {
            self.origColor = self.shared.origColor = self.activeColor;
            self.activeChange = true;
        }
        self.shared.handleChangeInRGB(self.rgb, self.activeColor)
            .then(function (data) {
                self.activeColor = data;
                self.foreColor = self.shared.getForegrundContrastedColor(self.activeColor);
                self.cmyk = self.shared.getPercentageCMYK(self.activeColor);
                self.hsb = self.shared.getPercentageHSB(self.activeColor);
                self.hex = self.shared.getCodeOnlyFromHexCode(self.activeColor);
            });
    }
    self.hsbValueChange = function (flag) {
        if (flag) {
            self.hsb.h = parseInt(self.hsb.h);
            self.hsb.s = parseInt(self.hsb.s);
            self.hsb.b = parseInt(self.hsb.b);
        }
        if (self.activeChange == false) {
            self.origColor = self.shared.origColor = self.activeColor;
            self.activeChange = true;
        }
        self.shared.handleChangeInHSB(self.hsb, self.activeColor)
            .then(function (data) {
                self.activeColor = data;
                self.foreColor = self.shared.getForegrundContrastedColor(self.activeColor);
                self.cmyk = self.shared.getPercentageCMYK(self.activeColor);
                self.rgb = self.shared.getPercentageRGB(self.activeColor);
                self.hex = self.shared.getCodeOnlyFromHexCode(self.activeColor);
            });
    }
    self.hexValueChanged = function () {
        if (self.activeChange == false) {
            self.origColor = self.shared.origColor = self.activeColor;
            self.activeChange = true;
        }
        self.activeColor = self.shared.getHexFromCode(self.hex);
        self.foreColor = self.shared.getForegrundContrastedColor(self.activeColor);
        self.cmyk = self.shared.getPercentageCMYK(self.activeColor);
        self.rgb = self.shared.getPercentageRGB(self.activeColor);
        self.hsb = self.shared.getPercentageHSB(self.activeColor);
    }
    self.revertToOrig = function (e) {
        if (self.activeChange == true) {
            self.activeColor = self.origColor;
            self.foreColor = self.shared.getForegrundContrastedColor(self.activeColor);
            self.cmyk = self.shared.getPercentageCMYK(self.activeColor);
            self.rgb = self.shared.getPercentageRGB(self.activeColor);
            self.hsb = self.shared.getPercentageHSB(self.activeColor);
            self.hex = self.shared.getCodeOnlyFromHexCode(self.activeColor);
            self.activeChange = false;
        }
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
    }
    self.shared.revertToOrig = self.revertToOrig;
    self.shared.ratifyDetails = function () {
        self.activeChange = false;
        self.shared.activeColor = self.activeColor;
    }
    self.copyCMYK = function () {
        var _str = 'cmyk(CP, MP, YP, KP)';
        _str = _str.replace('CP', self.cmyk.c / 100);
        _str = _str.replace('MP', self.cmyk.m / 100);
        _str = _str.replace('YP', self.cmyk.y / 100);
        _str = _str.replace('KP', self.cmyk.k / 100);
        self.shared.writeToClipboard(_str);
    }
    self.copyRGB = function () {
        var _str = 'rgb(RP, GP, BP)';
        var _color = self.shared.getRGBCodeOnlyFromHexCode(self.activeColor);
        _str = _str.replace('RP', _color.r);
        _str = _str.replace('GP', _color.g);
        _str = _str.replace('BP', _color.b);
        self.shared.writeToClipboard(_str);
    }
    self.copyHSB = function () {
        var _str = 'hsb(HP, SP, BP)';
        var _color = self.shared.getHSVCodeOnlyFromHexCode(self.activeColor);
        _str = _str.replace('HP', _color.h / 100);
        _str = _str.replace('SP', _color.s / 100);
        _str = _str.replace('BP', _color.v / 100);
        self.shared.writeToClipboard(_str);
    }
    self.copyHex = function () {
        self.shared.writeToClipboard(self.activeColor);
    }
}]);