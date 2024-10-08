<?php

include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-token/utils.php";

onlyInDebug();

query("DROP TABLE IF EXISTS `orders`;");
query("CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `domain` varchar(256) COLLATE utf8_bin NOT NULL,
  `address` varchar(256) COLLATE utf8_bin NOT NULL,
  `is_sell` int(1) NOT NULL,
  `status` int(1) DEFAULT 0,
  `price` float NOT NULL,
  `amount` float NOT NULL,
  `filled` float DEFAULT 0,
  `timestamp` int(11) NOT NULL,
   PRIMARY KEY (`order_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;");


$address = get_required(address);
$password = get_required(password);

requestEquals("/mfm-wallet/api/init.php", [
    address => $address,
    password => $password
]);

foreach (getDomains() as $domain) {
    requestEquals("/mfm-exchange/bot/spred/init.php", [
        domain => $domain
    ]);
    tokenSendAndCommit($domain, $address, bot_spred, $password, 1000);
    tokenSendAndCommit($gas_domain, $address, bot_spred_ . $domain, $password, 1000);
}


requestEquals("/mfm-exchange/bot/spred/fill.php");

commit();