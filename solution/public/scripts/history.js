
/**
 * if offline, it will only add the story to database,
 * if online, it will also add the story to server.
 * @returns {Promise<void>}
 */
async function addStory() {
    let firstname = document.getElementById('first_name').value;
    let lastname = document.getElementById('last_name').value;
    let storytitle = document.getElementById('story_title').value;
    let description = document.getElementById('description').value;
    let date = new Date(Date.now()).toISOString()
    var data = {
        'first_name': firstname,
        'family_name': lastname,
        'story_title': storytitle,
        'story_description': description,
        'story_image': base64,
        'date': date
    }
    let storyList = JSON.parse(localStorage.getItem('stories'));
    if (storyList==null) storyList=[];
    storyList = removeDuplicates(storyList);
    storyList.push(storytitle);
    localStorage.setItem('stories', JSON.stringify(storyList));
    await storeStoryToCachedData(data.story_title, data)
    // console.log(document.getElementById('offline_div').style.display === 'block')
    if (document.getElementById('offline_div').style.display === 'block') {
        loadData(false);
    } else {
        axios.post('/insertStory', data)
            .then((dataR) => {
                loadData(true)
            })
            .catch(function (response) {
                loadData(false)
            })
    }

    // retrieveAllStoriesData(storyList, true);
    event.preventDefault();
    document.getElementById('story_title').value = '';
    document.getElementById('first_name').value = '';
    document.getElementById('last_name').value = '';
    document.getElementById('description').value = '';
    document.getElementById('formFile').value = '';
    $('#DialogModal').modal('hide');

    // window.location.reload();
}

/**
 * called by the HTML onload
 * showing any cached story data and declaring the service worker
 */
function initHistory() {
    //check for support
    if ('indexedDB' in window) {
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }
    loadData();
}

/**
 * if forceReload is true, load stories from server and store the stories to database
 * if forceReload is false, load stories from database
 * @param forceReload true if the data is to be loaded from the server
 */
function loadData() {
    let roomList = {}
    getAllAnnotation()
        .then((dataR) => {
            let list = dataR
            for (let instance of list) {
                // console.log(instance)
                let room = get_roomId(instance)
                if (!(room in roomList)) {
                    roomList[room] = {
                        'room': room,
                        'user': [get_name(instance)],
                        'story': get_story(instance)
                    }
                } else {
                    let user = get_name(instance)
                    let userList = roomList[room]['user']
                    if (userList.indexOf(user) === -1) {
                        roomList[room]['user'].push(user)
                    }
                }
            }
        })
        .then(async () => {
            console.log(roomList)
            for (let i in roomList) {
                console.log(roomList[i]['story'])
                // let cachedData= await getStoryFromCachedData(roomList[i]['story']);
                // cachedData.then(()=>{})
                // console.log(cachedData)
                await loadStoryData(roomList[i]['story'],  roomList[i]['user'], roomList[i]['room']);
                // console.log(roomList[i])
            }
        })
}

/**
 * given one story_title it queries the indexDB to get the
 * story information
 * @param story_title
 * @param forceReload false if the data is to be retrieved from the database
 */
async function loadStoryData(story_title, userList, roomId){
    let cachedData=await getStoryFromCachedData(story_title);

    // console.log(cachedData);
    if (cachedData && cachedData.length>0) {
        for (let res of cachedData)
            addToStoryList(res, userList, roomId);
    } else {
        console.log('nothing in cached data')
    }
}


///////////////////////// INTERFACE MANAGEMENT ////////////


/**
 * if forceReload is true, using the story data returned by the server,
 * if forceReload is false, using the story data returned by indexDB
 * given the story data,
 * it adds a row of weather forecasts to the story-list div
 * @param dataR the data returned by the server:
  * class Story{
 *  constructor (first_name, family_name, story_title, story_image, story_description, date) {
 *    this.first_name= first_name;
 *    this.family_name= family_name,
 *    this.story_title=story_title;
 *    this.story_image= story_image;
 *    this.story_description= story_description;
 *    this.date= date;
 *  }
 *}
 *
 */
function addToStoryList(dataR, userList, roomId) {
    let cardElement = document.createElement('div');
    document.getElementById('story-list').appendChild(cardElement);
    // appending a new column
    // formatting the row by applying css classes
    cardElement.classList.add('col');
    // the following is far from ideal. we should really create divs using javascript
    // rather than assigning innerHTML
    let _story_title, _first_name, _family_name, _date, _story_description, _story_image;
    _story_title = get_story_title(dataR);
    _first_name = get_first_name(dataR);
    _family_name = get_family_name(dataR);
    _date = get_date(dataR);
    _story_description = get_story_description(dataR);
    _story_image = get_story_image(dataR);

    cardElement.innerHTML = "<div class=\"card h-100\">" +
        "<img class=\"card-img-top\" src='" + _story_image + "' alt=\"Card image\">" +
        "<div class=\"card-body\">" +
        "<h5 class=\"card-title\">" + _story_title + "</h5>" +
        "<h6>By " + _first_name + " " + _family_name + "</h6>" +
        "<p class=\"card-text\">" + _story_description + "</p>" +
        "<p class=\"card-text\">" + "Users who participated: " + userList + "</p>" +
        "<p class=\"card-text\">" + "room ID: " + roomId + "</p>" +
        "<a href='" + '/chat/story/' + _story_title + "' class=\"btn btn-primary\">Discussion</a>" +
        "</div>" +
        "<div class=\"card-footer\">" +
        "<small class=\"text-muted\"> Created At " + _date + "</small>" +
        "</div>" +
        "</div>";
}