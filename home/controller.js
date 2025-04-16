function openHome($scope) {

    $scope.refresh = function () {
        postApi("home", {
            //filter: $scope.selectedTop,
        }, function (response) {
            $scope.tokens = response.tokens
            $scope.showBody = true
            if (!DEBUG)
                startAnimation()
            $scope.$apply()
        })
    }

    $scope.swipeToRefresh = function () {
        $scope.refresh()
    }

    /*$scope.selectedTop = "top_exchange"
    $scope.selectTop = function (top) {
        $scope.selectedTop = top
        $scope.refresh()
    }*/

    $scope.refresh()

    $scope.slides = []
    $scope.addSlide = function (title, text, image) {
        $scope.slides.push({
            title: title,
            text: text,
            image: image,
        })
    }
    $scope.addSlide("VAVILON.org", str.first_multi_chain_network)
    $scope.addSlide("0%", str.only_miners_pays_fees)
    $scope.addSlide("1000 TPS", str.on_one_core)
    $scope.addSlide("5 min", str.need_for_integration)
    $scope.addSlide("WEB 3.0", str.start_now)

    $scope.slideIndex = 0
    $scope.lastAutoIndex = 0

    function startAnimation() {
        if ($scope.interval == null) {
            $scope.interval = setInterval(function () {
                if ($scope.lastAutoIndex != $scope.slideIndex) {
                    clearInterval($scope.interval)
                } else {
                    $scope.slideIndex = ($scope.slideIndex + 1) % $scope.slides.length
                    $scope.lastAutoIndex = $scope.slideIndex
                    $scope.$apply()
                }
            }, 5000)
        }
    }

    $scope.subscribe("price", function (data) {
        for (const token of $scope.tokens) {
            if (token.domain == data.domain) {
                token.price = data.price
                token.price24 = data.price24
                $scope.$apply()
                break
            }
        }
    })


}