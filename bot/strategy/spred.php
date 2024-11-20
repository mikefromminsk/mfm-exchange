<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-exchange/utils.php";

$domain = get_required(domain);
$bot_address = "bot_" . getScriptName() . "_" . $domain;
if (botScriptReg($domain, $bot_address)) {
    commit();
}

$gas_domain = get_required(gas_domain);

$coin_balance = tokenBalance($domain, $bot_address);
$gas_balance = tokenBalance($gas_domain, $bot_address);
if ($coin_balance < 5 || $gas_balance < 5) {
    cancelAllAndCommit($domain, $bot_address);
    error("cancel all");  // leak of order amount
}

$sell_price_levels = getPriceLevels($domain, 1, 20);
$buy_price_levels = getPriceLevels($domain, 0, 20);

if (sizeof($sell_price_levels) > 0 && sizeof($buy_price_levels) > 0) {
    $is_sell = rand(0, $coin_balance * 100 + $gas_balance * 100) <= $coin_balance * 100 ? 1 : 0;
    $price = round(tokenPrice($domain) * ($is_sell == 1 ? 0.97 : 1.03), 2);
    $amount = round(1 / $price, 2);
    placeAndCommit($domain, $bot_address, $is_sell, $price, $amount, $amount * $price);
}

$best_sell_price = sizeof($sell_price_levels) > 0 ? $sell_price_levels[0][price] : 0;
$best_buy_price = sizeof($buy_price_levels) > 0 ? $buy_price_levels[0][price] : 0;
if ($best_sell_price == 0 || $best_buy_price == 0) {
    $token_price = max($best_sell_price, $best_buy_price);
} else {
    $token_price = ($best_sell_price + $best_buy_price) / 2;
}
$token_price = $token_price == 0 ? 1 : $token_price;

$order_usdt_buy = 0;
foreach ($buy_price_levels as $level) {
    if ($level[price] >= $token_price * 0.97) {
        $order_usdt_buy += $level[amount] * $level[price];
    }
}
$quote_need = 10;
$amount_buy = round($quote_need - $order_usdt_buy, 2);
$order_count = 6;
if ($amount_buy > 0) {
    $order_max_price = round($token_price - 0.01, 2);
    $order_min_price = round($order_max_price * (1 - 0.01 * $order_count), 2);
    //echo $order_min_price . " " . $order_max_price . " " . $amount_buy . "\n";
    placeRange($domain, $order_min_price, $order_max_price, $order_count, $amount_buy, 0, $bot_address);
}

$order_usdt_sell = 0;
foreach ($sell_price_levels as $level) {
    if ($level[price] <= $token_price * 1.03) {
        $order_usdt_sell += $level[amount] * $level[price];
    }
}
$amount_sell = round($quote_need - $order_usdt_sell, 2);
if ($amount_sell > 0) {
    $order_min_price = round($token_price + 0.01, 2);
    $order_max_price = round($order_min_price * (1 + 0.01 * $order_count), 2);
    //echo $order_min_price . " " . $order_max_price . " " . $amount_sell . "\n";
    placeRange($domain, $order_min_price, $order_max_price, $order_count, $amount_sell, 1, $bot_address);
}

commit();