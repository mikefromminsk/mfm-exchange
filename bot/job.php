<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-token/utils.php";


$domains = [
    "rock",
];

foreach ($domains as $domain) {
    foreach (glob("strategy/*") as $file) {
        /*if ($file == "strategy/1p.php") {
            requestEquals("/mfm-exchange/bot/$file", [
                domain => $domain,
            ]);
        } elseif ($file == "strategy/1d.php") {
            requestEquals("/mfm-exchange/bot/$file", [
                domain => $domain,
            ]);
        } else*/ {
            http_post("/mfm-exchange/bot/$file", [
                domain => $domain,
            ]);
        }
    }
}


commit();