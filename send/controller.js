function openSend(domain, to_address, amount, success) {
    trackCall(arguments)
    showDialog("send", success, function ($scope) {
        addPriceAmountTotal($scope)
        $scope.domain = domain

        $scope.send = function send(domain) {
            trackCall(arguments)
            $scope.startRequest()
            postApi("send", {
                domain: domain,
                to: $scope.to_address,
                amount: $scope.amount,
            }, function (response) {
                storage.pushToArray(storageKeys.user_history, $scope.to_address, 3)
                showSuccessDialog(str.success, $scope.close)
            }, $scope.finishRequest)
        }

        $scope.setMax = function () {
            $scope.amount = $scope.balance
        }

        $scope.setToAddress = function (to_address) {
            $scope.to_address = to_address
        }

        function init() {
            $scope.recent = storage.getStringArray(storageKeys.user_history).reverse()
            postApi("balance", {domain: domain}, function (response) {
                $scope.balance = response.balance
                $scope.$apply()
            })
        }

        init()

        setTimeout(function () {
            document.getElementById('send_address').focus()
        }, 500)
    })
}