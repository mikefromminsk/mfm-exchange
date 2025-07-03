function openP2P(success) {
    trackCall(arguments)
    showDialog("p2p", success, function ($scope) {
        $scope.domain = storage.getString(storageKeys.defaultOfferDomain, wallet.gas_domain)

        $scope.menu = ["history", "offers", "profile"]
        $scope.selectedIndex = 1
        $scope.selectTab = function (tab) {
            $scope.selectedIndex = tab
            if (tab == 0) {
                openOrders($scope)
            } else if (tab == 1) {
                openOffers($scope)
            } else if (tab == 2) {
                addP2PProfile($scope, user.username())
            }
            swipeToRefresh($scope.backToMain)
        }

        $scope.backToMain = function () {
            if ($scope.selectedIndex != 1)
                $scope.selectTab(1)
            else
                $scope.close()
        }

        $scope.selectTab($scope.selectedIndex)
    })
}

function openOffers($scope) {
    $scope.offers = []
    $scope.sell = []
    $scope.buy = []
    $scope.is_sell = false

    $scope.setIsSell = function (is_sell) {
        $scope.is_sell = is_sell
        $scope.offers = is_sell ? $scope.buy : $scope.sell
    }

    $scope.loadOrderbook = function () {
        tradeApi("p2p/offers", {
            domain: $scope.domain,
        }, function (response) {
            $scope.sell = (response.sell || []).reverse()
            $scope.buy = response.buy
            $scope.setIsSell($scope.is_sell)
            $scope.$apply()
        })
    }

    $scope.selectDomain = function (domain) {
        $scope.domain = domain
        storage.setString(storageKeys.defaultOfferDomain, domain)
        $scope.loadOrderbook()
        $scope.$apply()
    }

    $scope.swipeToRefresh = function () {
        $scope.loadOrderbook()
    }

    $scope.swipeToRefresh()
}

function openOrders($scope) {

    $scope.orderMenu = ["offers", "active", "sent", "appeal", "finish", "cancel"]
    $scope.orderMenuSelected = "active"
    $scope.selectOrderMenu = function (menu) {
        $scope.orderMenuSelected = menu
    }

    $scope.orders = {}

    $scope.loadOrders = function () {
        tradeApi("p2p/orders", {
            address: user.username(),
        }, function (response) {
            $scope.orders.offers = response.offers
            $scope.orders.active = response.active
            $scope.orders.finish = response.finish
            $scope.orders.cancel = response.cancel
            $scope.orders.appeal = response.appeal
            $scope.orders.sent = response.sent
            $scope.$apply()
        })
    }

    $scope.swipeToRefresh = function () {
        $scope.loadOrders()
    }
    $scope.loadOrders()
}

function openP2PProfile(address, success) {
    trackCall(arguments)
    showDialog("p2p/profile", success, function ($scope) {
        addP2PProfile($scope, address)
    })
}

function addP2PProfile($scope, address) {
    $scope.swipeToRefresh = function () {
        tradeApi("p2p/profile", {
            address: address,
        }, function (response) {
            $scope.profile = response.profile
            $scope.$apply()
        })
    }

    $scope.swipeToRefresh()
}