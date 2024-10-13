<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-exchange/utils.php";

$domain = get_required(domain);

$response[sell] = getPriceLevels($domain, 1, 6);
$response[buy] = getPriceLevels($domain, 0, 6);

function fillAdditionalData(&$levels)
{
    $sum = array_sum(array_column($levels, amount));
    $accumulate_amount = 0;
    foreach ($levels as &$level) {
        $accumulate_amount += $level[amount];
        $level[percent] = $accumulate_amount / $sum * 100;
    }
}

fillAdditionalData($response[sell]);
fillAdditionalData($response[buy]);


commit($response);