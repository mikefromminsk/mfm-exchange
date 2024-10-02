<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-db/db.php";

if (!DEBUG) error("cannot use not in debug session");

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

$response[success] = true;

echo json_encode($response);