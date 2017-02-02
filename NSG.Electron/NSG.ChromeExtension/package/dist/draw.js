function fnLoadImg(data) {
    var _canvasImg = document.getElementById('nsg_img');    
    _canvasImg.style.width = data.width + 'px';
    _canvasImg.style.height = data.height + 'px';
    document.getElementById('magnify').style.width = data.width + 'px';
    document.getElementById('magnify').style.height = data.height + 'px';
    _canvasImg.setAttribute('src', data.imgData);
    var _canvas = document.getElementById('nsg_canvas');
    _canvas.width = data.width;
    _canvas.height = data.height;
    var ctx = _canvas.getContext('2d')
    var _img = new Image();
    _img.src = data.imgData;
    ctx.drawImage(_img, 0, 0, _canvas.width, _canvas.height);
    document.getElementById('nsg_large').style.backgroundImage = 'url(' + data.imgData + ')';
    setTimeout(function () {
        if (window.innerHeight - _canvasImg.height > 0)
            document.getElementById('magnify').style.marginTop = 0.5 * (window.innerHeight - _canvasImg.height) + 'px';
        _canvasImg.focus();
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
    var _canvasImg = document.getElementById('nsg_img');
    chrome.storage.local.get('NSG_IMG', function (data) {
        fnLoadImg(data['NSG_IMG']);
        document.getElementById('nsg_img').focus();
    });
    var _canvasLarge = document.getElementById('nsg_large');
    _canvasLarge.addEventListener('click', function (evt) {        
        var mousePos = getMousePos(document.getElementById('nsg_img'), evt);
        var _imgData = document.getElementById('nsg_canvas').getContext("2d").getImageData(mousePos.x, mousePos.y, 1, 1).data;
        var _rgb = { r: _imgData[0], g: _imgData[1], b: _imgData[2] };        
        chrome.runtime.sendMessage({ type: 'NSG_COLOR_AVAILABLE', data: _rgb }, function (data) {
            console.log(0);
        })
    }, false);
})