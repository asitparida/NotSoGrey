angular.module('NotSoGrey')
.controller('ColorContrastController', ['$state', 'SharedService', function ($state, SharedService) {
    var self = this;
    self.state = $state;
    self.shared = SharedService;
    var _actions = [
            { id: 1, name: 'color-picker', icon: 'icon-png back', fn: 'app.closeApp()', title: 'Back To Launcher' },
            { id: 2, name: 'color-picker', icon: 'icon-app-logo', fn: 'app.goColorDetails()', title: 'Color Details' },
            { id: 4, name: 'color-contrast', icon: 'icon-app-contrast', fn: 'app.goColorContrast()', active: true, title: 'Color Contrast' },
            { id: 3, name: 'color-theme', icon: 'icon-app-theme', fn: 'app.goThemesPopular()', title: 'Popular Themes' },
            { id: 5, name: 'color-dribbble', icon: 'icon-app-dribbble', fn: 'app.goDribbble()', title: 'Dribbble Shots' }
    ];
    self.shared.loadActions(_actions, 'ColorContrast');
    self.colorContrastModes = self.shared.colorContrastModes;
    self.mode = self.colorContrastModes[0];
    self.color1 = self.shared.activeColor;
    self.backcolor1 = self.color1;
    self.color2 = self.shared.getForegrundContrastedColor(self.shared.activeColor);
    self.backcolor2 = self.color2;
    self.ratio = self.shared.getContrastRatio(self.color1, self.color2);
    self.color1IsLight = self.shared.isLight(self.color1);
    self.color2IsLight = self.shared.isLight(self.color2);
    self.colorChanged = function () {
        self.color1IsLight = self.shared.isLight(self.color1);
        self.color2IsLight = self.shared.isLight(self.color2);
        var color1Ratified = self.color1;
        var color2Ratified = self.color2;
        if (self.mode.key != 'normal') {
            color1Ratified = self.shared.correctForBlindness(color1Ratified, self.mode);
            color2Ratified = self.shared.correctForBlindness(color2Ratified, self.mode);
        }
        self.backcolor1 = tinycolor(color1Ratified).toHexString();
        self.backcolor2 = tinycolor(color2Ratified).toHexString();
        self.ratio = self.shared.getContrastRatio(color1Ratified, color2Ratified);

        if (self.color1FocussedFlag) {
            self.color1Fore = self.shared.isLight(self.backcolor1) ? '#000' : '#fff';
            self.color2Fore = self.backcolor1;
        }

        if (self.color2FocussedFlag) {
            self.color2Fore = self.shared.isLight(self.backcolor2) ? '#000' : '#fff';
            self.color1Fore = self.backcolor2;
        }
    }

    self.color1Fore = self.backcolor2;
    self.color2Fore = self.backcolor1;
    self.color2FocussedFlag = self.color1FocussedFlag = false;
    self.color1Focussed = function () {
        self.color1Fore = self.shared.isLight(self.backcolor1) ? '#000' : '#fff';
        self.color1FocussedFlag = true;
    }
    self.color1Blurred = function () {
        self.color1Fore = self.backcolor2;
        self.color1FocussedFlag = false;
    }
    self.color2Focussed = function () {
        self.color2Fore = self.shared.isLight(self.backcolor2) ? '#000' : '#fff';
        self.color2FocussedFlag = true;
    }
    self.color2Blurred = function () {
        self.color2Fore = self.backcolor1;
        self.color2FocussedFlag = false;
    }

    self.resetColor1 = function () {
        self.color1 = self.shared.activeColor;
        self.backcolor1 = self.color1;
        self.ratio = self.shared.getContrastRatio(self.color1, self.color2);
        self.color1IsLight = self.shared.isLight(self.color1);
    }

    self.resetColor2 = function () {
        self.color2 = self.shared.getForegrundContrastedColor(self.shared.activeColor);
        self.backcolor2 = self.color2;
        self.ratio = self.shared.getContrastRatio(self.color1, self.color2);
        self.color2IsLight = self.shared.isLight(self.color2);
    }

    self.goThemePopular = function () {
        self.state.go('ThemesPopular');
    }

}]);