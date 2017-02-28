app.remoteControl = (function(){

    var socket;

    function connect(host,port,onmessage){
        socket = new WebSocket('ws://'+host+':'+port);
        socket.onmessage = onmessage;
        socket.onopen = function(){
            console.log('Connected @'+host+':'+port);
            socket.send('WEB');
        };
        socket.onerror = function(err){
            console.log(err);
        };
        socket.onclose = function(){
            console.log('Disconnected from '+host);
        };
    }

    return {
        connect : connect
    }

})();