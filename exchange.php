<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-exchange/utils.php";

$action = get_required(action);

if ($action == place) {
    $domain = get_required(domain);
    $is_sell = get_int_required(is_sell);
    $address = get_required(address);
    $price = get_int_required(price);
    $amount = get_int_required(amount);
    $pass = get_required(pass);

    $order_id = place($domain, $address, $is_sell, $price, $amount, $pass);

    if ($order_id == null) error("place error");
} else if ($action == cancel) {
    $order_id = get_int_required(order_id);
    cancel($order_id);
} else if ($action == cancelAll) {
    $domain = get_required(domain);
    $address = get_required(address);
    cancelAll($domain, $address);
} else {
    error("unknown action");
}
commit();