window.payment_types = {
    "Blik": str.phone_number_blik,
    "PKOBank": str.bank_card_number,
    "TRON": str.usdt_trc20_address,
}

function openPaymentAdd(success) {
    trackCall(arguments)
    showDialog("products/p2p/payment", success, function ($scope) {
        $scope.payments = window.payment_types

        $scope.tabIndex = 0
        $scope.paymentTypeSelect = function (payment) {
            getPin(function (pin) {
                calcPass(wallet.gas_domain, pin, function (pass) {
                    postApi("p2p/payment_add", {
                        address: user.login(),
                        payment: payment,
                        pass: pass,
                    }, function () {
                        $scope.payment = payment
                        $scope.tabIndex = 1
                        $scope.$apply()
                    })
                })
            })
        }

        $scope.paymentTypeSubmit = function () {
            storage.setString($scope.payment, $scope.payment_id)
            storage.setString(storageKeys.default_payment_type, $scope.payment)
            showSuccessDialog(str.payment_added, $scope.close)
        }
    })
}