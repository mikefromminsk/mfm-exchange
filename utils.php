<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-data/utils.php";


function placeAndCommit($domain, $address, int $is_sell, $price, $amount, $total, $pass = ":")
{
    http_post("/mfm-exchange/owner.php", [
        redirect => "mfm-exchange/place.php",
        domain => $domain,
        address => $address,
        is_sell => "$is_sell",
        price => $price,
        amount => $amount,
        total => $total,
        pass => $pass,
    ]);
}

function createOrder($address, $domain, $is_sell, $price, $amount, $total)
{
    return insertRowAndGetId(orders, [address => $address, domain => $domain, is_sell => $is_sell,
        price => $price, amount => $amount, total => $total, status => 2, timestamp => time()]);
}

function orderFillSell($address, $domain, $price, $amount, $total, $pass)
{
    $exchange_address = exchange_ . $domain;
    tokenSend($domain, $address, $exchange_address, $amount, $pass);
    $order_id = createOrder($address, $domain, 1, $price, $amount, $total);
    foreach (select("select * from orders where `domain` = '$domain' and is_sell = 0 and price >= $price and status = 0 order by price DESC,timestamp") as $order) {
        $new_order = selectRowWhere(orders, [order_id => $order_id]);
        $amount_not_filled = round($new_order[amount] - $new_order[amount_filled], 2);
        if ($amount_not_filled == 0)
            break;
        $order_total_not_filled = round($order[total] - $order[total_filled], 2);
        $order_amount_not_filled = round($order_total_not_filled / $order[price], 2);
        $amount_to_fill = min($order_amount_not_filled, $amount_not_filled);
        $total_to_fill = round($amount_to_fill * $order[price], 2);
        updateWhere(orders, [ // buy order update
            status => $order_amount_not_filled == $amount_to_fill ? 1 : 0,
            amount_filled => round($order[amount_filled] + $amount_to_fill, 2),
            total_filled => round($order[total_filled] + $total_to_fill, 2),
        ], [order_id => $order[order_id]]);

        if ($order_amount_not_filled == $amount_to_fill) {
            $amount_filled = scalarWhere(orders, amount_filled, [order_id => $order[order_id]]);
            tokenSend($domain, $exchange_address, $order[address], $amount_filled);
        }

        updateWhere(orders, [ // sell order update
            amount_filled => round($new_order[amount_filled] + $amount_to_fill, 2),
            total_filled => round($new_order[total_filled] + $total_to_fill, 2),
        ], [order_id => $order_id]);

        $last_trade_price = $order[price];
        $trade_volume += $total_to_fill;
    }
    $new_order = selectRowWhere(orders, [order_id => $order_id]);
    if ($new_order[amount] == $new_order[amount_filled]) {
        tokenSend(usdt, $exchange_address, $address, round($new_order[total_filled], 2));
        updateWhere(orders, [status => 1], [order_id => $order_id]);
    } else {
        updateWhere(orders, [status => 0], [order_id => $order_id]);
    }

    trackFill($domain, $last_trade_price, $trade_volume);

    return $order_id;
}

function orderFillBuy($address, $domain, $price, $amount, $total, $pass)
{
    $exchange_address = exchange_ . $domain;
    tokenSend(usdt, $address, $exchange_address, $total, $pass);
    $order_id = createOrder($address, $domain, 0, $price, $amount, $total);
    foreach (select("select * from orders where `domain` = '$domain' and is_sell = 1 and price <= $price and status = 0 order by price,timestamp") as $order) {
        $new_order = selectRowWhere(orders, [order_id => $order_id]);
        $total_not_filled = round($new_order[total] - $new_order[total_filled], 2);
        if ($total_not_filled == 0)
            break;
        $order_amount_not_filled = round($order[amount] - $order[amount_filled], 2);
        $order_total_not_filled = round($order_amount_not_filled * $order[price], 2);
        $total_to_fill = min($order_total_not_filled, $total_not_filled);
        $amount_to_fill = round($total_to_fill / $order[price], 2);
        if ($order[amount_filled] + $amount_to_fill < 0)
            error("amount filled less than 0 $order[amount_filled] $amount_to_fill");
        updateWhere(orders, [ // sell order update
            status => $order_total_not_filled == $total_to_fill ? 1 : 0,
            total_filled => round($order[total_filled] + $total_to_fill, 2),
            amount_filled => round($order[amount_filled] + $amount_to_fill, 2),
        ], [order_id => $order[order_id]]);
        if ($order_total_not_filled == $total_to_fill) {
            $total_filled = scalarWhere(orders, total_filled, [order_id => $order[order_id]]);
            tokenSend(usdt, $exchange_address, $order[address], $total_filled);
        }
        updateWhere(orders, [ // buy order update
            amount_filled => round($new_order[amount_filled] + $amount_to_fill, 2),
            total_filled => round($new_order[total_filled] + $total_to_fill, 2),
        ], [order_id => $order_id]);

        $last_trade_price = $order[price];
        $trade_volume += $total_to_fill;
    }
    $new_order = selectRowWhere(orders, [order_id => $order_id]);
    if ($new_order[total] == $new_order[total_filled]) {
        tokenSend($domain, $exchange_address, $address, round($new_order[amount_filled], 2));
        updateWhere(orders, [status => 1], [order_id => $order_id]);
    } else {
        updateWhere(orders, [status => 0], [order_id => $order_id]);
    }

    trackFill($domain, $last_trade_price, $trade_volume);

    return $order_id;
}

