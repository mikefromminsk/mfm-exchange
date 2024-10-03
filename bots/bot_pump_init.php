<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/exchange/api/utils.php";

$domain = get_required(domain);
$n = get_int_required(startN);
$multiplicator = get_int(multiplicator, 1);

dataSet([exchange, pump, $domain], [
    startN => $n,
    multiplicator => $multiplicator
]);
commit();
