function openSettings(success) {
    trackCall(arguments)
    showDialog("settings", success, function ($scope) {
        $scope.language = getLanguage()
        $scope.languages = window.languages

        $scope.logout = function () {
            openAskSure(str.are_you_sure, str.yes, str.no, function () {
                wallet.logout()
                storage.setString(storageKeys.onboardingShowed, "true")
            })
        }

        $scope.openChangePin = function () {
            let address = storage.getString(storageKeys.address)
            let passhash = storage.getString(storageKeys.passhash)
            if (storage.getString(storageKeys.hasPin) == "") {
                setPincode(passhash)
            } else {
                getPin(function (old_pin) {
                    let password = decode(passhash, old_pin)
                    authorize(address, password, function () {
                        setPincode(password)
                    })
                })
            }

            function setPincode(password){
                getPin(function (new_pin) {
                    storage.setString(storageKeys.passhash, encode(password, new_pin))
                    storage.setString(storageKeys.hasPin, true)
                    showSuccess(str.pin_changed)
                }, function () {
                    storage.setString(storageKeys.passhash, password)
                    storage.setString(storageKeys.hasPin, "")
                    showSuccess(str.pin_removed)
                })
            }
        }

        $scope.init = function () {
            postContract("mfm-token", "account", {
                domain: wallet.gas_domain,
                address: user.username(),
            }, function (response) {
                $scope.account = response.account
                $scope.$apply()
            }, function () {
            })
        }

        $scope.init()
    })
}