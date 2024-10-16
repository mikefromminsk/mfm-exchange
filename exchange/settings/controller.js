function openExchangeSettings(domain, success) {
    showDialog('/mfm-exchange/exchange/settings/index.html', success, function ($scope) {
            addFormats($scope)

            $scope.openSpredBalances = function () {
                postContract("mfm-exchange", "bot/spred/init.php", {
                    domain: domain,
                }, function () {
                    openBalances([
                        {
                            domain: domain,
                            address: "bot_spred_" + domain
                        }, {
                            domain: wallet.gas_domain,
                            address: "bot_spred_" + domain
                        },
                    ])
                })
            }
    })
}