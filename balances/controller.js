function openBalances(accounts, success) {
    showDialog('/mfm-exchange/balances/index.html', success, function ($scope) {
            addFormats($scope)
            $scope.balances = {}

            function getBalance(domain, address) {
                postContract("mfm-token", "account.php", {
                    domain: domain,
                    address: address,
                }, function (account) {
                    $scope.balances[domain + address] = {
                        domain: domain,
                        address: address,
                        balance: account.balance,
                    }
                    $scope.$apply()
                })
            }

            function init() {
                for (const account of accounts) {
                    getBalance(account.domain, account.address)
                }
            }

            $scope.send = function (domain, address, amount) {
                openSendDialog(domain, address, amount, init)
            }

            init()
    })
}