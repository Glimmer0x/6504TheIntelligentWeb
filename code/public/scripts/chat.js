let name = null;
let roomNo = null;
let chat= io.connect('/chat');



/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    if ('indexedDB' in window) {
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';

    initChatSocket();
}


/**
 * it initialises the socket for /chat
 */

function initChatSocket() {
    // called when someone joins the room. If it is someone else it notifies the joining of the room
    chat.on('joined', function (room, userId) {
        if (userId === name) {
            // it enters the chat
            hideLoginInterface(room, userId);
        } else {
            // notifies that someone has joined the room
            writeOnCommentsHistory('<b>' + userId + '</b>' + ' joined room ' + room);
        }
    });
    // called when a message is received
    chat.on('chat', function (room, userId, chatText) {
        let who = userId
        if (userId === name) who = 'Me';
        else {
            let date = new Date(Date.now()).toISOString()
            let data = {
                'name': who,
                'roomId': room,
                'pixel_pair':[],
                'message': chatText,
                'date': date
            }
            storeCachedData(who, room, data)
        }
        writeOnCommentsHistory('<b>' + who + ':</b> ' + chatText);
    });

}


/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    let chatText = document.getElementById('chat_input').value;
    let date = new Date(Date.now()).toISOString()
    let data = {
        'name': name,
        'roomId': roomNo,
        'pixel_pair':[],
        'message': chatText,
        'date': date
    }
    storeCachedData(name, roomNo, data)
    chat.emit('chat', roomNo, name, chatText);
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 * It connects both chat and news at the same time
 */
function connectToRoom() {
    let story_title = document.getElementById('story_title').innerText;
    roomNo = document.getElementById('roomNo').value;
    name = document.getElementById('name').value;
    if (!name) name = 'Unknown-' + Math.random();
    chat.emit('create or join', roomNo, name);
    let data = {'story_title': story_title}
    console.log(roomNo)
    axios.post('/singleStory', data)
        .then((response) => {
            let instance = response.data
            let title = instance.story_title;
            let img_url = instance.story_image;
            let description = instance.story_description;
            let author = instance.family_name + " " + instance.first_name;
            let createTime = instance.date;
            initStory(title, author, createTime, img_url, description);
            initCanvas(roomNo, img_url, name);
        })
        .catch((error)=>{
            alert('Error: '+error)
        })
}

/**
 * it appends the given html text to the history div
 * @param text: teh text to append
 */
function writeOnCommentsHistory(text) {
    let history = document.getElementById('chat_history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('chat_input').value = '';
}

/**
 * it appends the given html text to the history div
 * @param json: the story to display
 */
function initStory(title,author, createTime, img_url, description) {
    // let history = document.getElementById('news_history');
    let _title = document.getElementById('story_title');
    let _img = document.getElementById('img');
    let _author = document.getElementById('story_author');
    // let _canvas =  document.getElementById('canvas');
    let _createTime = document.getElementById('story_time');
    let _description = document.getElementById('description');
    _title.innerText = title;
    _img.src = img_url;
    _author.innerText = author;
    _description.innerText = description;
    _createTime.innerText = "Created At " + createTime;
    // _canvas.id = "canvas";
    // history.appendChild(_title);
    // history.appendChild(_img);
    // history.appendChild(_canvas);
    // history.appendChild(_description);
}



/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('KG-tool').style.display = 'block';
    document.getElementById('story_panel_container').style.display = 'block';

}

