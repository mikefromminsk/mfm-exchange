function openHome($scope) {

    $scope.searchEnabled = false

    $scope.searchToggle = function () {
        $scope.searchEnabled = !$scope.searchEnabled
        if ($scope.searchEnabled == false) {
            $scope.search_text = false
            $scope.search()
        }
    }

    addSearch($scope)

    const TOP_SEARCH = "top_search"
    $scope.selectedTop = TOP_SEARCH
    $scope.selectTop = function (filter) {
        if ($scope.selectedTop == filter) {
            $scope.selectedTop = TOP_SEARCH
        }
        $scope.selectedTop = filter
        if ($scope.selectedTop == TOP_SEARCH) {
            $scope.search()
        } else {
            tradeApi("top", {
                filter: $scope.selectedTop,
            }, function (response) {
                $scope.tokens = response.tokens
                $scope.$apply()
            })
        }
    }

    $scope.refresh = function () {
        $scope.search()
    }
    $scope.showBody = true

    $scope.swipeToRefresh = function () {
        $scope.refresh()
    }

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

    if (!DEBUG){
        startAnimation()
    }

    $scope.subscribe("price", function (data) {
        for (const token of ($scope.tokens || [])) {
            if (token.domain == data.domain) {
                token.price = data.price
                token.price24 = data.price24
                $scope.$apply()
                break
            }
        }
    })


}