function openExchangeBot(domain, success) {
    trackCall(arguments)
    showDialog("exchange/bot", success, function ($scope) {
        $scope.domain = domain
        $scope.accounts = []
        let bot_username = wallet.getBotUsername(domain)
        let bot_address = wallet.getBotAddress(domain)

        $scope.selectAccount = function (domain) {
            openSend(domain, bot_address, null, init)
        }

        $scope.addLiquidity = function () {
            openSend(domain, bot_username, null, function () {
                init()
                openSend(wallet.gas_domain, bot_username, null, init)
            })
        }

        $scope.botRegistration = function () {
            tradeApi("login", {
                username: bot_username,
                token: bot_address,
            }, init)
        }

        function init() {
            tradeApi("balances", {
                address: bot_address,
                token: bot_address,
            }, function (response) {
                $scope.accounts = response.balances
                $scope.$apply()
            })
        }

        init()
    })
}