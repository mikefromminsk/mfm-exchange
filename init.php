<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-db/utils.php";

onlyInDebug();

query("DROP TABLE IF EXISTS `orders`;");
query("CREATE TABLE IF NOT EXISTS `orders` (
    `order_id` int NOT NULL AUTO_INCREMENT,
    `domain` varchar(16) COLLATE utf8_bin NOT NULL,
    `address` varchar(256) COLLATE utf8_bin NOT NULL,
    `is_sell` int(1) NOT NULL,
    `status` int(1) DEFAULT 0,
    `price` double NOT NULL,
    `amount` double NOT NULL,
    `amount_filled` double DEFAULT 0,
    `total` double NOT NULL,
    `total_filled` double DEFAULT 0,
    `timestamp` int NOT NULL,
   PRIMARY KEY (`order_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;");

query("DROP TABLE IF EXISTS `tokens`;");
query("CREATE TABLE IF NOT EXISTS `tokens` (
    `domain` varchar(16) COLLATE utf8_bin NOT NULL,
    `owner` varchar(256) COLLATE utf8_bin NOT NULL,
    `supply` double NOT NULL,
    `price` double DEFAULT 0,
    `price24` double DEFAULT 0,
    `volume24` double DEFAULT 0,
    `created` int NOT NULL,
   PRIMARY KEY (`domain`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;");

echo json_encode([success => true]);