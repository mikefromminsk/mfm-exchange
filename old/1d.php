<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-exchange/utils.php";

$domain = get_required(domain);
$bot_address = "bot_" . getScriptName() . "_" . $domain;
if (botScriptReg($domain, $bot_address)) commit();
if (tokenLastTran($domain, $bot_address)[time] + 60 < time()) error("too fast");

$amount = round(1 / (tokenPrice($domain) ?: 1), 2);

placeAndCommit(market, $domain, $bot_address, 1, 0, $amount, 0);

commit();