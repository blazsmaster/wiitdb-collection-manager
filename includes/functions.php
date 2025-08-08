<?php
    function parseXMLtoGameData($filePath): array {
        $result = [
            'success' => false,
            'message' => '',
            'games' => [],
            'filters' => [
                'region' => []
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

            $regions = [];

            foreach ($xml -> game as $game) {
                $id = (string)$game -> id;
                $name = (string)$game['name'];
                $region = (string)$game -> region;
                $language = (string)$game -> languages;
                $developer = (string)$game -> developer;
                $publisher = (string)$game -> publisher;
                $type = (string)$game -> type;

                // Filter: Region
                if (!empty($region)) {
                    $regions[] = $region;
                } else {
                    $region = 'Unknown';
                }

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

            $regions = array_unique($regions);
            sort($regions);

            usort($games, function ($a, $b) {
                return strcmp($a['id'], $b['id']);
            });

            $result['games'] = $games;
            $result['success'] = true;
            $result['filters'] = [
                'region' => $regions
            ];
            $result['message'] = 'Successfully parsed ' . count($games) . ' games.';
        } catch (Exception $e) {
            $result['message'] = 'Error parsing XML file: ' . $e -> getMessage();
        }

        return $result;
    }

    function importXMLFromStaticFile(): ?array {
        return parseXMLtoGameData(XML_SOURCE_FILE);
    }
