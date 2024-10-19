var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        var canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                
                var theObject = JSON.parse(eventbody.body);

                var x = theObject.x;
                var y = theObject.y;
                
                //alert('Punto recibido:\nX: ' + x + '\nY: ' + y  );
                addPointToCanvas(new Point(x,y));   
            });
        });

    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            //websocket connection
            connectAndSubscribe();
            canvasModule.initializeCanvas("canvas");
        },

        drawPoint: function (px, py) {
            console.info("Dibujando punto en: " + px + " , " + py);
            var pt = new Point(px, py);
            //addPointToCanvas(pt);
            canvasModule.drawCanvas(px,py);
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            //publicar el evento
            //creando un objeto literal
            stompClient.send("/topic/newpoint", {}, JSON.stringify({x:px,y:py}));
            //enviando un objeto creado a partir de una clase
            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt)); 
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };


    

})();