// const input = document.getElementById("formFile");
// const avatar = document.getElementById("avatar");
// const textArea = document.getElementById("textArea");
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

// console.log(getLocalTime(1293072805)); // 2010/12/23 上午10:53
// const convertBase64 = (file) => {
//     return new Promise((resolve, reject) => {
//         const fileReader = new FileReader();
//         fileReader.readAsDataURL(file);
//
//         fileReader.onload = () => {
//             resolve(fileReader.result);
//         };
//
//         fileReader.onerror = (error) => {
//             reject(error);
//         };
//     });
// };
//
// const uploadImage = async (event) => {
//     const file = event.target.files[0];
//     const base64 = await convertBase64(file);
//     avatar.src = base64;
//     textArea.innerText = base64;
// };

// document.getElementById("formFile").addEventListener("change", readFile);

function addStory() {
    if (document.getElementById('author_name')!=null) {
        console.log(document.getElementById('author_name').value)
        console.log(document.getElementById('formFile').value)
    }
    console.log(base64);
    var d = new Date();
    console.log(d.toLocaleString())
}


const CLOUDY = 0;
const CLEAR = 1;
const RAINY = 2;
const OVERCAST = 3;
const SNOWY = 4;


/**
 * called by the HTML onload
 * showing any cached forecast data and declaring the service worker
 */
function initStoryClub() {
    //check for support
    if ('indexedDB' in window) {
        console.log('indexedDB')
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function() { console.log('Service Worker Registered'); });
    }
    loadData(false);
}

/**
 * given the list of cities created by the user, it will retrieve all the data from
 * the server (or failing that) from the database
 * @param forceReload true if the data is to be loaded from the server
 */
function loadData(forceReload){
    var cityList=JSON.parse(localStorage.getItem('cities'));
    cityList=removeDuplicates(cityList);
    retrieveAllCitiesData(cityList, new Date().getTime(), forceReload);
}

/**
 * it cycles through the list of cities and requests the data from the server for each
 * city
 * @param cityList the list of the cities the user has requested
 * @param date the date for the forecasts (not in use)
 * @param forceReload true if the data is to be retrieved from the server
 */
function retrieveAllCitiesData(cityList, date, forceReload){
    refreshCityList();
    for (let index in cityList)
        loadCityData(cityList[index], date, forceReload);
}

/**
 * given one city and a date, it queries the server via Ajax to get the latest
 * weather forecast for that city
 * if the request to the server fails, it shows the data stored in the database
 * @param city
 * @param date
 * @param forceReload true if the data is to be retrieved from the server
 */
async function loadCityData(city, date, forceReload){
    // there is no point in retrieving the data from the db if force reload is true:
    // we should not do the following operation if forceReload is true
    // there is room for improvement in this code
    let cachedData=await getCachedData(city, date);
    if (!forceReload && cachedData && cachedData.length>0) {
        for (let res of cachedData)
            addToResults(res);
    } else {
        const input = JSON.stringify({location: city, date: date});
        $.ajax({
            url: '/weather_data',
            data: input,
            contentType: 'application/json',
            type: 'POST',
            success: function (dataR) {
                // no need to JSON parse the result, as we are using
                // dataType:json, so JQuery knows it and unpacks the
                // object for us before returning it
                addToResults(dataR);
                storeCachedData(dataR.location, dataR);
                if (document.getElementById('offline_div') != null)
                    document.getElementById('offline_div').style.display = 'none';
            },
            // the request to the server has failed. Let's show the cached data
            error: async function (xhr, status, error) {
                showOfflineWarning();
                let cachedData=await getCachedData(city, date);
                if (cachedData && cachedData.length>0)
                    addToResults(cachedData[0]);
                const dvv = document.getElementById('offline_div');
                if (dvv != null)
                    dvv.style.display = 'block';
            }
        });
    }
    // hide the list of cities if currently shown
    if (document.getElementById('city_list')!=null)
        document.getElementById('city_list').style.display = 'none';
}


///////////////////////// INTERFACE MANAGEMENT ////////////


/**
 * given the forecast data returned by the server,
 * it adds a row of weather forecasts to the results div
 * @param dataR the data returned by the server:
 * class WeatherForecast{
 *  constructor (location, date, forecast, temperature, wind, precipitations) {
 *    this.location= location;
 *    this.date= date,
 *    this.forecast=forecast;
 *    this.temperature= temperature;
 *    this.wind= wind;
 *    this.precipitations= precipitations;
 *  }
 *}
 */
function addToResults(dataR) {
    if (document.getElementById('results') != null) {
        const row = document.createElement('div');
        // appending a new row
        document.getElementById('results').appendChild(row);
        // formatting the row by applying css classes
        row.classList.add('card');
        row.classList.add('my_card');
        row.classList.add('bg-faded');
        // the following is far from ideal. we should really create divs using javascript
        // rather than assigning innerHTML
        row.innerHTML = "<div class='card-block'>" +
            "<div class='row'>" +
            "<div class='col-sm'>" + dataR.location + "</div>" +
            "<div class='col-sm'>" + getForecast(dataR.forecast) + "</div>" +
            "<div class='col-sm'>" + getTemperature(dataR) + "</div>" +
            "<div class='col-sm'>" + getPrecipitations(dataR) + "</div>" +
            "<div class='col-sm'>" + getWind(dataR) + "</div>" +
            "<div class='col-sm'></div></div></div>";
    }
}


/**
 * it removes all forecasts from the result div
 */
function refreshCityList(){
    if (document.getElementById('results')!=null)
        document.getElementById('results').innerHTML='';
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
 * it enables selecting the city from the drop down menu
 * it saves the selected city in the database so that it can be retrieved next time
 * @param city
 * @param date
 */
function selectCity(city, date) {
    var cityList=JSON.parse(localStorage.getItem('cities'));
    if (cityList==null) cityList=[];
    cityList.push(city);
    cityList = removeDuplicates(cityList);
    localStorage.setItem('cities', JSON.stringify(cityList));
    retrieveAllCitiesData(cityList, date, true);
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
window.addEventListener('online', function(e) {
    // Resync data with server.
    console.log("You are online");
    hideOfflineWarning();
    loadData(false);
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
 * it shows the city list in the browser
 */
function showCityList() {
    if (document.getElementById('city_list')!=null)
        document.getElementById('city_list').style.display = 'block';
}



/**
 * Given a list of cities, it removes any duplicates
 * @param cityList
 * @returns {Array}
 */
function removeDuplicates(cityList) {
    // remove any duplicate
    var uniqueNames=[];
    $.each(cityList, function(i, el){
        if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    });
    return uniqueNames;
}
