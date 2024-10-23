var app = (function () {

    let stompClient = null;
    let canvas;
    let ctx;


    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    // Funciones de dibujo y canvas
    const addPointToCanvas = function (point) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
    };

    const initializeCanvas = function(canvasId) {
        canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error("Canvas element not found");
            return;
        }
        ctx = canvas.getContext("2d");
        initPointerEvents();
    };

    // Eventos del puntero
    const initPointerEvents = function() {
        if (window.PointerEvent) {
            canvas.addEventListener("pointerdown", addPointer);
        } else {
            canvas.addEventListener("mousedown", addPointer);
            canvas.addEventListener("touchstart", (event) => addPointer(event.touches[0]));
        }
    };

    const addPointer = function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        publishPoint(x, y);
    };

    var connectAndSubscribe = function () {
            console.info('Connecting to WS...');
            var socket = new SockJS('/stompendpoint');
            stompClient = Stomp.over(socket);

            var topicId = document.getElementById("topicId").value;
            //subscribe to /topic/TOPICXX when connections succeed
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe('/topic/newpoint.'  + topicId, function (eventbody) {

                    var theObject = JSON.parse(eventbody.body);
                    const point = new Point(theObject.x, theObject.y);
                    addPointToCanvas(point);
                });

                stompClient.subscribe('/topic/newpolygon.' + topicId, function (eventbody) {
                    var newPolygon = JSON.parse(eventbody.body);
                    addPolygonToCanvas(newPolygon);
                });
            });

        };

    // Funciones públicas del módulo
    const publishPoint = function(px, py) {
        const pt = new Point(px, py);
        console.info("publishing point at", pt);
        addPointToCanvas(pt);

        var topicId = document.getElementById("topicId").value;

        if (stompClient !== null) {
            // Enviar el punto al servidor
            stompClient.send("/app/newpoint."  + topicId, {}, JSON.stringify(pt));
        }
    };

    var addPolygonToCanvas = function (polygon) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(polygon[0].x, polygon[0].y);
        for (var i = 1; i < polygon.length; i++) {
            ctx.lineTo(polygon[i].x, polygon[i].y);
        }
        ctx.closePath();
        ctx.stroke();
    };

    return {
        init: function () {
            initializeCanvas("canvas");

            //websocket connection

            var connectBtn = document.getElementById("connectButton");
            connectBtn.addEventListener('click', function () {
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                connectAndSubscribe();
            });
        },

        publishPoint: publishPoint,

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        },

        clearCanvas: function() {
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };
})();