angular.module('NotSoGrey')
.controller('DribbbleShotsController', ['$state', 'SharedService', '$timeout', function ($state, SharedService, $timeout) {
    var self = this;
    self.shotsLoading = true;
    self.state = $state;
    self.shared = SharedService;
    var _actions = [
            { id: 1, name: 'color-picker', icon: 'icon-png back', fn: 'app.closeApp()', title: 'Back To Launcher' },
            { id: 2, name: 'color-picker', icon: 'icon-app-logo', fn: 'app.goColorDetails()', title: 'Color Details' },
            { id: 4, name: 'color-contrast', icon: 'icon-app-contrast', fn: 'app.goColorContrast()', title: 'Color Contrast' },
            { id: 3, name: 'color-theme', icon: 'icon-app-theme', fn: 'app.goThemesPopular()', title: 'Popular Themes' },
            { id: 5, name: 'color-dribbble', icon: 'icon-app-dribbble', fn: 'app.goDribbble()', active: true, title: 'Dribbble Shots' }
    ];
    self.shared.loadActions(_actions, 'DribbbleShots');
    self.shotsAvailable = false;
    self.rawData = [];
    self.openShotsPage = function () {
        try {
            require("electron").shell.openExternal('https://dribbble.com/colors/' + tinycolor(self.shared.activeColor).toHex());
        } catch (e) {

        }
    }
    self.openShot = function (shot) {
        try {
            require("electron").shell.openExternal(shot.href);
        } catch (e) {

        }
    }
    $timeout(function () {
        self.shared.getDribbleShots(self.shared.activeColor)
            .then(function (data) {
                self.shotsPage = 'https://dribbble.com/colors/' + tinycolor(self.shared.activeColor).toHex();
                $timeout(function () {
                    self.shotsLoading = false;
                    self.shotsAvailable = true;
                    self.shots = [];
                    _.each(data, function (item) {
                        self.shots.push({ href: item.href, img: item.img });
                    });
                }, 1000);
            });
    }, 500);
}]);