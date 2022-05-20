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
        let who = userId;
        let date = new Date(Date.now()).toISOString()
        let story_title = document.getElementById('story_title').innerText;
        let data = {
            'name': who,
            'roomId': room,
            'story_title': story_title,
            'pixel_pair':[],
            'message': chatText,
            'date': date
        }
        storeCachedData(who, room, data)
        writeOnCommentsHistory('<b>' + who + ':</b> ' + chatText);
    });

}


/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    let chatText = document.getElementById('chat_input').value;
    let story_title = document.getElementById('story_title').innerText;
    let date = new Date(Date.now()).toISOString()
    let data = {
        'name': name,
        'roomId': roomNo,
        'story_title': story_title,
        'pixel_pair':[],
        'message': chatText,
        'date': date
    }
    storeCachedData(name, roomNo, data)
    writeOnCommentsHistory('<b>' + 'Me' + ':</b> ' + chatText);
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
    // console.log(roomNo)
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
            initKG(chat);
        })
        .catch((error)=>{
            // alert('Error: '+error)
            let result = getStoryFromCachedData(story_title);
            let instance = result[0];
            // console.log(result)
            // console.log(instance)
            let title = get_story_title(instance);
            let img_url = get_story_image(instance);
            let description = get_story_description(instance);
            let author = get_family_name(instance) + " " + get_first_name(instance);
            let createTime = get_date(instance);
            initStory(title, author, createTime, img_url, description);
            initCanvas(roomNo, img_url, name);
            initKG(chat);
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
    let title_element = document.getElementById('story_title');
    let img_element = document.getElementById('img');
    let author_element = document.getElementById('story_author');
    let createTime_element = document.getElementById('story_time');
    let description_element = document.getElementById('description');
    title_element.innerText = title;
    img_element.src = img_url;
    author_element.innerText = author;
    description_element.innerText = description;
    createTime_element.innerText = "Created At " + createTime;
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

/**
 * When the client gets off-line, it shows an off line warning to the user
 * so that it is clear that the data is stale
 */
window.addEventListener('offline', function(e) {
    // Queue up events for server.
    console.log("You are offline");
    showOfflineWarning();
    alert('you are offline')
}, false);

/**
 * When the client gets online, it hides the off line warning
 */
window.addEventListener('online', async function(e) {
    // Resync data with server.
    console.log("You are online");
    hideOfflineWarning();
}, false);


function showOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='block';

}

function hideOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='none';
}
