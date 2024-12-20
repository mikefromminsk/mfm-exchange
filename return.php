<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-token/utils.php";

$address = get_required(address);
$pass = get_required(pass);
$answers = get_required(answers);



$last_tran = tokenLastTran(gas_domain, bank_address, $address);
$amount = $last_tran[amount];
$usd_back = round($amount * (credit_percent / 100), 2);

tokenSend(gas_domain, $address, bank_address, $usd_back);

function tokenUndelegateAll($address)
{
    foreach (getAccounts($address) as $account) {
        tokenUndelegate($account[domain], $address);
    }
}

tokenUndelegateAll($address);

commit();