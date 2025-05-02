function start($scope) {
    trackCall(arguments)

    document.title = window.location.hostname

    $scope.menu = ["main", "assets"]
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

    function subscribeAccount() {
        $scope.subscribe("account:" + user.username(), function (data) {
            showSuccess(str.you_have_received + " " + $scope.formatAmount(data.amount, data.domain))
            setTimeout(function () {
                new Audio("/mfm-wallet/dialogs/success/payment_success.mp3").play()
            })
            $scope.refresh()
        })
    }

    subscribeAccount()
    connectWs()
}