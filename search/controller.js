function openSearch(success) {
    trackCall(arguments)
    showDialog("search", success, function () {
        setTimeout(function () {
            document.getElementById('search_input').focus()
        }, 500)
    })
}

function addSearch($scope) {
    $scope.recent = storage.getStringArray(storageKeys.search_history).reverse()

    $scope.openSearchResult = function found(domain) {
        trackCall(arguments)
        storage.pushToArray(storageKeys.search_history, domain, 4)
        openTokenProfile(domain)
    }

    $scope.search = function () {
        postContract("mfm-token", "search", {
            search_text: $scope.search_text,
        }, function (response) {
            $scope.search_result = response.tokens
            $scope.$apply()
        })
    }

    $scope.clear = function () {
        $scope.search_text = ""
        $scope.search_result = []
    }
}