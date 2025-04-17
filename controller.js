function start($scope) {
    trackCall(arguments)

    document.title = window.location.hostname

    $scope.menu = ["home", "wallet"]
    $scope.selectedIndex = 0
    $scope.selectTab = function (tab) {
        $scope.selectedIndex = tab
        if (tab == 0) {
            openHome($scope)
        } else if (tab == 1) {
            openWallet($scope)
        }
        swipeToRefresh($scope.swipeToRefresh)
    }

    $scope.swipeToRefresh = function () {
        $scope.selectTab($scope.selectedIndex)
    }

    $scope.selectTab($scope.selectedIndex)

    if (window.location.search != "") {
        window.history.pushState({}, document.title, "/mfm-exchange")
    }

    window.addEventListener('popstate', () => {
        $scope.close()
    })

    connectWs()
}