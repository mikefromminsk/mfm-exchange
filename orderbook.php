<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-token/utils.php";

$domain = get_required(domain);

$response = getOrderbook($domain);

commit($response);