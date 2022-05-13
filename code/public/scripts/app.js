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

$(document).ready(function(){
    let data = {};
    axios.post('/index', data)
        .then((dataR) => {
            let data = dataR.data
            console.log(data)
            let dic = document.getElementById("story-list");
            for(let index in data) {
                let div = document.createElement('div');
                div.className = 'list-group-item';
                let span = document.createElement('span');
                span.innerHTML = ' by ' + data[index].first_name + ' ' + data[index].family_name + ' on ' + data[index].createdAt;
                let h4=document.createElement('h4');
                h4.innerHTML = data[index].story_title;
                h4.appendChild(span);
                let a = document.createElement('a');
                a.href = 'www.baidu.com';
                a.appendChild(h4);
                let br = document.createElement('br');
                let img = document.createElement('img');
                img.src = data[index].story_image;
                let p = document.createElement('p');
                p.innerHTML = data[index].story_description;
                div.appendChild(a);
                div.appendChild(br);
                div.appendChild(img);
                div.appendChild(p);
                dic.appendChild(div);
            }
        })
        .catch(function (response) {
            console.log('error');
            alert(response.toJSON());
        })
})

function sendAxiosQuery(url, data) {
    axios.post(url, data)
        .then((dataR) => {// no need to JSON parse the result, as we are using
            // we need to JSON stringify the object
            document.getElementById('results').innerHTML = JSON.stringify(dataR.data);
        })
        .catch(function (response) {
            console.log('www')
            console.log(response)
            alert(response.toJSON());
        })
}

function addStory() {
    let firstname = document.getElementById('first_name').value;
    let lastname = document.getElementById('last_name').value;
    let storytitle = document.getElementById('story_title').value;
    let description = document.getElementById('description').value;
    data = {
        'firstname': firstname,
        'lastname': lastname,
        'title': storytitle,
        'description': description,
        'image': base64
    }
    sendAxiosQuery('/insert', data);
    event.preventDefault();
    $('#DialogModal').modal('hide');
    window.location.reload();
}

function login(){
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    data = {
        'username': username,
        'password': password
    }

    axios.post('/login', data)
        .then(function (response){
                alert(response.toJSON());

            }
        )
        .catch(function (response) {
            console.log('www')
            console.log(response)
            alert(response.toJSON());
        })
}

function signup(){
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    data = {
        'username': username,
        'password': password
    }

    axios.post('/signup', data)
        .then(function (response){
            console.log(response.toJSON());
            window.location.href = response.toJSON()['redirect_url'];
            }
        )
        .catch(function (response) {
            console.log('www')
            console.log(response)
            alert(response.toJSON());
        })
}