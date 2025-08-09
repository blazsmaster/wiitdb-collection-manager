#!/usr/bin/env bash

root_path="."

echo "=== CODES ==="
echo ""

declare -A reverse_map

for maindir in "$root_path"/*/; do
    [ -d "$maindir" ] || continue
    mainname=$(basename "$maindir")

    for regionfolder in "$maindir"*/; do
        [ -d "$regionfolder" ] || continue
        regionname=$(basename "$regionfolder")

        codes=$(find "$regionfolder" -maxdepth 1 -type f \
            | while IFS= read -r file; do
                  filename=$(basename "$file")
                  name="${filename%.*}"
                  if [ "${#name}" -ge 4 ]; then
                      echo "${name:3:1}"
                  fi
              done | sort -u)

        if [ -n "$codes" ]; then
            codes_list=$(echo "$codes" | paste -sd, -)
            echo "$mainname -> $regionname -> $codes_list"

            for code in $(echo "$codes" | tr ',' '\n'); do
                # Include all codes (including numbers)
                if [ -z "${reverse_map[$code]}" ]; then
                    reverse_map[$code]="$regionname"
                else
                    if [[ ! ${reverse_map[$code]} =~ (^|[[:space:],])$regionname($|[[:space:],]) ]]; then
                        reverse_map[$code]="${reverse_map[$code]}, $regionname"
                    fi
                fi
            done
        fi
    done
done

echo ""
echo "=== REGIONS ==="
echo ""

for code in $(echo "${!reverse_map[@]}" | tr ' ' '\n' | sort); do
    echo "$code -> ${reverse_map[$code]}"
done
