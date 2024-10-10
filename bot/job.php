<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-token/utils.php";



/*$tokens = [
    [domain => "rock",]
];
foreach ($tokens as $token) {

        requestEquals("/" . $token[domain] . "/api/exchange/bot_pump.php", [
            domain => $token[domain],
            address => $token[address],
            password => $token[password],
        ]);
}*/
requestEquals("/mfm-exchange/bot/spred/fill.php");

commit();