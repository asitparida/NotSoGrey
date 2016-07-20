angular.module('NotSoGrey', [])
.controller('StartController', ['$scope', function (scope) {
    var self = this;
    self.keyboardLaunch = false;
    var electron;
    try {
        electron = require('electron');
    } catch (e) {

    }

    self.launchCanvas = function () {
        electron.ipcRenderer.send('start-capture');
    }

    electron.ipcRenderer.on('stream-ready-for-capture-enabled', (event, arg) => {
        self.canvasActivated = true;
        if (!scope.$$phase)
            scope.$digest();
    });

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