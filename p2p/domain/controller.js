function openSelectDomain(success) {
    trackCall(arguments)
    showDialog("p2p/domain", success, function ($scope) {
        $scope.domains = [
            "usdt",
            "pln",
            "byr",
        ]
    })
}