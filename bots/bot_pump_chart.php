<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/exchange/api/utils.php";

$domain = get_required(domain);
$n = get_int_required(startN);
$multiplicator = get_int(multiplicator, 1);
$count = get_int(count, 100);

$chart = [];

$start_date = dataInfo([$domain])[data_time];

for ($i = 0; $i < $count; $i++) {
    if ($n % 2 == 0) {
        $n = $n / 2;
    } else {
        $n = 3 * $n + 1;
    }
    $chart[] = [
        time => $start_date + $i * 60 * 60 * 24,
        value => $n * $multiplicator
    ];
}


$response[chart] = $chart;

commit($response);