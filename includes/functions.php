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
                'publisher' => []
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
                'publisher' => []
            ];

            foreach ($xml -> game as $game) {
                $id = (string)$game -> id;
                $name = (string)$game['name'];
                $region = (string)$game -> region;
                $language = (string)$game -> languages;
                $developer = (string)$game -> developer;
                $publisher = (string)$game -> publisher;
                $type = (string)$game -> type;

                processAttribute($region, $filters['region'], false);
                processAttribute($language, $filters['language']);
                processAttribute($developer, $filters['developer']);
                processAttribute($publisher, $filters['publisher']);

                $games[] = [
                    'id' => $id,
                    'name' => $name,
                    'region' => $region,
                    'language' => $language,
                    'developer' => $developer,
                    'publisher' => $publisher,
                    'type' => $type
                ];
            }

            sort($filters['region']);
            sort($filters['language']);
            sort($filters['developer']);
            sort($filters['publisher']);
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

        if ($splitCommas) {
            $values = array_map('trim', explode(',', $attrStr));
            foreach ($values as $value) {
                if (!empty($value) && !in_array($value, $targetArr, true)) {
                    $targetArr[] = $value;
                }
            }
        } else {
            if (!in_array($attrStr, $targetArr, true)) {
                $targetArr[] = $attrStr;
            }
        }
    }
