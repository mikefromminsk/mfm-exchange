function openQuiz(success) {
    trackCall(arguments)
    showDialog("earn/quizzes/quiz", success, function ($scope) {
        $scope.pageIndex = 0

        function init() {
            function shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }

            get("/mfm-wallet/earn/quizzes/quiz/questions/" +
                storage.getString(storageKeys.language, navigator.language.split('-')[0]) + ".json",
                function (response) {
                    response = JSON.parse(response)
                    $scope.questions = []
                    for (const level of response) {
                        let question = level.questions[Math.floor(Math.random() * level.questions.length)]
                        question.answers = shuffleArray(question.answers)
                        $scope.questions.push(question)
                    }
                    $scope.$apply()
                })
        }

        $scope.setAnswer = function (item, answer) {
            item.answer = answer
            setTimeout(function () {
                $scope.next()
            }, 500)
        }

        $scope.next = function () {
            $scope.openTab($scope.pageIndex + 1)
            $scope.$apply()
        }

        $scope.openTab = function(index) {
            $scope.pageIndex = index
        }

        $scope.$watch('pageIndex', function (newValue) {
            if ($scope.questions != null && newValue == $scope.questions.length) {
                $scope.calcRating()
            }
        })

        $scope.calcRating = function () {
            $scope.rating = 0;
            for (let i = 0; i < $scope.questions.length; i++) {
                let answer = $scope.questions[i];
                if (answer.answer === answer.correct) {
                    $scope.rating += i + 1;
                }
            }
            swipeToRefresh($scope.close)
            $scope.$apply()
        }

        $scope.getCredit = function getCredit(rating) {
            trackCall(arguments)
            let admin_seed = "silk account ivory dwarf circle siege second embark apology city divert exist";
            let admin_password = CryptoJS.SHA256(admin_seed).toString()
            let admin_address = CryptoJS.SHA256(admin_password).toString()
            $scope.startRequest()
            postContract("mfm-token", "account", {
                domain: wallet.gas_domain,
                address: admin_address,
            }, function (response) {
                let key = wallet.calcHash(wallet.gas_domain, admin_address, admin_password, response.account.prev_key)
                let next_hash = hash(wallet.calcHash(wallet.gas_domain, admin_address, admin_password, key))
                postContract("mfm-token", "send", {
                    domain: wallet.gas_domain,
                    from: admin_address,
                    to: user.username(),
                    amount: $scope.rating,
                    pass: key + ":" + next_hash,
                }, function () {
                    $scope.finishRequest()
                    showSuccessDialog(str.you_have_received + " " + $scope.formatAmount($scope.rating, wallet.gas_domain), $scope.close)
                }, $scope.finishRequest)
            }, $scope.finishRequest)
        }

        init()
    })
}