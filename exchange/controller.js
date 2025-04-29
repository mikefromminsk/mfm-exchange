function openExchange(domain, is_sell) {
    trackCall(arguments)
    showDialog("exchange", null, function ($scope) {
        addPriceAmountTotal($scope)
        $scope.domain = domain
        $scope.is_sell = is_sell == 1

        if (window.conn != null && window.conn.readyState !== WebSocket.OPEN) {
            connectWs()
        }

        $scope.openLogin = function () {
            openLogin($scope.refresh)
        }
        $scope.portion = 0
        $scope.$watch("portion", function (new_value, old_value) {
            if (new_value == old_value) return;
            $scope.setPortion(new_value)
        })

        $scope.setPortion = function (new_value) {
            $scope.portion = new_value
            if ($scope.is_sell) {
                $scope.changeAmount($scope.base * (new_value / 100))
            } else {
                $scope.changeTotal($scope.quote)
            }
        }

        $scope.place = function place() {
            trackCall(arguments)
            $scope.startRequest()
            postApi("place", {
                order_type: "limit",
                domain: domain,
                is_sell: $scope.is_sell ? 1 : 0,
                price: $scope.price,
                amount: $scope.amount,
                total: $scope.total,
            }, function () {
                $scope.finishRequest()
                showSuccessDialog(str.order_placed, function () {
                    $scope.loadBaseBalance()
                    $scope.loadQuoteBalance()
                    $scope.loadOrderbook()
                })
            }, $scope.finishRequest)
        }

        $scope.cancel = function (order_id) {
            openAskSure(str.are_you_sure, str.yes, str.no, function () {
                postApi("cancel", {
                    order_id: order_id,
                }, function () {
                    showSuccess(str.order_canceled, $scope.refresh)
                })
            })
        }

        $scope.loadOrders = function () {
            if (user.username() != "") {
                postApi("user_orders", {
                    domain: domain,
                }, function (response) {
                    $scope.active_orders = response.active
                    $scope.history_orders = response.history
                    $scope.$apply()
                })
            }
        }

        $scope.hasMyOrder = function (price) {
            if ($scope.active_orders == null) return false
            for (const order of $scope.active_orders)
                if (order.price == price) return true
            return false
        }

        $scope.loadBaseProfile = function () {
            getAccount(domain, function (response) {
                $scope.token = response.token
                $scope.$apply()
            })
        }

        $scope.loadBaseBalance = function () {
            postApi("balance", {
                domain: domain
            }, function (response) {
                $scope.base = response.balance
                $scope.$apply()
            })
        }

        $scope.loadQuoteBalance = function () {
            postApi("balance", {
                domain: wallet.gas_domain
            }, function (response) {
                $scope.quote = response.balance
                $scope.$apply()
            })
        }

        $scope.loadOrderbook = function () {
            postApi("orderbook", {
                domain: domain,
            }, function (response) {
                $scope.sell = (response.sell || []).reverse()
                $scope.buy = response.buy
                if ($scope.is_sell) {
                    if (response.buy.length > 0)
                        $scope.price = $scope.round(response.buy[0].price * 0.95)
                } else {
                    if (response.sell.length > 0)
                        $scope.price = $scope.round(response.sell[0].price * 1.05)
                }
                $scope.$apply()
            })
            if (user.username() != "")
                $scope.loadOrders()
        }

        $scope.subscribe("price:" + domain, function (data) {
            $scope.token.price = data.price
            $scope.$apply()
        });

        $scope.subscribe("orderbook:" + domain, function (data) {
            $scope.loadOrderbook()
            $scope.$apply()
        });

        $scope.subscribe("account:" + user.username(), function (data) {
            $scope.refresh()
        })

        $scope.refresh = function () {
            $scope.loadBaseProfile()
            $scope.loadBaseBalance()
            $scope.loadQuoteBalance()
            $scope.loadOrderbook()
        }
        $scope.refresh()
    })
}

function addPriceAmountTotal($scope) {
    $scope.setIsSell = function (is_sell) {
        $scope.is_sell = is_sell
    }

    $scope.changePrice = function (price) {
        if (price != null)
            $scope.price = price
        if ($scope.price != null && $scope.amount != null)
            $scope.total = $scope.round($scope.price * $scope.amount)
    }

    $scope.changeAmount = function (amount) {
        if (amount != null)
            $scope.amount = amount
        if ($scope.price != null && $scope.amount != null)
            $scope.total = $scope.round($scope.price * $scope.amount)
    }

    $scope.changeTotal = function (total) {
        if (total != null)
            $scope.total = total
        if ($scope.price != null && $scope.total != null)
            $scope.amount = $scope.round($scope.total / $scope.price)
    }

    $scope.$watch("price", function (newValue) {
        if (newValue != null)
            $scope.price = $scope.round($scope.price)
    })
    $scope.$watch("amount", function (newValue) {
        if (newValue != null)
            $scope.amount = $scope.round($scope.amount)
    })
    $scope.$watch("total", function (newValue) {
        if (newValue != null)
            $scope.total = $scope.round($scope.total)
    })
}
