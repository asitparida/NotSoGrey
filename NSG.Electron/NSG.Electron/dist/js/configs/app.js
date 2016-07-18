angular.module('NotSoGrey', ['ngAnimate', 'ui.bootstrap', 'ui.router', 'ngMaterial', 'hmTouchEvents', 'anim-in-out', 'ngResource', 'ngSanitize'])
.config(['$stateProvider', '$locationProvider', registerRoutes])
.run(['$state', '$timeout', init]);

function init($state, $timeout) {
    $state.go('ColorPicker');
}

function getViewPath(tag) {
    return 'dist/js/views/' + tag + '.html';
}

function registerRoutes($stateProvider, $locationProvider) {
    $stateProvider
        .state('ColorContrast', {
            url: "/ColorContrast",
            templateUrl: getViewPath('color-contrast')
        })
        .state('ColorPicker', {
            url: "/ColorPicker",
            templateUrl: getViewPath('color-picker')
        })
        .state('ColorDetails', {
            url: "/ColorDetails",
            templateUrl: getViewPath('color-details')
        })
        .state('ColorDetails.View', {
            url: "/View",
            templateUrl: getViewPath('color-details-view')
        })
        .state('ColorDetails.Edit', {
            url: "/Edit",
            templateUrl: getViewPath('color-details-edit')
        })
        .state('ThemesPopular', {
            url: "/ThemesPopular",
            templateUrl: getViewPath('themes-popular')
        })
        .state('ThemesCreator', {
            url: "/ThemesCreator",
            templateUrl: getViewPath('themes-creator')
        })
        .state('DribbbleShots', {
            url: "/DribbbleShots",
            templateUrl: getViewPath('dribbble-shots')
        });
}