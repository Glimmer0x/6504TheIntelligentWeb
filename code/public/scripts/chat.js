let name = null;
let roomNo = null;
let chat= io.connect('/chat');
let news= io.connect('/news');


/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';

    initChatSocket();
    initNewsSocket();
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
        writeOnCommentsHistory('<b>' + who + ':</b> ' + chatText);
    });

}

/**
 * it initialises the socket for /news
 */
function initNewsSocket(){
    news.on('joined', function (room, userId) {
        if (userId !== name) {
            // notifies that someone has joined the room
            writeOnCommentsHistory('<b>'+userId+'</b>' + ' joined news room ' + room);
        }
    });

    // called when some news is received (note: only news received by others are received)
    news.on('news', function (room, userId, newsText) {
        writeOnCommentsHistory('<b>' + userId + ':</b> ' + newsText);
    });
}


/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    let chatText = document.getElementById('chat_input').value;
    chat.emit('chat', roomNo, name, chatText);
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 * It connects both chat and news at the same time
 */
function connectToRoom() {
    roomNo = document.getElementById('roomNo').value;
    name = document.getElementById('name').value;
    if (!name) name = 'Unknown-' + Math.random();
    chat.emit('create or join', roomNo, name);
    news.emit('create or join', roomNo, name);
    data = {'title': roomNo}
    axios.post('/singleStory', data)
        .then((response)=>{
            displayStory(response.data)
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
    let history = document.getElementById('news_history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('news_input').value = '';
}

/**
 * it appends the given html text to the history div
 * @param json: the story to display
 */
function displayStory(instance) {
    let history = document.getElementById('news_history');
    let title = document.createElement('title');
    title.innerHTML = instance.story_title;
    let img = document.createElement('img');
    img.src =instance.story_image;
    let description = document.createElement('p');
    description.innerHTML = instance.story_description;
    history.appendChild(title);
    history.appendChild(img);
    history.appendChild(description);
}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('who_you_are').innerHTML= userId;
    document.getElementById('in_room').innerHTML= ' '+room;
}

