const service_url = 'https://kgsearch.googleapis.com/v1/entities:search';
const apiKey= 'AIzaSyAG7w627q-djB4gTTahssufwNOImRqdYKM';

/**
 * it inits the widget by selecting the type from the field myType
 * and it displays the Google Graph widget
 * it also hides the form to get the type
 */
function widgetInit(){
    let type= document.getElementById("myType").value;
    if (type) {
        let config = {
            'limit': 10,
            'languages': ['en'],
            'types': [type],
            'maxDescChars': 100,
            'selectHandler': selectItem,
        }
        KGSearchWidget(apiKey, document.getElementById("myInput"), config);
        document.getElementById('searchHint').innerHTML= 'Search for the type of: '+type;
        document.getElementById('widget').style.display='block';
    }
    else {
        alert('Set the type please');
        document.getElementById('widget').style.display='none';
        document.getElementById('resultPanel').style.display='none';
        document.getElementById('searchHint').innerHTML= '';
        document.getElementById('typeForm').style.display= 'block';
    }
}

/**
 * callback called when an element in the widget is selected
 * @param event the Google Graph widget event {@link https://developers.google.com/knowledge-graph/how-tos/search-widget}
 */
function selectItem(event){
    let row= event.row;
    // document.getElementById('resultImage').src= row.json.image.url;
    let resultPanel =  document.getElementById('resultPanel');
    resultPanel.style.display= 'block';
    let showItem = document.createElement('div');
    showItem.className = 'list-group-item';
    let resultName = document.createElement('h3');
    let resultId = document.createElement('h4');
    let resultDescription = document.createElement('p');
    let urlDiv =  document.createElement('div');
    let resultURL = document.createElement('a');
    resultId.innerText= 'id: '+row.id;
    resultName.innerText= row.name;
    resultDescription.innerText= row.rc;
    resultURL.innerText = 'Link to Webpage';
    resultURL.href= row.qc;
    resultURL.target = '_blank';

    showItem.appendChild(resultName);
    showItem.appendChild(resultId);
    showItem.appendChild(resultDescription);
    showItem.appendChild(resultURL);
    resultPanel.appendChild(showItem);
}

/**
 * currently not used. left for reference
 * @param id
 * @param type
 */
function queryMainEntity(id, type){
    const  params = {
        'query': mainEntityName,
        'types': type,
        'limit': 10,
        'indent': true,
        'key' : apiKey,
    };
    $.getJSON(service_url + '?callback=?', params, function(response) {
        $.each(response.itemListElement, function (i, element) {

            $('<div>', {text: element['result']['name']}).appendTo(document.body);
        });
    });
}
