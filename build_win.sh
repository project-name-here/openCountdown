#!/bin/bash
#npx electron-packager . --platform=win32 --overwrite --out=./buildout
npx electron-packager . --platform=win32,linux --overwrite --out=./buildout
cd "./buildout/" || exit 1

resources=(
        "electronAssets"
        "lang"
        "static"
        "templates"
        "package.json"
)

for dir in */; do
        for i in "${resources[@]}"; do
                echo "$dir -> $i"
                cp -r "$dir\resources/app/$i" "$dir"
        done
done
