<?php
    function parseXMLtoGameData($filePath): array {
        $result = [
            'success' => false,
            'message' => '',
            'games' => [],
            'filters' => [
                'region' => [],
                'language' => [],
                'developer' => [],
                'publisher' => [],
                'type' => []
            ]
        ];

        if (!file_exists($filePath)) {
            $result['message'] = 'XML file not found: ' . $filePath;
            return $result;
        }

        try {
            $xml = simplexml_load_file($filePath);
            if (!$xml) {
                $result['message'] = 'Failed to parse XML file.';
                return $result;
            }

            $games = [];
            $filters = [
                'region' => [],
                'language' => [],
                'developer' => [],
                'publisher' => [],
                'type' => []
            ];

            foreach ($xml -> game as $game) {
                $id = (string)$game -> id;
                $name = (string)$game['name'];
                $title = getLocalizedTitle($game, 'EN', $name);
                $region = (string)$game -> region;
                $language = (string)$game -> languages;
                $developer = (string)$game -> developer;
                $publisher = (string)$game -> publisher;
                $type = (string)$game -> type;

                if (empty($type)) {
                    $type = 'Wii';
                }

                processAttribute($region, $filters['region'], false);
                processAttribute($language, $filters['language']);
                processAttribute($developer, $filters['developer']);
                processAttribute($publisher, $filters['publisher']);
                processAttribute($type, $filters['type'], false);

                // Join with slashes "/"
                $developerModded = '';
                $publisherModded = '';
                $devParts = parseAttributeString($developer);
                $pubParts = parseAttributeString($publisher);
                if (count($devParts) > 0) {
                    $developerModded = implode(' / ', $devParts);
                }
                if (count($pubParts) > 0) {
                    $publisherModded = implode(' / ', $pubParts);
                }

                $games[] = [
                    'id' => $id,
                    'name' => $name,
                    'title' => $title,
                    'region' => $region,
                    'language' => $language,
                    'developer' => $developerModded,
                    'publisher' => $publisherModded,
                    'type' => $type
                ];
            }

            sort($filters['region']);
            sort($filters['language']);
            sort($filters['developer']);
            sort($filters['publisher']);
            sort($filters['type']);
            usort($games, function ($a, $b) {
                return strcmp($a['id'], $b['id']);
            });

            $result['games'] = $games;
            $result['success'] = true;
            $result['filters'] = $filters;
            $result['message'] = 'Successfully parsed ' . count($games) . ' games.';
        } catch (Exception $e) {
            $result['message'] = 'Error parsing XML file: ' . $e -> getMessage();
        }

        return $result;
    }

    function importXMLFromStaticFile(): ?array {
        return parseXMLtoGameData(XML_SOURCE_FILE);
    }

    function processAttribute($attrStr, &$targetArr, $splitCommas = true) {
        if (empty($attrStr)) {
            $attrStr = 'Unknown';
        }

        if (!$splitCommas) {
            addUniqueValue($attrStr, $targetArr);
            return;
        }

        $values = parseAttributeString($attrStr);

        foreach ($values as $value) {
            addUniqueValue($value, $targetArr);
        }
    }

    function parseAttributeString($attrStr): array {
        $slashParts = array_map('trim', explode('/', $attrStr));
        $values = [];

        foreach ($slashParts as $part) {
            $parsedValues = parseCommaDelimitedPart($part);
            $values = array_merge($values, $parsedValues);
        }

        return $values;
    }

    function parseCommaDelimitedPart($part): array {
        $commaParts = array_map('trim', explode(',', $part));
        $values = [];
        $currentValue = '';

        foreach ($commaParts as $commaPart) {
            if (isCompanySuffix($commaPart) && !empty($currentValue)) {
                $currentValue .= ', ' . $commaPart;
            } else {
                if (!empty($currentValue)) {
                    $values[] = $currentValue;
                }
                $currentValue = $commaPart;
            }
        }

        if (!empty($currentValue)) {
            $values[] = $currentValue;
        }

        return $values;
    }

    function isCompanySuffix($str): bool {
        // Must remain attached prefixes
        $companySuffixes = [
            'Inc', 'Inc.',
            'LLC',
            'Ltd', 'Ltd.',
            'Limited',
            'Corp.', 'Corporation', 'Co.',
            'Co., Ltd.', 'Co. Ltd.', 'Co Ltd',
            'GmbH',
            'S.A.B.'
        ];

        foreach ($companySuffixes as $suffix) {
            if (strcasecmp($str, $suffix) === 0) {
                return true;
            }
        }

        return false;
    }

    function addUniqueValue($value, &$targetArr) {
        if (!empty($value) && !in_array($value, $targetArr, true)) {
            $targetArr[] = $value;
        }
    }

    function getGameAssetPath($gameId, $assetType) {
        $result = '';

        // With valid params
        if (!empty($gameId) && in_array($assetType, ['cover', 'disc'])) {
            $regionCode = substr($gameId, 3, 1);

            // Region priority mapping - stats from [stats/get_asset_region_codes.sh]
            $regionMapping = [
                'A' => ['EN', 'US', 'JA', 'ES', 'FR', 'IT'],
                'B' => ['EN', 'US'],
                'C' => ['ZH', 'JA', 'KO', 'EN', 'US', 'FR', 'IT'],
                'D' => ['DE', 'EN', 'CH', 'ES', 'FR', 'IT', 'DK', 'FI', 'NL', 'NO', 'SE'],
                'E' => ['US', 'EN', 'DE', 'ES', 'FR', 'IT', 'JA'],
                'F' => ['FR', 'EN', 'AU', 'DE', 'ES', 'IT', 'NL'],
                'G' => ['EN', 'DE'],
                'H' => ['NL', 'EN', 'DE', 'FR', 'IT'],
                'I' => ['IT', 'EN', 'AU', 'US', 'DE', 'ES', 'FR', 'JA', 'KO', 'NL'],
                'J' => ['JA', 'US'],
                'K' => ['KO', 'US'],
                'L' => ['EN', 'FR', 'IT', 'US', 'JA'],
                'M' => ['EN', 'US', 'DE', 'FR'],
                'N' => ['US', 'JA'],
                'O' => ['US'],
                'P' => ['EN', 'AU', 'US', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'DK', 'FI', 'NO', 'CH', 'TR', 'PT', 'RU'],
                'Q' => ['KO', 'JA', 'EN', 'US'],
                'R' => ['RU', 'EN', 'US'],
                'S' => ['ES', 'EN', 'AU', 'FR', 'DE', 'NL'],
                'T' => ['KO', 'EN'],
                'U' => ['AU', 'EN', 'DE', 'ES', 'FR', 'IT', 'DK', 'FI', 'NO', 'SE'],
                'V' => ['EN', 'SE', 'DK', 'FI', 'NO'],
                'W' => ['ZH', 'KO', 'DK', 'EN', 'FI', 'NO', 'SE'],
                'X' => ['EN', 'AU', 'US', 'DE', 'ES', 'FR', 'IT', 'NL', 'DK', 'FI', 'NO', 'PT', 'SE', 'JA'],
                'Y' => ['EN', 'AU', 'US', 'DE', 'ES', 'FR', 'IT', 'NL', 'DK', 'FI', 'NO', 'PT', 'SE', 'TR'],
                'Z' => ['EN', 'AU', 'US', 'DE', 'ES', 'FR', 'IT', 'KO', 'NL', 'DK', 'FI', 'NO', 'PT', 'SE', 'JA'],

                '1' => ['EN', 'US'],
                '4' => ['JA', 'US'],
                '8' => ['EN'],
                '9' => ['DE']
            ];
            $defaultRegions = ['EN', 'US', 'AU'];

            $regionsToCheck = $regionMapping[$regionCode] ?? $defaultRegions;
            $baseDir = ($assetType === 'cover') ? COVER_URL_BASE : DISC_URL_BASE;

            // Find asset
            foreach ($regionsToCheck as $region) {
                $imagePath = $baseDir . $region . '/' . $gameId . '.png';
                if (file_exists($imagePath)) {
                    $result = str_replace(BASE_PATH . '/', '', $imagePath);
                    break;
                }
            }
        }

        return $result;
    }

    function getLocalizedTitle($game, $lang, $defaultTitle) {
        if (!isset($game -> locale)) {
            return $defaultTitle;
        }

        foreach ($game -> locale as $locale) {
            if ((string)$locale['lang'] === $lang && isset($locale -> title)) {
                return (string)$locale -> title;
            }
        }

        return $defaultTitle;
    }
