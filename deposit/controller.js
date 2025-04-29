function openDeposit(domain, success) {
    trackCall(arguments)
    showDialog("deposit", success, function ($scope) {
        $scope.domain = domain

        $scope.setToken = function (domain) {
            if (domain || "" != "")
                $scope.domain = domain
        }

        $scope.setNetwork = function (network) {
            if (domain || "" != "") {
                $scope.network = network
                postApi("deposit", {
                    domain: domain,
                    network: network,
                }, function (response) {
                    drawQr(response.deposit_address)
                    $scope.deposit_address = response.deposit_address
                    $scope.$apply()
                })
            }
        }

        var qrcode = null;
        function drawQr(text){
            if (qrcode == null){
                qrcode = new QRCode(document.getElementById("qrcode"), {
                    text: text,
                    width: 128,
                    height: 128,
                    colorDark : "#1d2733",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                })
            } else {
                qrcode.makeCode(text)
            }
        }

        if (domain == null) {
            openSearch($scope.setNetwork)
        }
    })
}