<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-exchange/utils.php";

$gas_domain = get_required(gas_domain);
$domains = getDomains(bot_spred);

foreach ($domains as $domain) {
    if ($domain != $gas_domain) {

        $orderbook = getOrderbook($domain, 20);
        $quote_need = 10;

        $address_base = bot_spred;
        $address_usdt = bot_spred_ . $domain;
        $token_price = tokenPrice($domain) ?: 1;

        $order_usdt_buy = 0;
        foreach ($orderbook[buy] as $order) {
            if ($order[price] >= $token_price * 0.97) {
                $order_usdt_buy += $order[amount] * $order[price];
            }
        }
        $amount_buy = round($quote_need - $order_usdt_buy, 2);
        if ($amount_buy > 0) {
            $order_max_price = $token_price - 0.01;
            $order_min_price = round($order_max_price * 0.98, 2);
            //echo $order_min_price . " " . $order_max_price . " " . $amount_buy . "\n";
            placeRange($domain, $order_min_price, $order_max_price, 3, $amount_buy, 0, $address_usdt);
        }

        $order_usdt_sell = 0;
        foreach (array_reverse($orderbook[sell]) as $order) {
            if ($order[price] <= $token_price * 1.03) {
                $order_usdt_sell += $order[amount] * $order[price];
            }
        }
        $amount_sell = round($quote_need - $order_usdt_sell, 2);
        if ($amount_sell > 0) {
            $order_min_price = $token_price + 0.01;
            $order_max_price = round($order_min_price * 1.02, 2);
            //echo $order_min_price . " " . $order_max_price . " " . $amount_sell . "\n";
            placeRange($domain, $order_min_price, $order_max_price, 3, $amount_sell, 1, $address_base);
        }
    }
}

commit();