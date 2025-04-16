function openSelectDomain(success) {
    trackCall(arguments)
    showDialog("products/p2p/domain", success, function ($scope) {
        $scope.domains = [
            "usdt",
            "pln",
            "byr",
        ]
    })
}