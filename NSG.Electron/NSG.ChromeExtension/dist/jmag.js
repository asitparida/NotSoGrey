$(document).ready(function () {

    var original_width = 0;
    var original_height = 0;
    var timeoutId;
    var _originalWhiteShadow = '0 0 0 7px rgba(255, 255, 255, 0.85), 0 0 7px 7px rgba(0, 0, 0, 0.25), inset 0 0 40px 2px rgba(0, 0, 0, 0.25)';
    var _shadowerElm = document.getElementById('nsg_large');
    var _shadowCanvasElm = document.getElementById('nsg_canvas');
    $('magnify').mouseleave(function (e) {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = null;
            if (_shadowerElm)
                _shadowerElm.style.boxShadow = _originalWhiteShadow;
        }
    });
    function _listenToMouse(e) {
        timeoutId = window.setTimeout(function () {
            timeoutId = null;
            var mousePos = getMousePos(document.getElementById('nsg_img'), e);
            if (_shadowCanvasElm) {
                var _imgData = _shadowCanvasElm.getContext("2d").getImageData(mousePos.x, mousePos.y, 1, 1).data;
                var _rgb = { r: _imgData[0], g: _imgData[1], b: _imgData[2] };
                if (_shadowerElm)
                    _shadowerElm.style.boxShadow = '0 0 0 7px ' + 'rgba(' + _rgb.r + ', ' + _rgb.g + ', ' + _rgb.b + ', 1)' + ', 0 0 7px 7px rgba(0, 0, 0, 0.25), inset 0 0 40px 2px rgba(0, 0, 0, 0.25)';
            }
        }, 500);
    }
    $(".magnify").mousemove(function (e) {
        if (!timeoutId) {
            _listenToMouse(e);
        }
        else {
            window.clearTimeout(timeoutId);
            timeoutId = null;
            document.getElementById('nsg_large').style.boxShadow = _originalWhiteShadow;
            _listenToMouse(e);
        }
        if (!original_width && !original_height) {
            var image_obj = new Image();
            image_obj.src = $("#nsg_img").attr("src");
            original_width = image_obj.width;
            original_height = image_obj.height;
            $("#col1").html("orig width=" + original_width + "<br>" + "orig height=" + original_height);
        }
        else {
            var magnify_offset = $(this).offset();
            var mx = e.pageX - magnify_offset.left;
            var my = e.pageY - magnify_offset.top;
            $("#col2").html("pagex=" + e.pageX + "<br>" + "pageY=" + e.pageY);
            $("#col3").html("offset_L=" + magnify_offset.left + "<br>" + "offset_T=" + magnify_offset.top);
            $("#col4").html("mx=" + mx + "<br>" + "my=" + my);
            if (mx < $(this).width() && my < $(this).height() && mx > 0 && my > 0) {
                $(".large").fadeIn(100);
            }
            else {
                $(".large").fadeOut(100);
            }
            if ($(".large").is(":visible")) {
                //The background position of .large will be changed according to the position
                //of the mouse over the .small image. So we will get the ratio of the pixel
                //under the mouse pointer with respect to the image and use that to position the 
                //large image inside the magnifying glass
                var rx = Math.round(mx / $("#nsg_img").width() * original_width - $(".large").width() / 2) * -1;
                var ry = Math.round(my / $("#nsg_img").height() * original_height - $(".large").height() / 2) * -1;
                var bgp = rx + "px " + ry + "px";

                //Time to move the magnifying glass with the mouse
                var px = mx - $(".large").width() / 2;
                var py = my - $(".large").height() / 2;
                //Now the glass moves with the mouse
                //The logic is to deduct half of the glass's width and height from the 
                //mouse coordinates to place it with its center at the mouse coordinates

                //If you hover on the image now, you should see the magnifying glass in action
                $(".large").css({ left: px, top: py, backgroundPosition: bgp });
            }
        }
    })


})
