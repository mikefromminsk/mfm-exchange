<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-exchange/utils.php";

$gas_domain = get_required(gas_domain);
$domains = getDomains(bot_spred);

foreach ($domains as $domain) {
    if ($domain != $gas_domain) {

        $sell_price_levels = getPriceLevels($domain, 1, 20);
        $buy_price_levels = getPriceLevels($domain, 0, 20);
        $quote_need = 10;

        $address_base = bot_spred;
        $address_usdt = bot_spred_ . $domain;
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
        $amount_buy = round($quote_need - $order_usdt_buy, 2);
        if ($amount_buy > 0) {
            $order_max_price = $token_price - 0.01;
            $order_min_price = round($order_max_price * 0.98, 2);
            //echo $order_min_price . " " . $order_max_price . " " . $amount_buy . "\n";
            placeRange($domain, $order_min_price, $order_max_price, 3, $amount_buy, 0, $address_usdt);
        }

        $order_usdt_sell = 0;
        foreach ($sell_price_levels as $level) {
            if ($level[price] <= $token_price * 1.03) {
                $order_usdt_sell += $level[amount] * $level[price];
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