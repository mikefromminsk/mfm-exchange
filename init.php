<?php

include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-data/utils.php";

onlyInDebug();

query("DROP TABLE IF EXISTS `orders`;");
query("CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `domain` varchar(256) COLLATE utf8_bin NOT NULL,
  `address` varchar(256) COLLATE utf8_bin NOT NULL,
  `is_sell` int(1) NOT NULL,
  `status` int(1) DEFAULT 0,
  `price` double NOT NULL,
  `amount` double NOT NULL,
  `amount_filled` double DEFAULT 0,
  `total` double NOT NULL,
  `total_filled` double DEFAULT 0,
  `timestamp` int(11) NOT NULL,
   PRIMARY KEY (`order_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;");
//
requestEquals("/mfm-exchange/bot/job.php");

$address = get_required(wallet_admin_address);
$password = get_required(wallet_admin_password);
$gas_domain = get_required(gas_domain);

foreach (getDomains() as $domain) {
    if ($domain != $gas_domain) {
        foreach (glob("bot/strategy/*") as $file) {
            $strategy = basename($file, ".php");
            $bot_address = "bot_" . $strategy . "_" . $domain;
            tokenSendAndCommit($domain, $address, $bot_address, $password, 100);
            tokenSendAndCommit($gas_domain, $address, $bot_address, $password, 100);
        }
    }
}

//requestEquals("/mfm-exchange/bot/job.php");

commit();