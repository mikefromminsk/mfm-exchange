let EXCHANGE_TOKEN = "EXCHANGE_TOKEN"
let EXCHANGE_USERNAME = "EXCHANGE_USERNAME"

window.user = {
    username: function () {
        return storage.getString(EXCHANGE_USERNAME)
    },
    saveUsername: function (username) {
        return storage.setString(EXCHANGE_USERNAME, username)
    },
    token: function () {
        return storage.getString(EXCHANGE_TOKEN)
    },
    saveToken: function (token) {
        return storage.setString(EXCHANGE_TOKEN, token)
    },
}

function postApi(path, params, success, error) {
    params = params || {}
    params.token = params.token || storage.getString(EXCHANGE_TOKEN)
    postContract("mfm-exchange", path, params, success, error)
}