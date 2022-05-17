/**
 * this Event listener is listening for base64 images
 */
var base64;
function encodeImageFileAsURL(element) {
    var file = element.files[0];
    var reader = new FileReader();
    reader.onloadend = function() {
        // console.log('RESULT', reader.result);
        base64 = reader.result;
    }
    reader.readAsDataURL(file);
}

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
    await storeCachedData(data.story_title, data)
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
function initStories() {
    //check for support
    if ('indexedDB' in window) {
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }
    loadData(true);
}

/**
 * if forceReload is true, load stories from server and store the stories to database
 * if forceReload is false, load stories from database
 * @param forceReload true if the data is to be loaded from the server
 */
function loadData(forceReload) {
    refreshStoryList();
    let storyList = JSON.parse(localStorage.getItem('stories'));
    storyList = removeDuplicates(storyList);
    if (forceReload) {
        if (storyList == null) storyList = [];
        axios.get('/allStories')
            .then(async (dataR) => {
                    let stylist = dataR.data
                    for (let index in stylist) {
                        storyList.push(stylist[index].story_title)
                        addToStoryList(stylist[index], forceReload)
                        await storeCachedData(stylist[index].story_title, stylist[index])
                    }
                }
            ).then(() => {
            localStorage.setItem('stories', JSON.stringify(storyList));
            })
            .catch(() => {
                console.log('get all stories error')
            })
    } else {
        for (let index in storyList)
            loadStoryData(storyList[index], forceReload);
    }
}

/**
 * it cycles through the list of stories and requests the data from the server for each
 * story
 * @param storyList the list of the cities the user has requested
 * @param forceReload true if the data is to be retrieved from the server
 */
function retrieveAllStoriesData(storyList, forceReload){
    refreshStoryList();
    if (forceReload) {
        axios.get('/allStories')
            .then((dataR) => {
                let storyList = dataR.data
                for (let index in storyList) {
                    addToStoryList(storyList[index], forceReload)
                    storeCachedData(storyList[index].story_title, storyList[index])
                }
                }
            )
            .catch(()=> {
                console.log('get all stories error')
            })
    } else {
        for (let index in storyList)
            loadStoryData(storyList[index], forceReload);
    }

}

/**
 * given one story_title it queries the indexDB to get the
 * story information
 * @param story_title
 * @param forceReload false if the data is to be retrieved from the database
 */
async function loadStoryData(story_title, forceReload){
    let cachedData=await getCachedData(story_title);

    console.log(cachedData);
    if (!forceReload && cachedData && cachedData.length>0) {
        for (let res of cachedData)
            addToStoryList(res, forceReload);
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
function addToStoryList(dataR, forceReload) {
    let cardElement = document.createElement('div');
    document.getElementById('story-list').appendChild(cardElement);
    // appending a new column
    // formatting the row by applying css classes
    cardElement.classList.add('col');
    // the following is far from ideal. we should really create divs using javascript
    // rather than assigning innerHTML
    let _story_title, _first_name, _family_name, _date, _story_description, _story_image;
    if (!forceReload) {
        _story_title = get_story_title(dataR);
        _first_name = get_first_name(dataR);
        _family_name = get_family_name(dataR);
        _date = get_date(dataR);
        _story_description = get_story_description(dataR);
        _story_image = get_story_image(dataR);
    } else {
        _story_title = dataR.story_title;
        _first_name = dataR.first_name;
        _family_name = dataR.family_name;
        _date = dataR.date;
        _story_description = dataR.story_description;
        _story_image = dataR.story_image;
    }

    cardElement.innerHTML = "<div class=\"card h-100\">" +
        "<img class=\"card-img-top\" src='" + _story_image + "' alt=\"Card image\">" +
        "<div class=\"card-body\">" +
        "<h5 class=\"card-title\">" + _story_title + "</h5>" +
        "<h6>By " + _first_name + " " + _family_name + "</h6>" +
        "<p class=\"card-text\">" + _story_description + "</p>" +
        "<a href='" + '/chat/story/' + _story_title + "' class=\"btn btn-primary\">Discussion</a>" +
        "</div>" +
        "<div class=\"card-footer\">" +
        "<small class=\"text-muted\"> Created At " + _date + "</small>" +
        "</div>" +
        "</div>";
}

/**
 * it removes all stories from the story-list div
 */
function refreshStoryList(){
    if (document.getElementById('story-list')!=null)
        document.getElementById('story-list').innerHTML='';
}

/**
 * When the client gets off-line, it shows an off line warning to the user
 * so that it is clear that the data is stale
 */
window.addEventListener('offline', function(e) {
    // Queue up events for server.
    console.log("You are offline");
    showOfflineWarning();
}, false);

/**
 * When the client gets online, it hides the off line warning
 */
window.addEventListener('online', async function(e) {
    // Resync data with server.
    console.log("You are online");
    hideOfflineWarning();
    // loadData(true)
    let storyList = JSON.parse(localStorage.getItem('stories'));
    storyList = removeDuplicates(storyList);
    let promiseList = []
    for (let i = 0; i < storyList.length; i++) {
        let cachedData=await getCachedData(storyList[i]);
        let data = {
            "story_title": storyList[i],
            'first_name': get_first_name(cachedData[0]),
            'family_name': get_family_name(cachedData[0]),
            'story_description': get_story_description(cachedData[0]),
            'story_image': get_story_image(cachedData[0]),
            'date': get_date(cachedData[0])
        }
        promiseList.push(axios.post('/updateStory', data))
    }
    Promise.all(promiseList)
        .then(()=> {
            loadData(true)
        })
}, false);


function showOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='block';

}

function hideOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='none';
}

/**
 * Given a list of stories, it removes any duplicates
 * @param storyList
 * @returns {Array}
 */
function removeDuplicates(storyList) {
    // remove any duplicate
    var uniqueNames=[];
    $.each(storyList, function(i, el){
        if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    });
    return uniqueNames;
}
