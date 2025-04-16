function openDeposit(success) {
    trackCall(arguments)
    let depositCheckTimer
    showBottomSheet("products/deposit", function () {
        if (depositCheckTimer)
            clearInterval(depositCheckTimer)
        if (success)
            success()
    }, function ($scope) {
        $scope.chain = "TRON"

        function getDepositAddress() {
            postContract("mfm-data", "deposit/start", {
                address: user.login(),
                chain: $scope.chain,
            }, function (response) {
                $scope.min_deposit = response.min_deposit
                $scope.deadline = response.deadline
                $scope.deposit_address = response.deposit_address
                startDepositCheckTimer()
                $scope.$apply()
            }, function (response) {
                showError(response.message)
            })
        }

        $scope.share = function () {
            navigator.share({
                text: $scope.deposit_address,
            })
        }

        let CHECK_INTERVAL = 10
        $scope.countDownTimer = 0
        $scope.deposited = 0

        function startDepositCheckTimer() {
            depositCheck()
            $scope.countDownTimer = CHECK_INTERVAL
            depositCheckTimer = setInterval(function () {
                $scope.countDownTimer -= 1
                $scope.$apply()
                if ($scope.countDownTimer % CHECK_INTERVAL == 0) {
                    $scope.countDownTimer = CHECK_INTERVAL
                    depositCheck()
                }
            }, 1000)
        }

        function depositCheck() {
            postContract("mfm-data", "owner", {
                redirect: "mfm-data/deposit/check",
                deposit_address: $scope.deposit_address,
                chain: $scope.chain,
            }, function (response) {
                if (response.deposited > 0) {
                    showSuccessDialog("You deposited " + $scope.formatAmount(response.deposited, "USDT"))
                }
            })
        }

        function init(){
            getDepositAddress()
        }

        init()
    })
}