<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-token/utils.php";

$domain = get_string("domain", rock);

$coins_in_sell_orders = scalar("select sum(amount - amount_filled) from `orders` where `domain` = '$domain' and `status` = 0 and `is_sell` = 1");
$coins_in_buy_orders = scalar("select sum(amount_filled) from `orders` where `domain` = '$domain' and `status` = 0 and `is_sell` = 0");
$coins_in_orders = $coins_in_sell_orders + $coins_in_buy_orders;
$coins_in_orders = round($coins_in_orders, 2);
$address = exchange_ . $domain;
$coins_in_balance = tokenBalance($domain, $address);

if ($coins_in_orders != $coins_in_balance) {
    error("Coins in orders $coins_in_orders and coins in balance $coins_in_balance are not equal");
}


$usdt_in_sell_orders = scalar("select sum(total - total_filled) from `orders` where `domain` = '$domain' and `status` = 0 and `is_sell` = 0");
$usdt_in_buy_orders = scalar("select sum(total_filled) from `orders` where `domain` = '$domain' and `status` = 0 and `is_sell` = 1");
$usdt_in_orders = $usdt_in_sell_orders + $usdt_in_buy_orders;
$usdt_in_orders = round($usdt_in_orders, 2);
$address = exchange_ . $domain;
$usdt_in_balance = tokenBalance(usdt, $address);

if ($usdt_in_orders != $usdt_in_balance) {
    error("usdt in orders $usdt_in_orders and usdt in balance $usdt_in_balance are not equal");
}