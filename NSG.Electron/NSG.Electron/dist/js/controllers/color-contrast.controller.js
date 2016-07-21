angular.module('NotSoGrey')
.controller('ColorContrastController', ['$state', 'SharedService', function ($state, SharedService) {
    var self = this;
    self.state = $state;
    self.shared = SharedService;
    var _actions = [
            { id: 1, name: 'color-picker', icon: 'icon-png jumptoMain48 reverse s24', fn: 'app.closeApp()', title: 'Back To Launcher' },
            { id: 2, name: 'color-picker', icon: 'icon-app-logo', fn: 'app.goColorDetails()', title: 'Color Details' },
            { id: 4, name: 'color-contrast', icon: 'icon-app-contrast', fn: 'app.goColorContrast()', active: true, title: 'Color Contrast' },
            { id: 3, name: 'color-theme', icon: 'icon-app-theme', fn: 'app.goThemesPopular()', title: 'Popular Themes' },
            { id: 5, name: 'color-dribbble', icon: 'icon-app-dribbble', fn: 'app.goDribbble()', title: 'Dribbble Shots' }
    ];
    self.shared.loadActions(_actions);
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
    }

    self.goThemePopular = function () {
        self.state.go('ThemesPopular');
    }

}]);