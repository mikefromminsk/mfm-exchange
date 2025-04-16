function openDeposit(domain, success) {
    trackCall(arguments)
    showDialog("deposit", success, function ($scope) {
        $scope.domain = domain

        function loadDepositAddress() {
            postApi("deposit", {
                domain: domain
            }, function (response) {
                $scope.deposit_address = response.deposit_address
                $scope.$apply()
            })
        }

        loadDepositAddress()
    })
}