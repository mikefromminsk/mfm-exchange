function openSend(domain, to_address, amount, success) {
    trackCall(arguments)
    showDialog("send", success, function ($scope) {
        addPriceAmountTotal($scope)

        $scope.domain = domain
        if ((to_address || "") != "") {
            $scope.to_address = to_address
            $scope.block_to_address = true
        }

        if ((amount || "") != "") {
            $scope.amount = amount
        }

        $scope.send = function send(domain) {
            trackCall(arguments)
            $scope.startRequest()
            getPin(function (pin) {
                calcPass(domain, pin, function (pass) {
                    postContract("mfm-token", "send", {
                        domain: domain,
                        from: user.login(),
                        to: $scope.to_address,
                        pass: pass,
                        amount: $scope.amount,
                    }, function (response) {
                        storage.pushToArray(storageKeys.send_history, $scope.to_address, 3)
                        $scope.close()
                        openTran(response.next_hash, success)
                    }, $scope.finishRequest)
                })
            })
        }

        $scope.setMax = function () {
            $scope.amount = $scope.account.balance
        }

        $scope.setToAddress = function (to_address) {
            $scope.to_address = to_address
        }

        function init() {
            $scope.recent = storage.getStringArray(storageKeys.send_history).reverse()
            getAccount(domain, function (response) {
                $scope.token = response.token
                $scope.account = response.account
                $scope.$apply()
            })
        }

        init()

        setTimeout(function () {
            document.getElementById('send_address').focus()
        }, 500)
    })
}