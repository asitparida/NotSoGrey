function fnLoadImg(data) {
    var _canvas = document.getElementById('nsg_cnv');
    _canvas.width = data.width;
    _canvas.height = data.height;
    var ctx = _canvas.getContext('2d')
    var _img = new Image();
    _img.src = data.imgData;
    ctx.drawImage(_img, 0, 0);
    setTimeout(function () {
        _canvas.style.marginTop = 0.5 * (window.innerHeight - _canvas.height) + 'px';
    }, 100);
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('nsg_cnv');
    canvas.addEventListener('click', function (evt) {
        var mousePos = getMousePos(canvas, evt);
        var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
        var _imgData = canvas.getContext("2d").getImageData(mousePos.x, mousePos.y, 1, 1).data;
        var _rgb = { r: _imgData[0], g: _imgData[1], b: _imgData[2] };
        console.log(_rgb);
        chrome.runtime.sendMessage({ type: 'NSG_COLOR_AVAILABLE', data : _rgb }, function (data) {
            console.log(0);
        })
    }, false);
    chrome.storage.local.get('NSG_IMG', function (data) {
        fnLoadImg(data['NSG_IMG']);
    });
})