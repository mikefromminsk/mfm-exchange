function openPumpSettings(domain, success) {
    showDialog('/mfm-exchange/bot/pump/settings/index.html', success, function ($scope) {
            addFormats($scope)

            $scope.domain = domain
            $scope.multiplicator = 1

            $scope.generateStartN = function () {
                $scope.startN = Math.floor(Math.random() * 1000)
                $scope.loadChart()
            }

            $scope.generateMultiplicator = function () {
                $scope.multiplicator = Math.floor(Math.random() * 100) / 100
                $scope.loadChart()
            }

            function loadPumpVals() {
                dataGet("exchange/pump/" + domain + "/startN", function (val) {
                    $scope.startN = val
                    $scope.$apply()
                    if (val != null)
                        $scope.loadChart()
                })
                dataGet("exchange/pump/" + domain + "/multiplicator", function (val) {
                    $scope.multiplicator = val
                    $scope.$apply()
                    if (val != null)
                        $scope.loadChart()
                })

            }

            $scope.savePumpVals = function () {
                postContractWithGas("mfm-exchange", "bots/bot_pump_init.php", {
                    domain: domain,
                    multiplicator: $scope.multiplicator,
                    startN: $scope.startN,
                }, function () {
                    showSuccess("Saved", init)
                })
            }

            $scope.loadChart = function () {
                /*postContract("mfm-exchange", "bots/bot_pump_chart.php", {
                    domain: domain,
                    startN: $scope.startN,
                    multiplicator: $scope.multiplicator,
                }, function (response) {
                    for (var i = 0; i < response.chart.length; i++) {
                        response.chart[i].time =
                            new Date(response.chart[i].time * 1000 + (i * 60 * 60 * 24 * 1000)).toJSON().slice(0, 10)
                    }
                    lineSeries.setData(response.chart)
                })*/
            }

            var lineSeries
            function initChart() {
                /*setTimeout(function () {
                    if (lineSeries == null)
                        lineSeries = createChart("priceChart").addLineSeries();
                })*/
            }


            $scope.balances = {}

            function getBalance(domain, address) {
                dataGet(domain + "/mfm-wallet/" + address + "/amount", function (amount) {
                    $scope.balances[domain + address] = {
                        amount: amount,
                        address: address,
                        domain: domain,
                    }
                    $scope.$apply()
                }, function () {
                    $scope.balances[domain + address] = {
                        amount: 0,
                        address: address,
                        domain: domain,
                    }
                    $scope.$apply()
                })
            }

            $scope.initilize = function () {
                postContractWithGas("mfm-exchange", "api/exchange/init.php", {}, function () {
                    showSuccess("Initilized", init)
                })
            }

            function init() {
                getBalance("mfm-bank", "exchange_" + domain + "_bot_spred")
                getBalance(domain, "exchange_" + domain + "_bot_spred")
                /*getBalance("mfm-bank", "exchange_" + domain + "_bot_pump")
                getBalance(domain, "exchange_" + domain + "_bot_pump")*/
                loadPumpVals()
                initChart()
            }

            $scope.send = function (domain, address, amount) {
                openSend(domain, address, amount, init)
            }


            init()

    })
}