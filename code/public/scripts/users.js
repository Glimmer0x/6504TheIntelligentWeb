/**
 * check login data is not null
 * @param {form} form a login form including two string: username and password
 * @return {boolean} return false if login data is null else return ture
 */
function checkLoginData(form) {
    const formData = new FormData(form);
    const username = formData.get("username");
    const password = formData.get("password");

    if (username || password) {
        return true;
    }
    alert("Please input username or password first!");
    return false;
}

/**
 * post signup data to add a new user
 * redirect to login page after signup successfully
 */
function signup() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('new-password').value;
    data = {
        'username': username,
        'password': password
    }

    axios.post('/signup', data)
        .then(function (response) {
                console.log(response);
                window.location.replace("/login");
            }
        )
        .catch(function (response) {
            console.log(response)
            alert(response.error);
        })
}

/**
 * load message in login page
 */
function onLoadLoginPage() {
    const element = document.getElementById('results');
    const message = element.textContent;
    if (message) {
        element.style.display = 'block';
    }else {
        element.style.display = 'none';
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function() { console.log('Service Worker Registered'); });
    }
}