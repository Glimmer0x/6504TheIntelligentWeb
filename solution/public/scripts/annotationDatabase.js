////////////////// DATABASE //////////////////
// the database receives from the server the following structure
import * as idb from './idb/index.js';


/** class Annotation{
 *  constructor (name, roomId, pixel_pair, message, date) {
 *    this.name= name;
 *    this.roomId= roomId,
 *    this.pixel_pair=pixel_pair;
 *    this.canvas = canvas;
 *    this.message = message;
 *    this.date= date;
 *  }
 *}
 *
 */
let db;

const ANNOTATION_DB_NAME= 'db_annotation';
const ANNOTATION_STORE_NAME= 'store_annotation';
const KNOWLEDGE_GRAPH_STORE_NAME = 'store_knowledge_graph';

/**
 * it inits the database
 */
async function initDatabase(){
    if (!db) {
        db = await idb.openDB(ANNOTATION_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(ANNOTATION_STORE_NAME)) {
                    let storyDB = upgradeDb.createObjectStore(ANNOTATION_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    storyDB.createIndex('name', 'name', {unique: false, multiEntry: true});
                    storyDB.createIndex('roomId', 'roomId', {unique: false, multiEntry: true});
                }
                if (!upgradeDb.objectStoreNames.contains(KNOWLEDGE_GRAPH_STORE_NAME)) {
                    let knowledgeGraphDB = upgradeDb.createObjectStore(KNOWLEDGE_GRAPH_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    knowledgeGraphDB.createIndex('id', 'id', {unique: true, multiEntry: true});
                    // knowledgeGraphDB.createIndex('roomId', 'roomId', {unique: false, multiEntry: true});
                }
            }
        });
        console.log('db created');
    }
}
window.initDatabase= initDatabase;

/**
 * it saves the annotation in localStorage
 * @param {string} name user id in a chat room
 * @param {string} roomId id of a chat room
 * @param {object} AnnotationObject object of annotation
 * @returns {Promise<void>} set item
 */
async function storeCachedData(name, roomId, AnnotationObject) {
    // console.log('inserting: '+JSON.stringify(storyObject));
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction(ANNOTATION_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(ANNOTATION_STORE_NAME);
            await store.put(AnnotationObject);
            await  tx.complete;
            console.log('add item to the IndexDB! ');
        } catch(error) {
            localStorage.setItem(name, JSON.stringify(AnnotationObject));
        };
    }
    else localStorage.setItem(name, JSON.stringify(AnnotationObject));
}

window.storeCachedData=storeCachedData;

/**
 * it saves the knowledge graph in localStorage
 * @param KnowledgeGraphObject
 * @returns {Promise<void>}
 */
async function storeKnowledgeGraphToCachedData(KnowledgeGraphObject) {
    // console.log('inserting: '+JSON.stringify(storyObject));
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let result = await getKnowledgeGraphFromCachedData()
            let arr = Object.keys(result)
            if (arr.length !== 0) {
                for (let i of result) {
                    if(i.id === KnowledgeGraphObject.id) {
                        console.log('item already exists')
                    } else {
                        let tx = await db.transaction(KNOWLEDGE_GRAPH_STORE_NAME, 'readwrite');
                        let store = await tx.objectStore(KNOWLEDGE_GRAPH_STORE_NAME);
                        await store.put(KnowledgeGraphObject);
                        await  tx.complete;
                        console.log('add item to the IndexDB! ');
                    }
                }
            } else {
                let tx = await db.transaction(KNOWLEDGE_GRAPH_STORE_NAME, 'readwrite');
                let store = await tx.objectStore(KNOWLEDGE_GRAPH_STORE_NAME);
                await store.put(KnowledgeGraphObject);
                await  tx.complete;
                console.log('add item to the IndexDB! ');
            }

        } catch(error) {
            localStorage.setItem(name, JSON.stringify(KnowledgeGraphObject));
        };
    }
    else localStorage.setItem(name, JSON.stringify(KnowledgeGraphObject));
}

window.storeKnowledgeGraphToCachedData=storeKnowledgeGraphToCachedData;

/**
 * it retrieves all annotations
 * @returns {Promise<*>}
 */
async function getAllAnnotation() {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            let tx = await db.transaction(ANNOTATION_STORE_NAME, 'readonly');
            let store = await tx.objectStore(ANNOTATION_STORE_NAME);
            let index = await store.index('roomId');
            let readingsList = await index.getAll();
            await tx.complete;
            // console.log(readingsList)
            return readingsList;
        } catch (error) {
            console.log(error)
        }
    } else {
        console.log('error')
    }
}
window.getAllAnnotation = getAllAnnotation

