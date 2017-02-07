angular.module('NotSoGrey')
    .controller('AppController', ["$scope", "$timeout", "$q", "SharedService", "$state", function ($scope, $timeout, $q, SharedService, $state) {
        var self = this;
        self.shared = SharedService;
        self.showCurrentColor = false;
        self.direction = 'fwd';
        self.name = 'Not So Grey';
        self.hideLoader = false;
        self.state = $state;
        $timeout(function () {
            self.hideLoader = true;
        }, 1000);

        self.actionLaunch = function (fn) {
            console.log(fn);
        }

        self.shared.activeColorChanged = function (_hex) {
            self.shared.activeColor = _hex;            
            if (self.state.current.name = 'ColorPicker') {
                self.shared.initPicker(self.shared.activeColor);
            }
            if (!$scope.$$phase)
                $scope.$apply();
        }

        self.goColorContrast = function (direction) {
            if (self.state.current.name == 'ColorContrast')
                return;
            self.showCurrentColor = true;
            self.direction = direction || 'fwd';
            self.state.go('ColorContrast');
        }

        self.goColorPicker = function (direction) {
            if (self.state.current.name == 'ColorPicker')
                return;
            self.showCurrentColor = false;
            self.direction = direction || 'fwd';
            self.state.go('ColorPicker');
        }

        self.goColorDetails = function (direction) {            
            if (self.state.current.name == 'ColorDetails.View')
                return;
            self.showCurrentColor = false;
            self.editColor = false;
            self.direction = direction || 'fwd';
            self.state.go('ColorDetails.View');
            var _actions = [
                { id: 1, name: 'color-picker', icon: 'icon-png back', fn: 'app.goColorPicker()', title: 'Back To Launcher' },
                { id: 2, name: 'color-picker', icon: 'icon-app-logo', fn: 'app.goColorDetails()', active: true, title: 'Color Details' },
                { id: 4, name: 'color-contrast', icon: 'icon-app-contrast', fn: 'app.goColorContrast()', title: 'Color Contrast' },
                { id: 3, name: 'color-theme', icon: 'icon-app-theme', fn: 'app.goThemesPopular()', title: 'Popular Themes' },
                { id: 5, name: 'color-dribbble', icon: 'icon-app-dribbble', fn: 'app.goDribbble()', title: 'Dribbble Shots' }
            ];
            self.shared.loadActions(_actions, 'ColorDetails.View');
        }

        self.ratifyColorDetails = function () {
            self.editColor = false;
            self.goColorDetails();
            self.shared.ratifyDetails();
        }

        self.goColorEdit = function (direction) {
            if (self.state.current.name == 'ColorDetails.Edit')
                return;
            self.showCurrentColor = false;
            self.editColor = true;
            self.direction = direction || 'fwd';
            self.state.go('ColorDetails.Edit');
            var _actions = [
                { id: 3, name: 'accept', icon: 'icon-png accept', fn: 'app.ratifyColorDetails()', title: 'Accept Changes', active: true },
                { id: 1, name: 'close', icon: 'icon-png reject', fn: 'app.revertDetails()', title: 'Revert Changes', active: true },
            ];
            self.shared.loadActions(_actions, 'ColorDetails.Edit');
        }

        self.revertDetails = function () {
            self.shared.revertToOrig();
            self.goColorDetails();
        }

        self.goThemesPopular = function () {
            if (self.state.current.name == 'ThemesPopular')
                return;
            self.showCurrentColor = true;
            self.state.go('ThemesPopular');
        }

        self.goThemesCreator = function () {
            if (self.state.current.name == 'ThemesCreator')
                return;
            self.showCurrentColor = true;
            self.state.go('ThemesCreator');
        }

        self.closeApp = function () {
            console.log(chrome.extension);
            try {
                var electron = require('electron');
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
            if (self.state.current.name == 'DribbbleShots')
                return;
            if (navigator.onLine == false) {
                self.shared.notifySave({ 'msg': 'Failed to detect network connectivity!', 'dontBreak': true });
                return;
            }
            self.showCurrentColor = true;
            if (chrome) {
                chrome.runtime.sendMessage({ type: 'NSG_COLOR_AVAILABLE_OPEN_DRIBBBLE', data: tinycolor(self.shared.activeColor).toHex() }, function (data) {
                    console.log(0);
                })
            }
            else self.state.go('DribbbleShots');
        }        

    }])
