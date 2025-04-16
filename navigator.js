function addNavigator($scope) {

    $scope.getLanguage = function () {
        return getLanguage()
    }

    function historyBack() {
        historyStack.pop()
        window.history.pushState({}, document.title, historyStack[historyStack.length - 1])
    }

    function finish() {
        $scope.unsubscribeAll()
        $scope.removePressEnter()
        clearFocus()
    }

    $scope.scrollTo = function (id) {
        setTimeout(function () {
            document.getElementById(id).scrollIntoView({behavior: 'smooth'})
        }, 100)
    }

    $scope.back = function (result) {
        setTimeout(function () {
            window.$mdBottomSheet.hide(result)
            finish()
        }, 100)
    }

    $scope.close = function (result) {
        setTimeout(function () {
            window.$mdDialog.hide(result)
            finish()
            historyBack()
        }, 100)
    }

    $scope.swipeToRefreshDisable = function () {
        $scope.swipeToRefreshDisabled = true
    }

    $scope.copy = function (text) {
        let textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccess(str.copied)
    }

    $scope.check = function (value) {
        storage.setString(storageKeys.check_prefix + value, "true")
    }

    $scope.isChecked = function (value) {
        return storage.getString(storageKeys.check_prefix + value) == "true"
    }

    $scope.isNotChecked = function (value) {
        return !$scope.isChecked(value)
    }

    $scope.openLogin = function (success) {
        openLogin(success)
    }

    $scope.openTokenProfile = function (domain, success) {
        openTokenProfile(domain, success)
    }

    $scope.openSettings = function (success) {
        openSettings(success)
    }

    $scope.openLaunchToken = function (success) {
        openLaunchToken(success)
    }

    $scope.openDistribution = function (domain, success) {
        openDistribution(domain, success)
    }

    $scope.openDeposit = function (success) {
        openDeposit(success)
    }

    $scope.openWithdrawal = function (success) {
        openWithdrawal(success)
    }

    $scope.openSend = function (domain, to_address, amount, success) {
        openSend(domain, to_address, amount, success)
    }

    $scope.openEarn = function (success) {
        openEarn(success)
    }

    $scope.openAirdrop = function (promo, success) {
        openAirdrop(promo, success)
    }

    $scope.openChat = function (to, success) {
        openChat(to, success)
    }

    $scope.openMining = function (domain) {
        openMining(domain)
    }

    $scope.openBuy = function (domain) {
        openExchange(domain, 0)
    }

    $scope.openSell = function (domain) {
        openExchange(domain, 1)
    }

    $scope.openSearch = function (success) {
        openSearch(success)
    }

    $scope.openTokenSettings = function () {
        openLogoChange(domain, function (result) {
            if (result == "success")
                location.reload()
        })
    }

    $scope.openSite = function () {
        window.open("/" + domain)
    }

    $scope.openSupport = function () {
        window.open("https://t.me/vavilon_org_bot")
    }

    $scope.openShareLink = function (title, text, url) {
        if (navigator.share) {
            navigator.share({
                title: title,
                text: text,
                url: url,
            })
                .then(() => console.log('Successful share'))
                .catch((error) => console.log('Error sharing', error));
        }
    }

    $scope.openChart = function (key, success) {
        openChartWithAccumulate(key, null, success)
    }

    $scope.openChartWithAccumulate = function (key, accomulate, success) {
        openChartWithAccumulate(key, accomulate, success)
    }

    $scope.openChartWithAccumulate = function (key, success) {
        openChartWithAccumulate(key, key, success)
    }

    $scope.openPayOffCredit = function (success) {
        openPayOffCredit(success)
    }

    $scope.openTran = function (next_hash, success) {
        openTran(next_hash, success)
    }

    $scope.openDoc = function (path) {
        openDoc(path)
    }

    $scope.openExchange = function (domain) {
        openExchange(domain)
    }

    $scope.openDistribution = function (domain, success) {
        openDistribution(domain, success)
    }

    $scope.openAnalytics = function () {
        openAnalytics()
    }

    $scope.openReview = function () {
        openReview()
    }

    $scope.openReviews = function () {
        openReviews()
    }

    $scope.openLanguages = function () {
        openLanguages()
    }

    $scope.openAirdropCreate = function (domain, success) {
        openAirdropCreate(domain, success)
    }

    $scope.openExchangeBot = function (domain, success) {
        openExchangeBot(domain, success)
    }

    $scope.openP2P = function (success) {
        openP2P(success)
    }

    $scope.openOfferPlace = function (domain, success) {
        openOfferPlace(domain, success)
    }

    $scope.openPaymentAdd = function (domain, success) {
        openPaymentAdd(domain, success)
    }

    $scope.openOrderPlace = function (order_id, success) {
        openOrderPlace("" + order_id, success)
    }

    $scope.openOrder = function (order_id, success) {
        openOrder("" + order_id, success)
    }

    $scope.openP2PChat = function (order_id, success) {
        openP2PChat("" + order_id, success)
    }

    $scope.openP2PProfile = function (address, success) {
        openP2PProfile(address, success)
    }

    $scope.openSelectDomain = function (success) {
        openSelectDomain(success)
    }

    $scope.openVersion = function (success) {
        openVersion(success)
    }

    $scope.openQuiz = function (success) {
        openQuiz(success)
    }
}