/**
 * it retrieves the annotation for the specific roomId from the database
 * @param {string} name user id in a chat room
 * @param {string} roomId id of a chat room
 * @returns {array} using Promise to get a list of cached data
 */
async function getCachedData(name, roomId) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            // console.log('fetching: ' + story_title);
            let tx = await db.transaction(ANNOTATION_STORE_NAME, 'readonly');
            let store = await tx.objectStore(ANNOTATION_STORE_NAME);
            let index = await store.index('roomId');
            let readingsList = await index.getAll(IDBKeyRange.only(roomId));
            await tx.complete;
            // console.log(readingsList)
            return readingsList;
        } catch (error) {
            console.log(error);
        }
    } else {
        const value = localStorage.getItem(name);
        let finalResults=[];
        if (value == null)
            return finalResults;
        else finalResults.push(value);
        return finalResults;
    }
}
window.getCachedData= getCachedData;


/**
<<<<<<< HEAD
 * given the local cached annotation data, it returns the value of the field name
 * @param {object} dataR the cached annotation object
 * @returns {string} return 'unavailable' if dataR is null else return the value of the field name
=======
 * it retrieves all knowledge graph from the database
 * @returns {array} using Promise to get a list of cached data
 */
async function getKnowledgeGraphFromCachedData() {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            let tx = await db.transaction(KNOWLEDGE_GRAPH_STORE_NAME, 'readonly');
            let store = await tx.objectStore(KNOWLEDGE_GRAPH_STORE_NAME);
            let index = await store.index('id');
            let readingsList = await index.getAll();
            await tx.complete;
            // console.log(readingsList)
            return readingsList;
        } catch (error) {
            console.log(error);
        }
    } else {
        const value = localStorage.getItem(name);
        let finalResults=[];
        if (value == null)
            return finalResults;
        else finalResults.push(value);
        return finalResults;
    }
}
window.getKnowledgeGraphFromCachedData= getKnowledgeGraphFromCachedData;

/**
 * given the local cached annotation data, it returns the value of the field name
 * @param {object} dataR the cached annotation object
 * @returns {string} return 'unavailable' if dataR is null else return the value of the field name
 */
function get_name(dataR) {
    if (dataR.name == null && dataR.name === undefined)
        return "unavailable";
    return dataR.name
}
window.get_name=get_name;

/**
 * given the local cached annotation data, it returns the value of the field roomId
 * @param {object} dataR the cached annotation object
 * @returns {string} return 'unavailable' if dataR is null else return the value of the field roomId
 */
function get_roomId(dataR) {
    if (dataR.roomId == null && dataR.roomId === undefined)
        return "unavailable";
    else return dataR.roomId;
}
window.get_roomId=get_roomId;

/**
 * given the local cached annotation data, it returns the value of the field pixel_pair
 * @param {object} dataR the cached annotation object
 * @returns {array} return 'unavailable' if dataR is null else return pixel_pair
 */
function get_pixel_pair(dataR) {
    if (dataR.pixel_pair == null && dataR.pixel_pair === undefined)
        return "unavailable";
    else return dataR.pixel_pair;
}
window.get_pixel_pair=get_pixel_pair;


/**
 * given the local cached annotation data, it returns the value of the field date
 * @param {object} dataR the cached annotation object
 * @returns {string} return 'unavailable' if dataR is null else return the value of the field date
 */
function get_date(dataR) {
    if (dataR.date == null && dataR.date === undefined)
        return "unavailable";
    else return dataR.date;
}
window.get_date=get_date;

/**
 * given the local cached annotation data, it returns the value of the field message
 * @param {object} dataR the cached annotation object
 * @returns {string} return 'unavailable' if dataR is null else return the message of the object
 */
function get_message(dataR) {
    if (dataR.message == null && dataR.message === undefined)
        return "unavailable";
    else return dataR.message;
}
window.get_message=get_message;


function get_canvas(dataR) {
    if (dataR.canvas == null && dataR.message === undefined)
        return "unavailable";
    else return dataR.canvas;
}
window.get_canvas=get_canvas;

function get_story(dataR) {
    if (dataR.story_title == null && dataR.message === undefined)
        return "unavailable";
    else return dataR.story_title;
}
window.get_story=get_story;

