<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-token/utils.php";

// ограничитель на количество запросов в секунду
// получать список доменов с аккаунта спредбота и квоты с спредбот
$domain = get_required(domain);

$bookcount = 20;
$orderbook = getOrderbook($domain, $bookcount);

$usdt_need = 10;

$address = exchange_ . $domain . _bot_spred;
$token_price = getCandleLastValue($domain . _price);

tokenScriptReg(usdt, exchange_ . $domain . _bot_spred, "mfm-exchange/bots/bot_spred.php");
tokenScriptReg($domain, exchange_ . $domain . _bot_spred, "mfm-exchange/bots/bot_spred.php");

$response[success] = false;

$order_usdt_buy = 0;
foreach ($orderbook[buy] as $order) {
    if ($order[price] >= $token_price * 0.97) {
        $order_usdt_buy += $order[amount] * $order[price];
    }
}

$amount_buy = round($usdt_need - $order_usdt_buy, 2);
if ($amount_buy > 0) {
    $order_max_price = $token_price - 0.01;
    $order_min_price = round($order_max_price * 0.98, 2);
    //echo $order_min_price . " " . $order_max_price . " " . $amount_buy . "\n";
    placeRange($domain, $order_min_price, $order_max_price, 3, $amount_buy, 0, $address);
    $response[success] = true;
}

$order_usdt_sell = 0;
foreach (array_reverse($orderbook[sell]) as $order) {
    if ($order[price] <= $token_price * 1.03) {
        $order_usdt_sell += $order[amount] * $order[price];
    }
}
$amount_sell = round($usdt_need - $order_usdt_sell, 2);
if ($amount_sell > 0) {
    $order_min_price = $token_price + 0.01;
    $order_max_price = round($order_min_price * 1.02, 2);
    //echo $order_min_price . " " . $order_max_price . " " . $amount_sell . "\n";
    placeRange($domain, $order_min_price, $order_max_price, 3, $amount_sell, 1, $address);
    $response[success] = true;
}


commit($response);