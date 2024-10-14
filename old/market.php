<?php

function placeMarket($order_type, $domain, $address, int $is_sell, $price, $amount, $total, $pass = ":")
{
    tokenScriptReg($domain, exchange_ . $domain, "mfm-exchange/place.php");
    tokenScriptReg(usdt, exchange_ . $domain, "mfm-exchange/place.php");

    function getOrders($domain, $is_sell, $count)
    {
        $sql = "select * from orders where 1=1"
            . " and `domain` = '$domain'"
            . " and `is_sell` = $is_sell"
            . " and `status` = 0";
        if ($is_sell == 1) {
            $sql .= " order by price DESC,timestamp";
        } else {
            $sql .= " order by price,timestamp";
        }
        $sql .= " limit $count";
        return select($sql);
    }

    function testNumber($number)
    {
        if ($number != round($number, 2)) error("tick is 0.01");
        if ($number <= 0) error("less than 0");
    }

    if ($order_type == limit) {
        testNumber($price);
        testNumber($amount);
        if ($is_sell == 1) {
            $total = round($price * $amount, 2);
        }
    }

    if ($order_type == market) {
        if ($is_sell == 1) {
            testNumber($amount);
        } else {
            testNumber($total);
        }
    }

    $timestamp = time();

    if ($is_sell == 1) {
        $coin_not_filled = $amount;
        $usdt_to_get = 0;
        tokenSend($domain, $address, exchange_ . $domain, $amount, $pass);
        foreach (getOrders($domain, $is_sell, 20) as $order) {
            $order_coin_not_filled = round($order[amount] - $order[filled], 2);
            $coin_to_fill = min($coin_not_filled, $order_coin_not_filled);
            $order_filled = $order_coin_not_filled == $coin_to_fill ? 1 : 0;
            updateWhere(orders, [filled => $order[filled] + $coin_to_fill, status => $order_filled], [order_id => $order[order_id]]);
            if ($order_filled == 1) {
                tokenSend($domain, exchange_ . $domain, $order[address], $order[amount]);
            }
            $last_trade_price = $order[price];
            $trade_volume += round($coin_to_fill * $order[price], 4);
            $coin_not_filled = round($coin_not_filled - $coin_to_fill, 2);
            $usdt_to_get += round($coin_to_fill * $order[price], 2);
            if ($coin_not_filled == 0)
                break;
        }
        if ($order_type == limit) {
            if ($coin_not_filled == 0) {
                tokenSend(usdt, exchange_ . $domain, $address, $usdt_to_get);
            }
            insertRowAndGetId(orders, [address => $address, domain => $domain, is_sell => $is_sell,
                price => $price, amount => $amount, filled => $amount - $coin_not_filled,
                status => $coin_not_filled == 0 ? 1 : 0, timestamp => $timestamp]);
        }
        if ($order_type == market) {
            tokenSend(usdt, exchange_ . $domain, $address, $usdt_to_get);
            tokenSend($domain, exchange_ . $domain, $address, $coin_not_filled);
        }
    } else {
        $usdt_not_filled = $total;
        $coin_to_get = 0;
        tokenSend(usdt, $address, exchange_ . $domain, $total, $pass);
        foreach (getOrders($domain, $is_sell, 20) as $order) {
            $coin_not_filled = $usdt_not_filled / $order[price];
            $order_coin_not_filled = round($order[amount] - $order[filled], 2);
            $coin_to_fill = min($coin_not_filled, $order_coin_not_filled);
            $order_filled = $order_coin_not_filled == $coin_to_fill ? 1 : 0;
            updateWhere(orders, [filled => $order[filled] + $coin_to_fill, status => $order_filled], [order_id => $order[order_id]]);
            if ($order_filled == 1) {
                tokenSend(usdt, exchange_ . $domain, $order[address], round($order[amount] * $order[price], 2));
            }
            $last_trade_price = $order[price];
            $trade_volume += round($coin_to_fill * $order[price], 4);
            $coin_not_filled = round($coin_not_filled - $coin_to_fill, 2);
            $usdt_not_filled = round($coin_not_filled * $order[price], 2);
            $coin_to_get += $coin_to_fill;
            if ($usdt_not_filled == 0)
                break;
        }
        if ($order_type == limit) {
            if ($usdt_not_filled == 0) {
                tokenSend($domain, exchange_ . $domain, $address, $coin_to_get);
            }
            insertRowAndGetId(orders, [address => $address, domain => $domain, is_sell => $is_sell,
                price => $price, amount => $amount, filled => round(($total - $usdt_not_filled) / $price, 2),
                status => $usdt_not_filled == 0 ? 1 : 0, timestamp => $timestamp]);
        }
        if ($order_type == market) {
            tokenSend(usdt, exchange_ . $domain, $address, $usdt_not_filled);
            tokenSend($domain, exchange_ . $domain, $address, $coin_to_get);
        }
    }

    if ($last_trade_price != null) {
        tokenSetVolume($domain, $trade_volume);
        tokenSetPrice($domain, $last_trade_price);
    }

    broadcast(orderbook, [
        domain => $domain,
    ]);

}