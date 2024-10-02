<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-token/utils.php";

$domain = get_required(domain);
$is_sell = get_int_required(is_sell);
$address = get_required(address);
$price = get_int_required(price);
$amount = get_int_required(amount);
$pass = get_required(pass);

$order_id = place($domain, $address, $is_sell, $price, $amount, $pass);

if ($order_id == null) error("place error");

commit();