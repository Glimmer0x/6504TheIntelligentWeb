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

function sendAxiosQuery(url, data) {
    axios.post(url, data)
        .then((dataR) => {// no need to JSON parse the result, as we are using
            // we need to JSON stringify the object
            console.log(dataR)
            // alert(dataR.data)
            // document.getElementById('results').innerHTML = JSON.stringify(dataR.data);
        })
        .catch(function (response) {
            console.log('www')
            console.log(response)
            // alert(response.toJSON());
        })
}

function formatDateT(dataTime) {
    var timestamp = dataTime;
    var newDate = new Date(dataTime)
    return newDate.toISOString()
}

async function addStory() {
    // console.log(document.getElementById('offline_div').style.display === 'block')
    let firstname = document.getElementById('first_name').value;
    let lastname = document.getElementById('last_name').value;
    let storytitle = document.getElementById('story_title').value;
    let description = document.getElementById('description').value;
    var data = {
        'first_name': firstname,
        'family_name': lastname,
        'story_title': storytitle,
        'story_description': description,
        'story_image': base64,
        'date': Date.now()
    }
    let storyList = JSON.parse(localStorage.getItem('stories'));
    if (storyList==null) storyList=[];
    storyList.push(storytitle);
    storyList = removeDuplicates(storyList);
    localStorage.setItem('stories', JSON.stringify(storyList));
    console.log(document.getElementById('offline_div').style.display === 'block')
    if (document.getElementById('offline_div').style.display === 'block') {
        data.date = formatDateT(data.date)
        console.log(data.date)
        console.log(data)
        await storeCachedData(data.story_title, data)
        addToStoryList(data, false)
        loadData(false);
    } else {
        axios.post('/insertStory', data)
            .then((dataR) => {
                console.log(dataR)
                loadData(true)
            })
            .catch(function (response) {
                storeCachedData(data.story_title, data)
                addToStoryList(data, false)
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
    loadData(false);
}

/**
 * given the list of stories created by the user, it will retrieve all the data from
 * the server (or failing that) from the database
 * @param forceReload true if the data is to be loaded from the server
 */
function loadData(forceReload){
    let storyList = JSON.parse(localStorage.getItem('stories'));
    console.log(storyList)
    storyList=removeDuplicates(storyList);
    if (storyList.length !== 0) {
        retrieveAllStoriesData(storyList, forceReload);
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
    // console.log(storyList)
    for (let index in storyList)
        loadStoryData(storyList[index], forceReload);
}

/**
 * given one story_title it queries the server via Ajax to get the latest
 * story information for that city
 * if the request to the server fails, it shows the data stored in the database
 * @param story_title
 * @param forceReload true if the data is to be retrieved from the server
 */
async function loadStoryData(story_title, forceReload){
    // there is no point in retrieving the data from the db if force reload is true:
    // we should not do the following operation if forceReload is true
    // there is room for improvement in this code
    let cachedData=await getCachedData(story_title);
    // console.log(cachedData);
    if (!forceReload && cachedData && cachedData.length>0) {
        for (let res of cachedData)
            addToStoryList(res, forceReload);
    } else {
        axios.post('/singleStory', {
            "story_title": story_title
        })
            .then((dataR) => {
                let data = dataR.data
                addToStoryList(data, forceReload);
                storeCachedData(data.story_title, data);
                if (document.getElementById('offline_div') != null)
                    document.getElementById('offline_div').style.display = 'none';
            })
            .catch(function (response) {
                console.log('bad response ssssssss')
                showOfflineWarning();
                getCachedData(story_title);
                const dvv = document.getElementById('offline_div');
                if (dvv != null)
                    dvv.style.display = 'block';
            });
    }
}


///////////////////////// INTERFACE MANAGEMENT ////////////


/**
 * if forceReload is true, using the story data returned by the server,
 * if forceReload is false, using the story data returned by indexdb
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
    const row = document.createElement('div');
    // appending a new row
    document.getElementById('story-list').appendChild(row);
    // formatting the row by applying css classes
    row.classList.add('card');
    // the following is far from ideal. we should really create divs using javascript
    // rather than assigning innerHTML
    if (!forceReload) {
        row.innerHTML = "<div className=\"card\" style=\"width:400px\">" +
            "<div className=\"card-body\">" +
            "<h4 className=\"card-title\">" + get_story_title(dataR) + "</h4>" +
            "<h5>by " + get_first_name(dataR) + " " + get_family_name(dataR) + " on " + get_date(dataR) + "</h5>" +
            "<p className=\"card-text\">" + get_story_description(dataR) + "</p>" +
            "<a href='" + '/chat' + "' className=\"btn btn-primary\">Chat</a>" +
            "</div>" +
            "<img className=\"card-img-bottom\" src='" + get_story_image(dataR) + "' alt=\"Card image\" style=\"width:100%\">" +
            "</div>"
    } else {
        row.innerHTML = "<div className=\"card\" style=\"width:400px\">" +
            "<div className=\"card-body\">" +
            "<h4 className=\"card-title\">" + dataR.story_title + "</h4>" +
            "<h5>by " + dataR.first_name + " " + dataR.family_name + " on " + dataR.date + "</h5>" +
            "<p className=\"card-text\">" + dataR.story_description + "</p>" +
            "<a href='" + '/chat' + "' className=\"btn btn-primary\">Chat</a>" +
            "</div>" +
            "<img className=\"card-img-bottom\" src='" + dataR.story_image + "' alt=\"Card image\" style=\"width:100%\">" +
            "</div>"
    }
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
    // hideOffRefreshButton();
    // loadData(false);
}, false);

/**
 * When the client gets online, it hides the off line warning
 */
window.addEventListener('online', async function(e) {
    // Resync data with server.
    console.log("You are online");
    hideOfflineWarning();
    let storyList = JSON.parse(localStorage.getItem('stories'));
    console.log(storyList)
    for (let i = 0; i < storyList.length; i++) {
        let cachedData=await getCachedData(storyList[i]);
        console.log(cachedData)
        let data = {
            "story_title": storyList[i],
            'first_name': cachedData[0].first_name,
            'family_name': cachedData[0].family_name,
            'story_description': cachedData[0].story_description,
            'story_image': cachedData[0].story_image,
            'date': cachedData[0].date
        }
        console.log(storyList[i])
        console.log(data)
        axios.post('/updateStory', data)
            .then((dataR) => {
                console.log(dataR)
                console.log(storyList[i] + 'update')
            })
            .catch((res) => {
                console.log(res)
            })
    }
}, false);


function showOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='block';

}

function hideOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='none';
}

function hideOffRefreshButton() {
    if (document.getElementById('swap_button')!=null)
        document.getElementById('swap_button').style.display='none';
}

function showRefreshButton() {
    if (document.getElementById('swap_button')!=null)
        document.getElementById('swap_button').style.display='block';
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
