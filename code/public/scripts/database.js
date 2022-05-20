////////////////// DATABASE //////////////////
// the database receives from the server the following structure
import * as idb from './idb/index.js';


/** using a data model:
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
 */
let db;

const STORY_DB_NAME= 'db_story';
const STORY_STORE_NAME= 'store_story';

/**
 * it inits the database
 */
async function initDatabase(){
    if (!db) {
        db = await idb.openDB(STORY_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(STORY_STORE_NAME)) {
                    let storyDB = upgradeDb.createObjectStore(STORY_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    storyDB.createIndex('story_title', 'story_title', {unique: false, multiEntry: true});
                }
            }
        });
        // console.log('db created');
    }
}
window.initDatabase= initDatabase;

/**
 * it saves the stories in localStorage
 * @param {string} story_title title of a story
 * @param {object} storyObject a story object
 */
async function storeCachedData(story_title, storyObject) {
    // console.log('inserting: '+JSON.stringify(storyObject));
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let result = await getCachedData(story_title)
            let arr = Object.keys(result)
            if (arr.length !== 0) {
            } else {
                let tx = await db.transaction(STORY_STORE_NAME, 'readwrite');
                let store = await tx.objectStore(STORY_STORE_NAME);
                await store.put(storyObject);
                await  tx.complete;
                console.log('add ' + story_title + ' to the IndexDB! ');
            }

        } catch(error) {
            localStorage.setItem(story_title, JSON.stringify(storyObject));
        };
    }
    else localStorage.setItem(story_title, JSON.stringify(storyObject));
}

window.storeCachedData=storeCachedData;

/**
 * it retrieves the story for a story_title from the database
 * @param {string} story_title title of a story
 * @return {array} list of stories
 */
async function getCachedData(story_title) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            // console.log('fetching: ' + story_title);
            let tx = await db.transaction(STORY_STORE_NAME, 'readonly');
            let store = await tx.objectStore(STORY_STORE_NAME);
            let index = await store.index('story_title');
            let readingsList = await index.getAll(IDBKeyRange.only(story_title));
            await tx.complete;
            let finalResults=[];
            if (readingsList && readingsList.length > 0) {
                let max;
                for (let elem of readingsList)
                    if (!max || elem.date > max.date)
                        max = elem;
                if (max)
                    finalResults.push(max);
                return finalResults;
            } else {
                const value = localStorage.getItem(story_title);
                if (value == null)
                    return finalResults;
                else finalResults.push(value);
                return finalResults;
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        const value = localStorage.getItem(story_title);
        let finalResults=[];
        if (value == null)
            return finalResults;
        else finalResults.push(value);
        return finalResults;
    }
}
window.getCachedData= getCachedData;


/**
 * given the server data, it returns the value of the field first_name
 * @param {object} dataR the story object returned by the server
 * @returns {string} first name of the author
 */
function get_first_name(dataR) {
    if (dataR.first_name == null && dataR.first_name === undefined)
        return "unavailable";
    return dataR.first_name
}
window.get_first_name=get_first_name;

/**
 * given the server data, it returns the value of the field family_name
 * @param {object} dataR the story object returned by the server
 * @returns {string} family name of the author
 */
function get_family_name(dataR) {
    if (dataR.family_name == null && dataR.family_name === undefined)
        return "unavailable";
    else return dataR.family_name;
}
window.get_family_name=get_family_name;

/**
 * given the server data, it returns the value of the field story_title
 * @param {object} dataR the story object returned by the server
 * @returns {string} title of the story
 */
function get_story_title(dataR) {
    if (dataR.story_title == null && dataR.story_title === undefined)
        return "unavailable";
    else return dataR.story_title;
}
window.get_story_title=get_story_title;


/**
 * given the server data, it returns the value of the field date
 * @param {object} dataR the story object returned by the server
 * @returns {string} return 'unavailable' if dataR is null else
 * return the date of the story
 */
function get_date(dataR) {
    if (dataR.date == null && dataR.date === undefined)
        return "unavailable";
    else return dataR.date;
}
window.get_date=get_date;

/**
 * given the server data, it returns the value of the field image
 * @param {object} dataR the story object returned by the server
 * @returns {string} image data coded in base64
 */
function get_story_image(dataR) {
    if (dataR.story_title == null && dataR.story_title === undefined)
        return "unavailable";
    else return dataR.story_image;
}
window.get_story_image=get_story_image;

/**
 * given the server data, it returns the value of the field description
 * @param {object} dataR the story object returned by the server
 * @returns {string} description of the story
 */
function get_story_description(dataR) {
    if (dataR.story_description == null && dataR.story_description === undefined)
        return "unavailable";
    else return dataR.story_description;
}
window.get_story_description=get_story_description;

