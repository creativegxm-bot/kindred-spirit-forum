#!/bin/bash

decoded_image_path="public/transparent-favicon.png"

# Decode the base64 PNG and save it
base64 -d tools/remove-lovable-favicon.sh > "$decoded_image_path"

# Find and replace references to the lovable favicon
sed -i 's/lovable/favicon/g' **/*

# Remove files named lovable.*
rm -f lovable.*
