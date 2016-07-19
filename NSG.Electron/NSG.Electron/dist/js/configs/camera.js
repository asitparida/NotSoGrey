angular.module('NotSoGrey', ['hmTouchEvents'])
.controller('CameraController', ['$timeout', function ($timeout) {
    var self = this;
    self.lastPos = {};
    let electron = require('electron');
    let desktopCapturer = electron.desktopCapturer;
    let _currWindow = electron.remote.getCurrentWindow();
    console.log(_currWindow);
    self.dimensions = { width: _currWindow.dimensionsWidth, height: _currWindow.dimensionsHeight };
    console.log(self.dimensions);
    var video, canvas, cursor;
    $timeout(function () {
        video = document.querySelector('video');
        canvas = document.querySelector('canvas');
        cursor = document.getElementById('nsg_canvas_cursor');
        canvas.addEventListener('click', function (evt) {
            var mousePos = getMousePos(canvas, evt);
            var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
            var _imgData = canvas.getContext("2d").getImageData(mousePos.x, mousePos.y, 1, 1).data;
            var _rgb = { r: _imgData[0], g: _imgData[1], b: _imgData[2] };
            electron.ipcRenderer.send('start-main-data', tinycolor(_rgb).toHexString());
        }, false);
    }, 100);

    electron.ipcRenderer.on('capture-desktop', (event, arg) => {
        desktopCapturer.getSources({
            types: ['screen']
        }, (error, sources) => {
            if (error) throw error;
            console.log(sources);
            for (let i = 0; i < sources.length; ++i) {
                navigator.webkitGetUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'screen',
                            minWidth: self.dimensions.width,
                            maxWidth: self.dimensions.width,
                            minHeight: self.dimensions.height,
                            maxHeight: self.dimensions.height
                        }
                    }
                }, gotStream, getUserMediaError);
                return;
            }
        });
    });

    function gotStream(stream) {
        video.src = URL.createObjectURL(stream);
        let localStream = stream;

        canvas.width = self.dimensions.width;
        canvas.height = self.dimensions.height;
        var ctx = canvas.getContext('2d');
        $timeout(function () {
            ctx.drawImage(video, 0, 0);
            $timeout(function () {
                localStream.getVideoTracks()[0].stop();
                electron.ipcRenderer.send('capture-desktop-ready');
            }, 500);
        }, 200);
    }

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function getUserMediaError(e) {
        console.log(e);
    }

    self.process = function () {
        var _imgData = canvas.getContext("2d").getImageData(self.lastPos.x, self.lastPos.y, 1, 1).data;
        var _rgb = { r: _imgData[0], g: _imgData[1], b: _imgData[2] };
        electron.ipcRenderer.send('start-main-data', tinycolor(_rgb).toHexString());
    }

    self.pan = function (e) {
        if (e.pointerType == 'touch') {
            var cooridnates = e.center;
            cursor.style.left = cooridnates.x + 'px';
            cursor.style.top = cooridnates.y + 'px';
            self.lastPos = cooridnates;
        }
    }

    self.launchMain = function () {
        let electron = require('electron');
        electron.ipcRenderer.send('start-main');
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