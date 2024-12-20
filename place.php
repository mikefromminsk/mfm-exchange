<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-exchange/utils.php";

$domain = get_required(domain);
$is_sell = get_int_required(is_sell);
$address = get_required(address);
$price = get_int_required(price);
$amount = get_int_required(amount);
$total = get_int_required(total);
$pass = get_required(pass);

if (!str_starts_with($address, "bot_spred_"))
    limitPassSec(1, $domain);

$order_id = place($domain, $address, $is_sell, $price, $amount, $total, $pass);

if ($order_id == null) error("place error");

if (strpos($address, "bot_") === FALSE) {
    $topic = orderbook . ":" . $domain;
    broadcast($topic, [
        topic => $topic,
    ]);
}

commit();