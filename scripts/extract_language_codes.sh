#!/usr/bin/env bash

if [ $# -lt 1 ]; then
    echo "Usage: $0 path/to/wiitdb.xml"
    echo "Example: $0 ../assets/xml/wiitdb.xml"
    exit 1
fi

XML_FILE="$1"

if [ ! -f "$XML_FILE" ]; then
    echo "Error: File '$XML_FILE' not found."
    exit 1
fi

grep -o "<languages>[^<]*</languages>\|<language>[^<]*</language>" "$XML_FILE" |
    sed -e 's/<languages>//g' -e 's/<\/languages>//g' -e 's/<language>//g' -e 's/<\/language>//g' |
    tr ',' '\n' |
    sort |
    uniq
