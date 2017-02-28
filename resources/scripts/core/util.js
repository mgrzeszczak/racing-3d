var loadTextResource = function (url, success, error) {
    var request = new XMLHttpRequest();
    request.open('GET', url + '?please-dont-cache=' + Math.random(), false);
    request.onload = function () {
        if (request.status < 200 || request.status > 299) {
            error(request.status,url);
        } else {
            success(request.responseText);
        }
    };
    request.send();
};

var loadTexture = function(url, callback) {
    var image = new Image();
    image.onload = function () {
        callback(image);
    };
    image.src = url;
};

var loadJSONModel = function(url, success,error){
    loadTextResource(url,function(json){
        var model = JSON.parse(json);
        success(model);
    },error);
};