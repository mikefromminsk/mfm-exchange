<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-data/utils.php";

$gas_domain = get_required(gas_domain);
$gas_domain = get_required(gas_domain);

foreach (getDomains() as $domain) {
    if ($domain != $gas_domain) {
        foreach (glob("strategy/*") as $file) {
            http_post("/mfm-exchange/bot/$file", [
                domain => $domain,
            ]);
        }
    }
}


commit();