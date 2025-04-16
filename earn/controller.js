function openEarn(domain, success) {
    if (domain == "usdt")
        domain = "vavilon"
    trackCall(arguments)
    showDialog("earn", function () {
            if (worker)
                worker.terminate()
            if (rewardTimer) {
                clearInterval(rewardTimer)
                rewardTimer = null
            }
            if (success)
                success()
        }, function ($scope) {
            $scope.domain = domain
            $scope.menu = ["staking", "mining", "quiz"]
            $scope.selectedIndex = 1

            $scope.backToMain = function () {
                if ($scope.selectedIndex != 1)
                    $scope.selectTab(1)
                else
                    $scope.close()
            }

            $scope.selectTab = function (tab) {
                $scope.selectedIndex = tab
                if (tab == 0) {
                    addStaking($scope, $scope.domain)
                } else if (tab == 1) {
                    addMining($scope, $scope.domain)
                } else if (tab == 2) {
                    addPools($scope, $scope.domain)
                }
                swipeToRefresh($scope.backToMain)
            }
            $scope.selectTab($scope.selectedIndex)

        }
    )
}
