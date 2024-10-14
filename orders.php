<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-exchange/utils.php";

$domain = get_required(domain);
$address = get_required(address);

$response[active] =  ordersActive($domain, $address);
$response[history] = ordersHistory($domain, $address);

commit($response);