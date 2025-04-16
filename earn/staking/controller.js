let rewardTimer = null

function addStaking($scope, domain) {

    $scope.$watch("amount", function (newValue) {
        if (newValue != null)
            $scope.amount = $scope.round($scope.amount)
    })

    $scope.openStake = function () {
        getPin(function (pin) {
            calcPass(domain, pin, function (pass) {
                $scope.startRequest()
                postContract("mfm-token", "stake", {
                    domain: domain,
                    amount: $scope.amount,
                    address: user.login(),
                    pass: pass,
                }, function (response) {
                    showSuccessDialog(str.you_have_staked + " " + $scope.formatAmount(response.staked, domain), init)
                    $scope.finishRequest()
                }, $scope.finishRequest)
            })
        })
    }

    $scope.openUnstake = function () {
        getPin(function (pin) {
            calcPass(domain, pin, function (pass) {
                $scope.startRequest()
                postContract("mfm-token", "unstake", {
                    domain: domain,
                    address: user.login(),
                    pass: pass,
                }, function (response) {
                    $scope.finishRequest()
                    showSuccessDialog(str.you_have_unstaked + " " + $scope.formatAmount(response.unstaked, domain), init)
                }, $scope.finishRequest)
            })
        })
    }

    $scope.setMax = function () {
        $scope.amount = $scope.account.balance
    }

    $scope.updateReward = function () {
        if ($scope.stake == null) return
        let SEC_IN_DAY = 60 * 60 * 24
        let period_percent = (new Date() / 1000 - $scope.stake.time) / SEC_IN_DAY / $scope.period_days
        $scope.reward = $scope.stake.amount * $scope.percent / 100 * period_percent
        $scope.$apply()
    }

    $scope.getStakes = function () {
        postContract("mfm-token", "staked", {
            address: user.login(),
        }, function (response) {
            $scope.stake = null
            $scope.reward = null
            $scope.period_days = response.period_days
            $scope.percent = response.percent
            for (const stake_tran of response.staked) {
                if (stake_tran.domain == domain) {
                    $scope.stake = stake_tran
                    if (rewardTimer == null)
                        rewardTimer = setInterval($scope.updateReward, 1000)
                    $scope.updateReward()
                    break
                }
            }
            $scope.$apply()
        })
    }

    $scope.getBank = function () {
        postContract("mfm-token", "account", {
            domain: domain,
            address: wallet.STAKING_ADDRESS,
        }, function (response) {
            $scope.bank = response.account
            $scope.$apply()
        })
    }

    $scope.refresh = function () {
        $scope.getBank()
        getAccount(domain, function (response) {
            $scope.getStakes()
            $scope.token = response.token
            $scope.account = response.account
            $scope.$apply()
        })
    }

    $scope.refresh()
}