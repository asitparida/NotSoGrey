angular.module('NotSoGrey', ['hmTouchEvents'])
.controller('CameraController', ['$timeout', function ($timeout) {
    var self = this;
    self.lastPos = {};
    let electron = require('electron');
    let desktopCapturer = electron.desktopCapturer;
    let _currWindow = electron.remote.getCurrentWindow();
    self.dimensions = { width: _currWindow.dimensionsWidth, height: _currWindow.dimensionsHeight };
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
        desktopCapturer.getSources({
            types: ['screen']
        }, (error, sources) => {
            if (error) throw error;
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
    }, 200);

    electron.ipcRenderer.on('capture-desktop', (event, arg) => {
        self.stop = true;
        $timeout(function () {
            self.localStream.getVideoTracks()[0].stop();
            electron.ipcRenderer.send('capture-desktop-ready');
        }, 200);
    });

    function gotStream(stream) {
        video.src = URL.createObjectURL(stream);
        self.localStream = stream;
        canvas.width = self.dimensions.width;
        canvas.height = self.dimensions.height;
        var ctx = canvas.getContext('2d');
        self.stop = false;
        self.ct = 0;
        drawToCanvas(ctx, video);
    }

    function drawToCanvas(ctx, video) {
        if (self.stop == false) {
            ctx.drawImage(video, 0, 0);
            setTimeout(drawToCanvas, 20, ctx, video);
            self.ct = self.ct + 1;
            if (!self.init && self.ct >= 50) {
                self.init = true;
                electron.ipcRenderer.send('stream-ready-for-capture');
            }
        }
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

    self.back = function () {
        let electron = require('electron');
        electron.ipcRenderer.send('back-to-start');
    }

    self.skipAhead = function () {
        let electron = require('electron');
        electron.ipcRenderer.send('start-main');
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