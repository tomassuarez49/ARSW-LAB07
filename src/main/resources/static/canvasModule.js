var canvasModule = (function() {
    var _canvas;
    var _ctx;

    // Inicializa el canvas y los eventos del puntero
    var initializeCanvas = function(canvas) {
        _canvas = document.getElementById(canvas);
        if (!_canvas) {
            console.error("Canvas element not found");
            return;
        }
        _ctx = _canvas.getContext("2d");
        _initPointerEvents();
    };

    // Añadir los eventos del puntero
    var _initPointerEvents = function() {
        if (window.PointerEvent) {
            _canvas.addEventListener("pointerdown", function(event) {
                 _addPointer(event);
            });
        } else {
            // Fallback para navegadores que no soportan PointerEvent
            _canvas.addEventListener("mousedown", function(event) {
                _addPointer(event);
            });
            _canvas.addEventListener("touchstart", function(event) {
                _addPointer(event.touches[0]);
            });
        }
    };

    // Captura la posición del clic/touch y guarda los puntos
    var _addPointer = function(event) {
        var rect = _canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        app.publishPoint(x, y);
        // Agregar punto al plano actual
        drawCanvas(x,y);
    };

    // Dibuja los puntos capturados en el canvas
    var drawCanvas = function(px,py) {
        if (!_canvas || !_ctx) {
            console.error("Canvas or context is not initialized");
            return;
        }
        
        app.addPointToCanvas(new Point(px,py));
    };

    return {
        initializeCanvas: initializeCanvas,
        drawCanvas: drawCanvas, // Exponer la función drawCanvas correctamente
        clearCanvas: function() {
            if (!_canvas) {
                console.error("Canvas is not initialized");
                return;
            }
            _ctx.clearRect(0, 0, _canvas.width, _canvas.height); // Limpiar canvas
        }
    };
})();