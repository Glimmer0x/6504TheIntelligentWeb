/**
 * this file contains the functions to control the drawing on the canvas
 */
let color = 'red', thickness = 4;

/**
 * it inits the image canvas to draw on. It sets up the events to respond to (click, mouse on, etc.)
 * it is also the place where the data should be sent via socket.io
 * @param {number} roomNo the number of chat room
 * @param {string} name the id of user
 */
function initCanvas(roomNo, name) {
    let flag = false,
        prevX, prevY, currX, currY = 0;
    let canvas = $('#canvas');
    let cvx = document.getElementById('canvas');
    let img = document.getElementById('img');
    let ctx = cvx.getContext('2d');

    // capture the event on the socket when someone else is drawing on their canvas
    chat.on('draw', function (room, name, w, h, px, py, cx, cy, c, t) {
        let date = new Date(Date.now()).toISOString()
        let data = {
            'name': name,
            'roomId': room,
            'pixel_pair': [px, py, cx, cy],
            'canvas': [w, h, c, t],
            'message': '',
            'date': date
        }
        storeCachedData(name, roomNo, data)
        drawOnCanvas(ctx, w, h, px, py, cx, cy, c, t);
    });

    // event on the canvas when the mouse is on it
    canvas.on('mousemove mousedown mouseup mouseout', function (e) {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.position().left - cvx.offsetParent.offsetLeft;
        currY = e.clientY - canvas.position().top -cvx.offsetParent.offsetTop;

        if (e.type === 'mousedown') {
            flag = true;
        }
        if (e.type === 'mouseup' || e.type === 'mouseout') {
            flag = false;
        }
        // if the flag is up, the movement of the mouse draws on the canvas
        if (e.type === 'mousemove') {
            if (flag) {
                let date = new Date(Date.now()).toISOString()
                let data = {
                    'name': name,
                    'roomId': roomNo,
                    'pixel_pair': [prevX, prevY, currX, currY],
                    'canvas': [canvas.width, canvas.height, color, thickness],
                    'message': '',
                    'date': date
                }
                storeCachedData(name, roomNo, data)
                drawOnCanvas(ctx, canvas.width, canvas.height, prevX, prevY, currX, currY, color, thickness);
                // let everyone know via socket.io (socket.emit...)  by sending them
                chat.emit('draw', roomNo, name, canvas.width, canvas.height, prevX, prevY, currX, currY, color, thickness);
            }
        }

    });

    // this is code left in case you need to  provide a button clearing the canvas (it is suggested that you implement it)
    $('#canvas-clear').on('click', function (e) {
        let c_width = canvas.width;
        let c_height = canvas.height;
        ctx.clearRect(0, 0, c_width, c_height);
        console.log("clear trace!");
        drawImageScaled(img, canvas, ctx);

    });
    // set color of pen to red
    $('#red-pen').on('click', function (e) {
        color = 'red';
    });
    // set color of pen to green
    $('#green-pen').on('click', function (e) {
        color = 'green';
    });
    // set color of pen to blue
    $('#blue-pen').on('click', function (e) {
        color = 'blue';
    });


    // this is called when the src of the image is loaded
    // this is an async operation as it may take time
    img.addEventListener('load', () => {
        // it takes time before the image size is computed and made available
        // here we wait until the height is set, then we resize the canvas based on the size of the image
        let poll = setInterval(function () {
            if (img.naturalHeight) {
                clearInterval(poll);
                // resize the canvas
                let ratioX = 1;
                let ratioY = 1;
                // if the screen is smaller than the img size we have to reduce the image to fit
                if (img.clientWidth > window.innerWidth)
                    ratioX = window.innerWidth / img.clientWidth;
                if (img.clientHeight > window.innerHeight)
                    ratioY = img.clientHeight / window.innerHeight;
                let ratio = Math.min(ratioX, ratioY);
                // resize the canvas to fit the screen and the image
                cvx.width = canvas.width = img.clientWidth * ratio;
                cvx.height = canvas.height = img.clientHeight * ratio;
                // draw the image onto the canvas
                drawImageScaled(img, cvx, ctx);
                // hide the image element as it is not needed
                img.style.display = 'none';

                // get cached data
                getCachedData(name, roomNo)
                    .then((dataR) => {
                        // load history annotations
                        let annotationList = dataR;
                        for (let index in dataR) {
                            let annotation = annotationList[index];
                            if (get_message(annotation) !== '' && get_pixel_pair(annotation).length ===0) {
                                let message = get_message(annotation);
                                let who = get_name(annotation);
                                if (who === name) who = 'Me';
                                writeOnChatHistory('<b>' + who + ':</b> ' + message);
                            } else if (get_message(annotation) === '' && get_pixel_pair(annotation).length !==0) {
                                let pixel_pair = get_pixel_pair(annotation)
                                let canvas = get_canvas(annotation)
                                drawOnCanvas(ctx, canvas[0], canvas[1],
                                    pixel_pair[0], pixel_pair[1], pixel_pair[2], pixel_pair[3], canvas[2], canvas[3]);
                            }
                        }
                    })
                    .catch(() => {
                        console.log('get cached data error')
                    })

                getKnowledgeGraphFromCachedData()
                    .then((dataR)=> {
                        let knowledgeList = dataR
                        let borderColor = getRndColor();
                        for (let i of knowledgeList) {
                            putItem(i.id, i.name, i.rc, i.qc, borderColor)
                        }
                    })
                    .then(() => {
                        console.log('get cached knowledge graph error')
                    })
            }
        }, 10);
    });
}

/**
 * called when it is required to draw the image on the canvas. We have resized the canvas to the same image size
 * so ti is simpler to draw later
 * @param {HTMLElement} img image html element in the html page
 * @param canvas the canvas element obtained by jquery
 * @param {HTMLElement} ctx the canvas context
 */
function drawImageScaled(img, canvas, ctx) {
    // get the scale
    let scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    // get the top left position of the image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let x = (canvas.width / 2) - (img.width / 2) * scale;
    let y = (canvas.height / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);


}


/**
 * this is called when we want to display what we (or any other connected via socket.io) draws on the canvas
 * note that as the remote provider can have a different canvas size (e.g. their browser window is larger)
 * we have to know what their canvas size is so to map the coordinates
 * @param {HTMLElement} ctx the canvas context
 * @param {number} canvasWidth the originating canvas width
 * @param {number} canvasHeight the originating canvas height
 * @param {number} prevX the starting X coordinate
 * @param {number} prevY the starting Y coordinate
 * @param {number} currX the ending X coordinate
 * @param {number} currY the ending Y coordinate
 * @param {string} color color of the line
 * @param {number} thickness thickness of the line
 */
function drawOnCanvas(ctx, canvasWidth, canvasHeight, prevX, prevY, currX, currY, color, thickness) {
    //get the ration between the current canvas and the one it has been used to draw on the other comuter
    let ratioX= canvas.width/canvasWidth;
    let ratioY= canvas.height/canvasHeight;
    // update the value of the points to draw
    prevX*=ratioX;
    prevY*=ratioY;
    currX*=ratioX;
    currY*=ratioY;
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.stroke();
    ctx.closePath();
}
