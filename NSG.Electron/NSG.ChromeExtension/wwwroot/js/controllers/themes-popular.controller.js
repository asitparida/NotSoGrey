angular.module('NotSoGrey')
.controller('ThemesPopularController', ['$state', 'SharedService', function ($state, SharedService) {
    var self = this;
    self.state = $state;
    self.shared = SharedService;
    var _actions = [
            { id: 1, name: 'color-picker', icon: 'icon-png back', fn: 'app.goColorPicker()', title: 'Back To Launcher' },
            { id: 2, name: 'color-picker', icon: 'icon-app-logo', fn: 'app.goColorDetails()', title: 'Color Details' },
            { id: 4, name: 'color-contrast', icon: 'icon-app-contrast', fn: 'app.goColorContrast()', title: 'Color Contrast' },
            { id: 3, name: 'color-theme', icon: 'icon-app-theme', fn: 'app.goThemesPopular()', title: 'Popular Themes', active: true},
            { id: 5, name: 'color-dribbble', icon: 'icon-app-dribbble', fn: 'app.goDribbble()', title: 'Dribbble Shots' }
    ];
    self.shared.loadActions(_actions, 'ThemesPopular');
    self.themes = [];
    self.shared.generateThemes()
        .then(function (data) {
            self.themes = data;
        });

    self.openInEditor = function (theme) {
        self.shared.preLoadedThemeInEdit = true;
        self.shared.preLoadedTheme = self.shared.processComboForTheme(theme);
        self.state.go('ThemesCreator');
    }

    self.goPicker = function () {
        self.state.go('ColorPicker');
    }

    self.goThemeCreator = function () {
        self.state.go('ThemesCreator');
    }

    self.unregister = function () {
        electron.ipcRenderer.send('asynchronous-unregister', 'ping');
    }

}]);