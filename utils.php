<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-token/utils.php";


function placeAndCommit($domain, $address, int $is_sell, $price, $amount, $pass = ":")
{
    requestEquals("/mfm-exchange/exchange.php", [
        action => place,
        domain => $domain,
        address => $address,
        is_sell => "$is_sell",
        price => $price,
        amount => $amount,
        pass => $pass,
    ]);
}

function place($domain, $address, int $is_sell, $price, $amount, $pass = ":")
{
    tokenScriptReg($domain, exchange_ . $domain, "mfm-exchange/exchange.php");
    tokenScriptReg(usdt, exchange_ . $domain, "mfm-exchange/exchange.php");

    if ($price !== round($price, 2)) error("price tick is 0.01");
    if ($amount !== round($amount, 2)) error("amount tick is 0.01");
    if ($price <= 0) error("price less than 0");
    if ($amount <= 0) error("amount less than 0");
    $total = round($price * $amount, 4);
    $timestamp = time();

    if ($is_sell == 1) {
        $coin_not_filled = $amount;
        $usdt_to_get = 0;
        tokenSend($domain, $address, exchange_ . $domain, $amount, $pass);
        foreach (select("select * from orders where `domain` = '$domain' and is_sell = 0 and price >= $price and status = 0 order by price DESC,timestamp") as $order) {
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
        if ($coin_not_filled == 0) {
            tokenSend(usdt, exchange_ . $domain, $address, $usdt_to_get);
        }
        $order_id = insertRowAndGetId(orders, [address => $address, domain => $domain, is_sell => $is_sell,
            price => $price, amount => $amount, filled => $amount - $coin_not_filled,
            status => $coin_not_filled == 0 ? 1 : 0, timestamp => $timestamp]);
    } else {
        $usdt_not_filled = $total;
        $coin_to_get = 0;
        tokenSend(usdt, $address, exchange_ . $domain, $total, $pass);
        foreach (select("select * from orders where `domain` = '$domain' and is_sell = 1 and price <= $price and status = 0 order by price,timestamp") as $order) {
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
        if ($usdt_not_filled == 0) {
            tokenSend($domain, exchange_ . $domain, $address, $coin_to_get);
        }
        $order_id = insertRowAndGetId(orders, [address => $address, domain => $domain, is_sell => $is_sell,
            price => $price, amount => $amount, filled => round(($total - $usdt_not_filled) / $price, 2),
            status => $usdt_not_filled == 0 ? 1 : 0, timestamp => $timestamp]);
    }

    if ($last_trade_price != null) {
        tokenSetVolume($domain, $trade_volume);
        tokenSetPrice($domain, $last_trade_price);
    }

    broadcast(orderbook, [
        domain => $domain,
    ]);

    return $order_id;
}

function cancel($order_id)
{
    $order = selectRowWhere(orders, [order_id => $order_id]);
    if ($order[status] != 0) error("order already finished");
    if ($order[is_sell] == 1) {
        tokenSend($order[domain], exchange_ . $order[domain], $order[address], $order[amount]);
    } else {
        tokenSend(usdt, exchange_ . $order[domain], $order[address], round($order[price] * $order[amount], 2));
    }
    updateWhere(orders, [status => 1], [order_id => $order_id]);
}

function cancelAllAndCommit($domain, $address)
{
    requestEquals("/mfm-exchange/exchange.php", [
        action => cancelAll,
        domain => $domain,
        address => $address,
    ]);
}

function cancelAll($domain, $address)
{
    $orders = ordersActive($domain, $address);
    foreach ($orders as $order) {
        cancel($order[order_id]);
    }
}

function ordersActive($domain, $address)
{
    $orders = select("select * from orders where `domain` = '$domain' and address = '$address' and status = 0 order by timestamp DESC");
    return array_reverse($orders);
}

function ordersHistory($domain, $address)
{
    $orders = select("select * from orders where `domain` = '$domain' and address = '$address' and status <> 0 order by timestamp DESC limit 0, 20");
    return array_reverse($orders);
}


function placeRange($domain, $min_price, $max_price, $count, $amount_usdt, $is_sell, $address, $pass = ":")
{
    if ($min_price <= 0) error("min_price less than 0");
    if ($max_price <= 0) error("max_price less than 0");
    if ($min_price >= $max_price) error("min_price is greater than max_price");
    if ($count <= 0) error("count less than 0");
    if ($amount_usdt <= 0) error("amount_usdt less than 0");

    if ($amount_usdt < 0.01 * $count) {
        $price = ($is_sell == 1) ? $min_price : $max_price;
        $amount_base = round($amount_usdt / $price, 2);
        if ($amount_base > 0) {
            placeAndCommit($domain, $address, $is_sell, $price, $amount_base, $pass);
        }
    } else {
        $price = $min_price;
        $price_step = round(($max_price - $min_price) / ($count - 1), 2);
        $amount_step = $amount_usdt / $count;

//        echo $amount_usdt . "\n";
//        echo $is_sell . "\n";
//        echo $min_price . "\n";
//        echo $max_price . "\n";
        $sum_amount = 0;
        for ($i = 0; $i < $count; $i++) {
            $price = round($price, 2);
            $amount_base = round($amount_step / $price, 2);
            $sum_amount += ($price * $amount_base);
            if ($i == $count - 1 && $sum_amount < $amount_usdt) {
                while ($sum_amount < $amount_usdt) {
                    $amount_base += 0.01;
                    $sum_amount += $price * 0.01;
                }
            }
            if ($amount_base > 0) {
                //echo $sum_amount . " $price $amount_base\n";
                placeAndCommit($domain, $address, $is_sell, $price, $amount_base, $pass);
            }

            $price += $price_step;
        }
    }
}

function getPriceLevels($domain, $is_sell, $count)
{
    $levels = select("select price, sum(amount) - sum(filled) as amount from orders "
        . " where `domain` = '$domain' and is_sell = $is_sell and status = 0"
        . " group by price order by price " . ($is_sell == 1 ? ASC : DESC) . " limit $count");
    if ($levels == null) return [];
    return $levels;
}

function tokenSetPrice($domain, $price)
{
    $last_trade_price = getCandleLastValue($domain . _price);
    if ($price != $last_trade_price) {
        trackLinear($domain . _price, $price);
        broadcast(price, [
            domain => $domain,
            price => $price,
        ]);
    }
}

function tokenPrice($domain)
{
    return getCandleLastValue($domain . _price) ?: 1;
}


function tokenSetVolume($domain, $volume)
{
    trackAccumulate($domain . _volume, $volume);
}

function tokenVolume24($domain)
{
    return getCandleChange24($domain . _volume);
}

function botScriptReg($domain, $bot_address)
{
    $place_script = "mfm-exchange/exchange.php";
    tokenScriptReg($domain, $bot_address, $place_script);
    return tokenScriptReg(get_required(gas_domain), $bot_address, $place_script);
}