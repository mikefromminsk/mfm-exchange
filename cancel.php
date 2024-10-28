<?php
require_once $_SERVER[DOCUMENT_ROOT] . "/mfm-exchange/utils.php";

$order_id = get_int_required(order_id);

cancel($order_id);

commit();