function openLogin(success) {
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
                let token = hash($scope.password)
                postApi("login", {
                    login: $scope.username,
                    token: token,
                }, function () {
                    user.saveLogin(token)
                    $scope.close()
                })
            }
            $scope.pressEnter($scope.login)
        }
    )
}