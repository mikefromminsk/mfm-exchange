<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-exchange/utils.php";

$domain = get_required(domain);
$bot_address = "bot_" . scriptName() . "_" . $domain;
if (botScriptReg($domain, $bot_address)) commit();
//if (tokenLastTran($domain, $bot_address)[time] + 2 > time()) error("too fast");

cancelAllAndCommit($domain, $bot_address);

$coin_balance = tokenBalance($domain, $bot_address);
$usdt_balance = tokenBalance(usdt, $bot_address);
$is_sell = rand(0, $coin_balance + $usdt_balance) < $coin_balance ? 1 : 0;
$price = rand(tokenPrice($domain) * ($is_sell == 1 ? 0.97 : 1.03), 2);
$amount = round(1 / $price, 2);

placeAndCommit($domain, $bot_address, $is_sell, $price, $amount);

commit();