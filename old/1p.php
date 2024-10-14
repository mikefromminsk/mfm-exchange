<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-exchange/utils.php";

$domain = get_required(domain);
$bot_address = "bot_" . scriptName() . "_" . $domain;
if (botScriptReg($domain, $bot_address)) commit();
if (tokenLastTran($domain, $bot_address)[time] + 60 < time()) error("too fast");

placeAndCommit(market, $domain, $bot_address, 0, 0, 0, 1);

commit();