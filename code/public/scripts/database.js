////////////////// DATABASE //////////////////
// the database receives from the server the following structure
import * as idb from './idb/index.js';


/** class Story{
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
 * @param story_title
 * @param storyObject
 */
async function storeStoryToCachedData(story_title, storyObject) {
    // console.log('inserting: '+JSON.stringify(storyObject));
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let result = await getStoryFromCachedData(story_title)
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

window.storeStoryToCachedData=storeStoryToCachedData;

/**
 * it retrieves the story for a story_title from the database
 * @param story_title
 * @returns {*}
 */
async function getStoryFromCachedData(story_title) {
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
window.getStoryFromCachedData= getStoryFromCachedData;


/**
 * given the server data, it returns the value of the field first_name
 * @param dataR the data returned by the server
 * @returns {*}
 */
function get_first_name(dataR) {
    if (dataR.first_name == null && dataR.first_name === undefined)
        return "unavailable";
    return dataR.first_name
}
window.get_first_name=get_first_name;

/**
 * given the server data, it returns the value of the field wind
 * @param dataR the data returned by the server
 * @returns {*}
 */
function get_family_name(dataR) {
    if (dataR.family_name == null && dataR.family_name === undefined)
        return "unavailable";
    else return dataR.family_name;
}
window.get_family_name=get_family_name;

/**
 * given the server data, it returns the value of the field story_title
 * @param dataR the data returned by the server
 * @returns {*}
 */
function get_story_title(dataR) {
    if (dataR.story_title == null && dataR.story_title === undefined)
        return "unavailable";
    else return dataR.story_title;
}
window.get_story_title=get_story_title;


/**
 * given the server data, it returns the value of the field date
 * @param dataR the data returned by the server
 * @returns {*}
 */
function get_date(dataR) {
    if (dataR.date == null && dataR.date === undefined)
        return "unavailable";
    else return dataR.date;
}
window.get_date=get_date;

/**
 * given the server data, it returns the value of the field image
 * @param dataR the data returned by the server
 * @returns {*}
 */
function get_story_image(dataR) {
    if (dataR.story_title == null && dataR.story_title === undefined)
        return "unavailable";
    else return dataR.story_image;
}
window.get_story_image=get_story_image;

/**
 * given the server data, it returns the value of the field description
 * @param dataR the data returned by the server
 * @returns {*}
 */
function get_story_description(dataR) {
    if (dataR.story_description == null && dataR.story_description === undefined)
        return "unavailable";
    else return dataR.story_description;
}
window.get_story_description=get_story_description;

