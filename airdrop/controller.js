function openAirdrop(promo, success) {
    trackCall(arguments)
    showDialog("airdrop", success, function ($scope) {
        $scope.promo = promo

        $scope.parseDomain = function () {
            if ($scope.promo != null && $scope.promo != "")
                $scope.domain = $scope.promo.split(":")[0]
        }

        $scope.receive = function () {
            if ($scope.promo != null && $scope.promo != "") {
                if ($scope.promo.indexOf(":") != -1) {
                    let domain = $scope.promo.split(":")[0]
                    let promoCode = $scope.promo.split(":")[1]
                    let password = hash(promoCode)
                    let address = hash(password)
                    $scope.startRequest()
                    getPin(function (pin) {
                        wallet.reg($scope.domain, pin, function () {
                            postContract("mfm-token", "account", {
                                domain: domain,
                                address: address,
                            }, function (response) {
                                let path = response.account.delegate.split("/")
                                let app = path.shift()
                                postContract(app, path.join("/"), {
                                    domain: domain,
                                    address: address,
                                    receiver: user.username(),
                                }, function (response) {
                                    $scope.finishRequest()
                                    showSuccessDialog(str.you_have_received + " " + $scope.formatAmount(response.received), $scope.back)
                                }, $scope.finishRequest)
                            })
                        }, $scope.finishRequest)
                    }, $scope.finishRequest)
                } else {
                    showError("Promo code invalid")
                }
            }
        }

        if (user.username() == "") {
            $scope.openLogin()
        } else {
            if (promo == null) {
                setTimeout(function () {
                    document.getElementById("enter_promo").focus()
                }, 100)
            }
        }

        $scope.pressEnter($scope.receive)
    })
}