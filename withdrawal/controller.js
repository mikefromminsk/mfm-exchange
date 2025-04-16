function openWithdrawal(success) {
    trackCall(arguments)
    showBottomSheet("products/withdrawal", success, function ($scope) {

            $scope.withdrawal_address = ""
            $scope.amount = ""

            if (DEBUG){
                $scope.withdrawal_address = "TCS4FD9XJ4abux72qy21Dc4DC7XWAHjvje"
                $scope.amount = 0.1
            }

            $scope.withdrawal = function () {
                // demo withdrawal address
                if (!$scope.withdrawal_address.startsWith("T") || !$scope.withdrawal_address.length == 34) {
                    $scope.errorAddress = "Invalid address"
                    return
                }
                if (!$scope.amount) {
                    return
                }
                if ($scope.total <= 0){
                    $scope.errorAmount = "Amount too low"
                    return;
                }
                postContractWithGas("mfm-data", "withdrawal/start", function (key, nexthash) {
                    return {
                        address: user.login(),
                        key: key,
                        next_hash: nexthash,
                        withdrawal_address: $scope.withdrawal_address,
                        amount: $scope.amount,
                        provider: "TRON",
                    }
                }, function (response) {
                    showSuccessDialog("Your withdrawal in progress", success)
                })
            }

            $scope.setMax = function () {
                $scope.amount = $scope.account.balance
                $scope.calcTotal()
            }

            $scope.calcTotal = function () {
                $scope.total = Math.max(0, $scope.amount - $scope.provider.fee)
            }

            function init() {
                getAccount(wallet.gas_domain, function (response) {
                    $scope.token = response.token
                    $scope.$apply()
                })
                postContract("mfm-data", "withdrawal/providers", {
                }, function (response) {
                    $scope.providers = response
                    $scope.provider = response["TRON"]
                    $scope.$apply()
                })
            }

            init()
        }

    )
}