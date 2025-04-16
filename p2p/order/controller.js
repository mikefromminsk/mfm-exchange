function openOrder(order_id, success) {
    trackCall(arguments)
    showDialog("p2p/order", success, function ($scope) {
        $scope.payments = window.payment_types

        $scope.sentMoney = function () {
            $scope.startRequest()
            getPin(function (pin) {
                calcPass(wallet.gas_domain, pin, function (pass) {
                    postApi("p2p/order_sent", {
                        order_id: order_id,
                        pass: pass
                    }, function () {
                        $scope.finishRequest()
                        showSuccessDialog(str.status_updated, $scope.refresh)
                    }, $scope.finishRequest)
                })
            })
        }

        $scope.finishOrder = function () {
            $scope.startRequest()
            getPin(function (pin) {
                calcPass(wallet.gas_domain, pin, function (pass) {
                    postApi("p2p/order_finish", {
                        order_id: order_id,
                        pass: pass
                    }, function () {
                        $scope.finishRequest()
                        showSuccessDialog(str.status_updated, $scope.refresh)
                    }, $scope.finishRequest)
                })
            })
        }

        $scope.cancelOrder = function () {
            openAskSure(str.are_you_sure, str.yes, str.no, function () {
                postApi("p2p/order_cancel", {
                    order_id: order_id
                }, function () {
                    showSuccessDialog(str.status_updated, $scope.refresh)
                })
            })
        }

        $scope.refresh = function () {
            postApi("p2p/order", {
                order_id: order_id
            }, function (response) {
                $scope.order = response.order
                $scope.$apply()
            })
        }

        $scope.refresh()
    })
}