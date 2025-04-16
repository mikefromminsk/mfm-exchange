function openExchangeBot(domain, success) {
    trackCall(arguments)
    showDialog("products/exchange/bot", success, function ($scope) {
        $scope.domain = domain
        $scope.bot_address = wallet.getBotAddress(domain)

        $scope.selectAccount = function (domain) {
            openSend(domain, $scope.bot_address, null, init)
        }

        function init() {
            getAccount(domain, function (response) {
                $scope.token = response.token
                $scope.account = response.account
                $scope.$apply()
            })
            postContract("mfm-token", "accounts", {
                domain: wallet.gas_domain,
                address: $scope.bot_address,
            }, function (response) {
                let accounts = []
                for (const account of response.accounts)
                    if (account.domain == domain || account.domain == wallet.gas_domain)
                        accounts.push(account)
                $scope.accounts = accounts
                $scope.$apply()
            })
        }

        init()
    })
}