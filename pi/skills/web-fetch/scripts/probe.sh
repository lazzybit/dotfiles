#!/usr/bin/env bash
set -e

url="$1"

if [ -z "$url" ]; then
    echo "probe_failed"
    exit 1
fi

# HEAD request, follow redirects
headers=$(curl -sI -L -H "Accept: text/markdown" -H "User-Agent: WebFetch/1.0" "$url" 2>&1) || {
    echo "probe_failed"
    exit 0
}

if [ -z "$headers" ]; then
    echo "probe_failed"
    exit 0
fi

# Extract final HTTP status
http_status=$(echo "$headers" | grep -i '^HTTP/' | tail -1 | awk '{print $2}' | tr -d '\r\n')

# HEAD rejected → skip probing
case "$http_status" in
    405|403|501)
        echo "probe_failed"
        exit 0
        ;;
esac

# Extract final content-type
content_type=$(echo "$headers" | grep -i '^content-type:' | tail -1 | sed 's/.*: *//i' | tr -d '\r\n' | cut -d';' -f1)

# Extract final content-length
content_length=$(echo "$headers" | grep -i '^content-length:' | tail -1 | sed 's/.*: *//i' | tr -d '\r\n')

# Classify
suggestion="try_site_api_or_extract"

if [ -n "$content_type" ]; then
    case "$content_type" in
        text/markdown|text/markdown*)
            suggestion="fetch_markdown"
            ;;
        application/json|application/json*)
            suggestion="fetch_json"
            ;;
        text/html|text/html*)
            if [ -n "$content_length" ] && [ "$content_length" -le 10000 ]; then
                suggestion="fetch_small_html"
            else
                suggestion="try_site_api_or_extract"
            fi
            ;;
        text/plain|text/plain*)
            if [ -n "$content_length" ] && [ "$content_length" -le 50000 ]; then
                suggestion="fetch_direct"
            else
                suggestion="try_site_api_or_extract"
            fi
            ;;
        *)
            suggestion="try_site_api_only"
            ;;
    esac
else
    suggestion="try_site_api_only"
fi

echo "$suggestion"
