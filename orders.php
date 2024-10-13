<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-exchange/utils.php";

$domain = get_required(domain);
$address = get_required(address);

$response[active] =  select("select * from orders where `domain` = '$domain' and address = '$address' and status = 0 order by timestamp DESC");
$response[history] = select("select * from orders where `domain` = '$domain' and address = '$address' and status <> 0 order by timestamp DESC limit 0, 20");

$response[active] = array_reverse($response[active]);
$response[history] = array_reverse($response[history]);

commit($response);