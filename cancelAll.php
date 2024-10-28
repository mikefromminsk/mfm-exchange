<?php
require_once $_SERVER[DOCUMENT_ROOT] . "/mfm-exchange/utils.php";

$domain = get_required(domain);
$address = get_required(address);

cancelAll($domain, $address);

commit();