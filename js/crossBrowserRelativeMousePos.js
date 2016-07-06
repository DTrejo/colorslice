module.exports = crossBrowserRelativeMousePos;

// MIT license, ©2010 Evan Wallace madebyevan.com
function crossBrowserElementPos(e) {
    e = e || window.event;
    var obj = e.target || e.srcElement;
    var x = 0, y = 0;
    while (obj.offsetParent) {
        x += obj.offsetLeft;
        y += obj.offsetTop;
        obj = obj.offsetParent;
    }
    return { 'x': x, 'y': y };
}

function crossBrowserMousePos(e) {
    e = e || window.event;
    return {
        'x': e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
        'y': e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    };
}

function crossBrowserRelativeMousePos(e) {
    var element = crossBrowserElementPos(e);
    var mouse = crossBrowserMousePos(e);
    return {
        'x': mouse.x - element.x,
        'y': mouse.y - element.y
    };
}
