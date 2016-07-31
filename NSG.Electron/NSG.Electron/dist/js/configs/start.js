angular.module('NotSoGrey', ['ngAnimate'])
.controller('StartController', ['$scope', '$timeout', function (scope, $timeout) {
    var self = this;
    self.keyboardLaunch = false;
    self.showJumpToMain = false;
    var electron;
    try {
        electron = require('electron');
    } catch (e) {

    }

    self.launchCanvas = function () {
        electron.ipcRenderer.send('start-capture');
    }

    electron.ipcRenderer.removeAllListeners(['stream-ready-for-capture-enabled']);
    electron.ipcRenderer.on('stream-ready-for-capture-enabled', (event, arg) => {
        self.canvasActivated = true;
        if (!scope.$$phase)
            scope.$digest();
    });

    electron.ipcRenderer.removeAllListeners(['reset-enable-capture']);
    electron.ipcRenderer.on('reset-enable-capture', (event, arg) => {
        self.canvasActivated = false;
        if (!scope.$$phase)
            scope.$digest();
    });

    electron.ipcRenderer.removeAllListeners(['launch-resized']);
    electron.ipcRenderer.on('launch-resized', (event, arg) => {
        self.showJumpToMain = true;
        if (!scope.$$phase)
            scope.$digest();
    });

    self.mleave = function () {
        self.mouseStillLeaving = true;
        $timeout(function () {
            if (self.mouseStillLeaving == true) {
                self.mouseStillLeaving = false;
                if (self.showJumpToMain) {
                    self.showJumpToMain = false;
                    if (!scope.$$phase)
                        scope.$digest();
                    $timeout(function () {
                        let electron = require('electron');
                        electron.ipcRenderer.send('collapse-launch');
                    }, 500);
                }
            }
        }, 500);
    }

    self.menter = function () {
        self.mouseStillLeaving = false;
    }

    self.expandLaunch = function () {
        let electron = require('electron');
        electron.ipcRenderer.send('expand-launch');
    }

    self.launchMain = function () {
        let electron = require('electron');
        electron.ipcRenderer.send('start-main');
    }

    self.closeAll = function () {
        let electron = require('electron');
        electron.ipcRenderer.send('close-all');
    }

    self.mouseEnter = function () {
        self.showDragger = true;
    }
    self.mouseLeave = function () {
        self.showDragger = false;
    }
    self.enableDrag = false;
    self.startListening = false;
}]);