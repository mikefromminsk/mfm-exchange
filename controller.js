function start($scope) {
    trackCall(arguments)

    document.title = window.location.hostname

    $scope.menu = ["history", "home", "wallet"]
    $scope.selectedIndex = 1
    $scope.selectTab = function (tab) {
        $scope.selectedIndex = tab
        if (tab == 0) {
            openTrans($scope)
        } else if (tab == 1) {
            openHome($scope)
        } else if (tab == 2) {
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