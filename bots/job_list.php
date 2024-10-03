<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-db/requests.php";

$tokens = [
    [
        domain => "mfm-exchange",
        address => "admin",
        password => "pass",
    ]
];


foreach ($tokens as $token) {
/*    requestEquals("/" . $token[domain] . "/api/exchange/bot_pump.php", [
        domain => $token[domain],
        address => $token[address],
        password => $token[password],
    ]);*/
    requestEquals("/mfm-exchange/bots/bot_spred.php", [
        domain => $token[domain],
    ]);
}

commit();