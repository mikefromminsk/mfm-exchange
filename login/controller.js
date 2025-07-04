function openLogin(success) {
    trackCall(arguments)
    showDialog("login", success, function ($scope) {
            $scope.username = ""
            if (DEBUG) {
                $scope.username = "user3"
                $scope.password = "pass"
            }

            if ($scope.username == "") {
                setTimeout(function () {
                    document.getElementById('login_address').focus();
                }, 500)
            }

            $scope.login = function () {
                $scope.in_progress = true
                let token = hash($scope.username + $scope.password)
                tradeApi("login", {
                    username: $scope.username,
                    token: token,
                }, function () {
                    user.saveUsername($scope.username)
                    user.saveToken(token)
                    $scope.close()
                })
            }
            $scope.pressEnter($scope.login)
        }
    )
}