let EXCHANGE_TOKEN = "EXCHANGE_TOKEN"

window.user = {
    login: function () {
        return storage.getString(EXCHANGE_TOKEN)
    },
    saveLogin: function (token) {
        return storage.setString(EXCHANGE_TOKEN, token)
    },

}

function postApi(path, params, success, error) {
    params = params || {}
    params.token = storage.getString(EXCHANGE_TOKEN)
    postContract("mfm-exchange", path, params, success, error)
}