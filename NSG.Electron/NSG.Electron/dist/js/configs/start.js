angular.module('NotSoGrey', [])
.controller('StartController', [function () {
    var self = this;
    self.launchMain = function () {
        let electron = require('electron');
        //electron.ipcRenderer.send('start-main');
        electron.ipcRenderer.send('start-capture');
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