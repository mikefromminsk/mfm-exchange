function openOrderPlace(offer_id, success) {
    trackCall(arguments)
    showDialog("p2p/order_place", success, function ($scope) {
        addPriceAmountTotal($scope)

        $scope.payment = storage.getString(storageKeys.default_payment_type)
        $scope.payments = window.payment_types

        $scope.place = function () {
            $scope.startRequest()
            getPin(function (pin) {
                calcPass(wallet.gas_domain, pin, function (pass) {
                    tradeApi("p2p/order_place", {
                        offer_id: offer_id,
                        address: user.username(),
                        amount: $scope.amount,
                        payment: $scope.payment,
                        pass: pass
                    }, function (response) {
                        $scope.finishRequest()
                        showSuccessDialog(str.order_placed, function () {
                            $scope.close()
                            openOrder(response.order_id)
                        })
                    }, $scope.finishRequest)
                }, $scope.finishRequest)
            })
        }

        tradeApi("p2p/offer", {
            offer_id: offer_id
        }, function (response) {
            $scope.offer = response.offer
            $scope.changePrice($scope.offer.price)
            $scope.changeAmount($scope.offer.amount)
        })

        function init() {
            tradeApi("p2p/profile", {
                address: user.username(),
            }, function (response) {
                $scope.profile = response.profile
            }, function () {
                openPaymentAdd(function () {
                    $scope.payment = storage.getString(storageKeys.default_payment_type)
                    $scope.$apply()
                })
            })
        }

        init()
    })
}