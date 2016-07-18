angular.module('NotSoGrey')
.controller('ThemesPopularController', ['$state', 'SharedService', function ($state, SharedService) {
    var self = this;
    self.state = $state;
    self.shared = SharedService;
    var _actions = [
            { id: 1, name: 'back-72b', icon: 'icon-png back', fn: 'app.goColorDetails()' },
            { id: 2, name: 'add', icon: 'icon-png add', fn: 'app.goThemesCreator()' }
    ];
    self.shared.loadActions(_actions);
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