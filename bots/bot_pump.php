<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/exchange/api/utils.php";

$domain = get_required(domain);
$address = get_required(address);
$password = get_required(password);


function getN($startN, $day)
{
    $n = $startN;
    for ($i = 0; $i < $day; $i++) {
        if ($n % 2 == 0) {
            $n = $n / 2;
        } else {
            $n = 3 * $n + 1;
        }
    }
    return $n;
}

$start_date = dataInfo([$domain])[data_time];
$startN = (float)dataGet([exchange, pump, $domain, startN]);
$multiplicator = (float)dataGet([exchange, pump, $domain, multiplicator]);

$n = $startN;

$day = round((time() - $start_date) / (24 * 60 * 60));
$priceMin = getN($n, $day);
$priceMax = getN($n, $day + 1);
$priceNowPercent = time() % (24 * 60 * 60) / (24 * 60 * 60);
$price_need = ($priceMax - $priceMin) * $priceNowPercent + $priceMin;
$price_need = round($price_need * $multiplicator, 2);

$token_price = getCandleLastValue($domain, price);

$orderbook = getOrderbook($domain, 20);

$usdt_max = 2;

if ($price_need < $token_price) {
    $amount_base = 0;
    $order_usdt_buy = 0;
    foreach ($orderbook[buy] as $order) {
        if ($order[price] >= $price_need && $order_usdt_buy < $usdt_max) {
            $order_usdt_buy += $order[amount] * $order[price];
            $amount_base += $order[amount];
            $price = $order[price];
        }
    }
    if ($price != null) {
        if ($order_usdt_buy > $usdt_max) {
            //echo "perebor $order_usdt_buy > $usdt_max\n";
            $amount_base -= ($order_usdt_buy - $usdt_max) / $price;
            //echo "minus $amount_base -= $order_usdt_buy - $usdt_max / $price\n";
        }
        $amount_base = round($amount_base, 2);
        //echo ($price * $amount_base) . " $price $amount_base\n";
        $key = tokenKey($domain, $address, $password, dataGet([$domain, token, $address, prev_key]));
        $next_hash = tokenNextHash($domain, $address, $password, $key);
        $response = http_post("localhost/" . $domain . "/api/exchange/place.php", [
            is_sell => "1",
            address => $address,
            price => $price,
            amount => $amount_base,
            key => $key,
            next_hash => $next_hash,
        ]);
    } else {
        $response[success] = false;
    }
} else if ($price_need > $token_price) {
    $amount_base = 0;
    $order_usdt_sell = 0;
    foreach (array_reverse($orderbook[sell]) as $order) {
        if ($order[price] <= $price_need && $order_usdt_sell < $usdt_max) {
            echo ($order[price] * $order[amount]) . " " . $order[price] . " " . $order[amount] . "\n";
            $order_usdt_sell += $order[amount] * $order[price];
            $amount_base += $order[amount];
            $price = $order[price];
        }
    }
    if ($price != null) {
        if ($order_usdt_sell > $usdt_max) {
            //echo "perebor $order_usdt_sell > $usdt_max\n";
            $amount_base -= ($order_usdt_sell - $usdt_max) / $price;
            //echo "minus $amount_base -= $order_usdt_sell - $usdt_max / $price\n";
        }
        $amount_base = round($amount_base, 2);
        //echo ($price * $amount_base) . " $price $amount_base\n";
        $key = tokenKey(usdt, $address, $password, dataGet([usdt, wallet, $address, prev_key]));
        $next_hash = tokenNextHash(usdt, $address, $password, $key);
        $response = http_post("localhost/" . $domain . "/api/exchange/place.php", [
            is_sell => "0",
            address => $address,
            price => $price,
            amount => $amount_base,
            key => $key,
            next_hash => $next_hash,
        ]);
    } else {
        $response[success] = false;
    }
} else {
    $response[success] = false;
}

commit($response);
