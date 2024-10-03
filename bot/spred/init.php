<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-token/utils.php";

$domain = get_required(domain);
$gas_domain = get_required(gas_domain);

tokenScriptReg($domain, bot_spred, "mfm-exchange/place.php");
tokenScriptReg($gas_domain, bot_spred_ . $domain, "mfm-exchange/place.php");

commit();