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
        window.history.pushState({}, document.title, "/mfm-wallet")
    }

    if (window.Telegram != null) {
        setTimeout(function () {
            let userData = window.Telegram.WebApp.initDataUnsafe
            if (userData.user != null) {
                window.telegram_username = userData.user.username
                trackEvent("tg_referer", null, window.telegram_username)
            }
        })
    }

    window.addEventListener('popstate', () => {
        $scope.close()
    })

    connectWs()
}

window.finishAutoOpening = false

function loaded() {
    if (!finishAutoOpening) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        for (const [key, value] of params) {
            if (key.startsWith('open')) {
                const functionName = key;
                if (typeof window[functionName] === 'function') {
                    window[functionName](value);
                    window.finishAutoOpening = true;
                }
            }
        }
    }
}