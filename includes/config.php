<?php
    const SITE_TITLE = 'WiiTDB Collection Manager';
    const SITE_LANG = 'en';

    // Paths
    define('BASE_PATH', dirname(__DIR__));
    const XML_SOURCE_FILE = BASE_PATH . '/assets/xml/wiitdb.xml';
    const COVER_URL_BASE = BASE_PATH . '/assets/images/cover/';
    const DISC_URL_BASE = BASE_PATH . '/assets/images/disc/';

    date_default_timezone_set('UTC');

    error_reporting(E_ALL);
