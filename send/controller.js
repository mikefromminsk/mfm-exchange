function openSend(domain, username, amount, success) {
    trackCall(arguments)
    showDialog("send", success, function ($scope) {
        addPriceAmountTotal($scope)
        $scope.domain = domain
        $scope.username = username

        $scope.send = function send(domain) {
            trackCall(arguments)
            $scope.startRequest()
            tradeApi("send", {
                domain: domain,
                to: $scope.username,
                amount: $scope.amount,
            }, function (response) {
                showSuccessDialog(str.success, $scope.close)
            }, $scope.finishRequest)
        }

        $scope.setMax = function () {
            $scope.amount = $scope.balance
        }

        function init() {
            tradeApi("balance", {domain: domain}, function (response) {
                $scope.balance = response.balance
                $scope.$apply()
            })
        }

        init()

        setTimeout(function () {
            document.getElementById(!username ? 'send_address' : 'send_amount').focus()
        }, 500)
    })
}