function trackFill($domain, $last_trade_price, $trade_volume)
{
    if ($last_trade_price != null) {
        tokenSetVolume($domain, $trade_volume);
        tokenSetPrice($domain, $last_trade_price);
    }

    broadcast(orderbook, [
        domain => $domain,
    ]);
}

function place($domain, $address, int $is_sell, $price, $amount, $total, $pass = ":")
{
    $exchange_address = exchange_ . $domain;
    if (botScriptReg($domain, $exchange_address)) commit();

    if ($price !== round($price, 2)) error("price tick is 0.01");
    if ($price <= 0) error("price less than 0");
    if ($amount !== round($amount, 2)) error("amount tick is 0.01");
    if ($amount <= 0) error("amount less than 0");

    if ($is_sell == 1) {
        $total = round($price * $amount, 2);
        $order_id = orderFillSell($address, $domain, $price, $amount, $total, $pass);
    } else {
        $amount = round($total / $price, 2);
        $order_id = orderFillBuy($address, $domain, $price, $amount, $total, $pass);
    }

    return $order_id;
}

function cancel($order_id)
{
    $order = selectRowWhere(orders, [order_id => $order_id]);
    if ($order[status] != 0) error("order already finished");
    $exchange_address = exchange_ . $order[domain];
    if ($order[is_sell] == 1) {
        $amount_to_get = round($order[amount] - $order[amount_filled], 2);
        $total_to_get = round($order[total_filled], 2);
        if ($amount_to_get > 0)
            tokenSend($order[domain], $exchange_address, $order[address], round($order[amount] - $order[amount_filled], 2));
        if ($total_to_get > 0)
            tokenSend(usdt, $exchange_address, $order[address], round($order[total_filled], 2));
    } else {
        $total_to_get = round($order[total] - $order[total_filled], 2);
        $amount_to_get = round($order[amount_filled], 2);
        if ($total_to_get > 0)
            tokenSend(usdt, $exchange_address, $order[address], round($order[total] - $order[total_filled], 2));
        if ($amount_to_get > 0)
            tokenSend($order[domain], $exchange_address, $order[address], round($order[amount_filled], 2));
    }
    updateWhere(orders, [status => -1], [order_id => $order_id]);

    broadcast(orderbook, [
        domain => $order[domain],
    ]);
}

function cancelAllAndCommit($domain, $address)
{
    requestEquals("/mfm-exchange/owner.php", [
        redirect => "mfm-exchange/cancel_all.php",
        domain => $domain,
        address => $address,
    ]);
}

function cancelAll($domain, $address)
{
    $orders = ordersActive($domain, $address);
    for ($i = 0; $i < sizeof($orders); $i++) {
        echo "cancel $i/" . sizeof($orders) . "\n";
        cancel($orders[$i][order_id]);
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
            placeAndCommit($domain, $address, $is_sell, round($price, 2), round($amount_base, 2), round($price * $amount_base, 2), $pass);
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
                placeAndCommit($domain, $address, $is_sell, round($price, 2), round($amount_base, 2), round($price * $amount_base, 2), $pass);
            }

            $price += $price_step;
        }
    }
}

function getPriceLevels($domain, $is_sell, $count)
{
    $levels = select("select price, sum(amount) - sum(amount_filled) as amount from orders "
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
    $place_script = "mfm-exchange/owner.php";
    tokenRegScript($domain, $bot_address, $place_script);
    return tokenRegScript(get_required(gas_domain), $bot_address, $place_script);
}