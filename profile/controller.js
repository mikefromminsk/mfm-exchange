function getAccount(domain, success, error) {
    postContract("mfm-token", "profile", {
        domain: domain,
        address: user.username(),
    }, success, error)
}

function openTokenProfile(domain, success) {
    trackCall(arguments)
    showDialog("profile", success, function ($scope) {
        $scope.domain = domain

        addChart($scope, domain + "_price", domain + "_volume")
        addTokenProfile($scope, domain)

        $scope.subscribe("price:" + domain, function (data) {
            $scope.token.price = data.price
            $scope.updateChart()
            $scope.$apply()
        })

        $scope.init = function () {
            $scope.loadTokenProfile(domain)

            tradeApi("balance", {
                domain: domain,
                address: user.username(),
            }, function (response) {
                $scope.balance = response.balance
                $scope.$apply()
            })

            postContract("mfm-token", "trans", {
                domain: domain,
                address: user.username(),
            }, function (response) {
                $scope.trans = $scope.groupByTimePeriod(response.trans)
                $scope.$apply()
            })
        }


        $scope.init()
    })
}

function addTokenProfile($scope) {

    $scope.loadTokenProfile = function (domain) {
        postContract("mfm-token", "token", {
            domain: domain,
        }, function (response) {
            $scope.token = response.token
            $scope.owner = response.owner
            $scope.mining = response.mining
            $scope.analytics = response.analytics
            $scope.$apply()
        })
    }
}