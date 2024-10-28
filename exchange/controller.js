function openExchange(domain, is_sell) {
    showDialog('/mfm-exchange/exchange/index.html', null, function ($scope) {
        $scope.domain = domain
        $scope.is_sell = is_sell == 1

        if (DEBUG) {
            $scope.price = 5
            $scope.amount = 1
        }

        var round = $scope.round

        $scope.changePrice = function (price) {
            if (price != null)
                $scope.price = price
            if ($scope.price != null && $scope.amount != null)
                $scope.total = round($scope.price * $scope.amount, 4)
        }

        $scope.changeAmount = function (amount) {
            if (amount != null)
                $scope.amount = amount
            if ($scope.price != null && $scope.amount != null)
                $scope.total = round($scope.price * $scope.amount, 4)
        }

        $scope.changeTotal = function () {
            if ($scope.price != null && $scope.total != null)
                $scope.amount = round($scope.total / $scope.price, 2)
        }

        $scope.setPortion = function (portion) {
            if (is_sell) {
                $scope.changeAmount(round($scope.token.balance * portion / 100, 2))
            } else {
                $scope.total = round($scope.quote.balance * portion / 100, 4)
                $scope.changeTotal()
            }
        }

        $scope.place = function () {
            getPin(function (pin) {
                calcPass($scope.is_sell ? domain : "mfm-usdt", pin, function (pass) {
                    postContract("mfm-exchange", "owner.php", {
                        redirect: 'mfm-exchange/place.php',
                        order_type: 'limit',
                        domain: domain,
                        is_sell: $scope.is_sell ? 1 : 0,
                        address: wallet.address(),
                        price: $scope.price,
                        amount: $scope.amount,
                        total: $scope.total,
                        pass: pass
                    }, function () {
                        loadOrders()
                        showSuccess("Order placed", loadOrderbook)
                    })
                })
            })
        }

        $scope.cancel = function (order_id) {
            postContract("mfm-exchange", "exchange.php", {
                action: 'cancel',
                order_id: order_id,
            }, function () {
                loadOrders()
                showSuccess("Order canceled", loadOrderbook)
            })
        }

        $scope.orders = []

        function loadOrders() {
            postContract("mfm-exchange", "orders.php", {
                domain: domain,
                address: wallet.address(),
            }, function (response) {
                $scope.orders = []
                $scope.orders.push.apply($scope.orders, response.active)
                $scope.orders.push.apply($scope.orders, response.history)
                $scope.$apply()
            })
        }

        function init() {
            loadBaseProfile()
            loadQuoteBalance()
            loadOrderbook()
            loadOrders()
        }

        function loadBaseProfile() {
            getProfile(domain, function (response) {
                $scope.token = response
                $scope.$apply()
            })
        }

        function loadQuoteBalance() {
            postContract("mfm-token", "account.php", {
                domain: wallet.quote_domain,
                address: wallet.address(),
            }, function (response) {
                $scope.quote = response
                $scope.$apply()
            })
        }

        function loadOrderbook() {
            postContract("mfm-exchange", "orderbook.php", {
                domain: domain,
            }, function (response) {
                $scope.sell = (response.sell || []).reverse()
                $scope.buy = response.buy
                $scope.orderbook = response
                $scope.$apply()
            })
        }

        //addChart($scope, domain + "_price")

        $scope.subscribe("price", function (data) {
            if (data.domain == domain) {
                $scope.token.price = data.price
                //$scope.updateChart()
                $scope.$apply()
            }
        });

        $scope.subscribe("orderbook", function (data) {
            if (data.domain == domain) {
                loadOrderbook()
                $scope.$apply()
            }
        });

        init()
    })
}