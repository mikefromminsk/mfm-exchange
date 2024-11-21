<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-db/utils.php";

onlyInDebug();

query("DROP TABLE IF EXISTS `orders`;");
query("CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `domain` varchar(16) COLLATE utf8_bin NOT NULL,
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

query("DROP TABLE IF EXISTS `tokens`;");
query("CREATE TABLE IF NOT EXISTS `tokens` (
  `domain` varchar(16) COLLATE utf8_bin NOT NULL,
  `owner` varchar(256) COLLATE utf8_bin NOT NULL,
  `amount` double DEFAULT 0,
  `price` double DEFAULT 0,
  `change24` double DEFAULT 0,
  `volume24` double DEFAULT 0,
   PRIMARY KEY (`domain`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;");

$response[success] = true;

echo json_encode($response, JSON_PRETTY_PRINT);