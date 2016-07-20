angular.module('NotSoGrey')
.controller('AppController', ["$scope", "$timeout", "$q", "$state", "SharedService", function ($scope, $timeout, $q, $state, SharedService) {
    var self = this;
    self.state = $state;
    self.shared = SharedService;
    self.direction = 'fwd';
    self.name = 'Not So Grey';
    self.hideLoader = false;
    $timeout(function () {
        self.hideLoader = true;
    }, 1000);

    self.actionLaunch = function (fn) {
        console.log(fn);
    }

    self.goColorContrast = function (direction) {
        self.direction = direction || 'fwd';
        self.state.go('ColorContrast');
    }

    self.goColorPicker = function (direction) {
        self.direction = direction || 'fwd';
        self.state.go('ColorPicker');
    }

    self.goColorDetails = function (direction) {
        self.editColor = false;
        self.direction = direction || 'fwd';
        self.state.go('ColorDetails.View');
        var _actions = [
            { id: 1, name: 'color-picker', icon: 'icon-png jumptoMain48 reverse s24', fn: 'app.closeApp()' },
            { id: 2, name: 'color-picker', icon: 'icon-app-logo', fn: 'app.goColorDetails()', active: true },
            { id: 4, name: 'color-contrast', icon: 'icon-app-contrast', fn: 'app.goColorContrast()' },
            { id: 3, name: 'color-theme', icon: 'icon-app-theme', fn: 'app.goThemesPopular()' },
            { id: 5, name: 'color-dribbble', icon: 'icon-app-dribbble', fn: 'app.goDribbble()' }
        ];
        self.shared.loadActions(_actions);
    }

    self.ratifyColorDetails = function () {
        self.editColor = false;
        self.goColorDetails();
        self.shared.ratifyDetails();
    }

    self.goColorEdit = function (direction) {
        self.editColor = true;
        self.direction = direction || 'fwd';
        self.state.go('ColorDetails.Edit');
        var _actions = [
            { id: 3, name: 'accept', icon: 'icon-png accept', fn: 'app.ratifyColorDetails()' },
            { id: 1, name: 'close', icon: 'icon-png reject', fn: 'app.revertDetails()' },
        ];
        self.shared.loadActions(_actions);
    }

    self.revertDetails = function () {
        self.shared.revertToOrig();
        self.goColorDetails();
    }

    self.goThemesPopular = function (direction) {
        self.direction = direction || 'fwd';
        self.state.go('ThemesPopular');
    }

    self.goThemesCreator = function (direction) {
        self.direction = direction || 'fwd';
        self.state.go('ThemesCreator');
    }

    self.closeApp = function () {
        try {
            let electron = require('electron');
            electron.ipcRenderer.send('close-main');
        } catch (e) {
        }
    }

    self.generateThemes = function () {
        self.shared.generateThemes();
    }

    self.createThemeShuffle = function () {
        self.shared.shufflePalette();
    }

    self.goDribbble = function () {
        self.state.go('DribbbleShots');
    }

}])
