function createOdometer(el, value) {
    if (el == null) return
    const odometer = new Odometer({
        el: el,
        value: 0,
    })

    let hasRun = false
    const callback = (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (!hasRun) {
                    odometer.update(value)
                    hasRun = true
                }
            }
        })
    }

    const observer = new IntersectionObserver(callback, {
        threshold: [0, 0.9],
    })
    observer.observe(el)
}

function openWallet($scope) {

    $scope.domain = "usdt"

    function loadTokens() {
        postApi("balances", {}, function (response) {
            $scope.accounts = response.balances
            setTimeout(function () {
                createOdometer(document.getElementById("total"), $scope.getTotalBalance())
            }, 100)
            $scope.$apply()
        })
    }

    $scope.getPrice = function (domain) {
        for (const account of $scope.accounts) {
            if (account.domain == domain)
                return account.token.price
        }
        return 0
    }

    $scope.getTotalBalance = function () {
        let totalBalance = 0
        if ($scope.accounts != null)
            for (const account of $scope.accounts)
                totalBalance += account.token.price * account.balance
        if ($scope.orders != null)
            for (const order of $scope.orders)
                totalBalance += order.total
        return totalBalance
    }

    $scope.selectAccount = function (domain) {
        openTokenProfile(domain, $scope.refresh)
    }

    function subscribeAccount() {
        $scope.subscribe("account:" + user.username(), function (data) {
            showSuccess(str.you_have_received + " " + $scope.formatAmount(data.amount, data.domain))
            setTimeout(function () {
                new Audio("/mfm-wallet/dialogs/success/payment_success.mp3").play()
            })
            $scope.refresh()
        })
    }

    function subscribeNewOrders() {
        $scope.subscribe("new_order:" + user.username(), function (data) {
            showSuccess(str.new_p2p_order)
            setTimeout(function () {
                new Audio("/mfm-wallet/dialogs/success/payment_success.mp3").play()
            })
            $scope.refresh()
        })
    }

    function loadOrders() {
        if (user.username() != "") {
            postApi("user_orders_active", {
                address: user.username(),
            }, function (response) {
                $scope.orders = response.orders
                $scope.$apply()
            })
        }
    }

    function loadTrans() {
        postApi("transfers", {}, function (response) {
            $scope.trans = $scope.groupByTimePeriod(response.trans)
            $scope.$apply()
        })
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

    $scope.refresh = function () {
        loadTokens()
        loadOrders()
        loadTrans()
    }

    if (user.username() != "") {
        $scope.refresh()
    } else {
        openLogin(function () {
            $scope.refresh()
            subscribeAccount()
            subscribeNewOrders()
        })
    }
}