<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/mfm-db/params.php";

$redirect = get_required(redirect);

require_once $_SERVER["DOCUMENT_ROOT"] . "/$redirect";