function openWithdrawal(domain, success) {
    trackCall(arguments)
    showDialog("withdrawal", success, function ($scope) {
            $scope.domain = domain
            $scope.withdrawal_address = ""
            $scope.amount = ""

            if (DEBUG) {
                $scope.withdrawal_address = "14b6539449b0528429cfd5e52493d53551231b49997cbaa83c5f698bf5b744ee"
                $scope.amount = 0.1
            }

            $scope.withdrawal = function () {
                tradeApi("withdrawal", {
                    domain: $scope.domain,
                    address: $scope.withdrawal_address,
                    amount: $scope.amount,
                }, function (response) {
                    showSuccessDialog("Your withdrawal in progress", success)
                })
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
        }
    )
}