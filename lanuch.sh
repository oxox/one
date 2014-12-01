#!/bin/sh
NWFILES="$HOME/Dev/tools/nw/**"
APPFOLDER=$PWD
NWEXE="node-webkit.app/Contents/MacOS/node-webkit"
FILE="file://$PWD/assets/index.html?debug=1"
#cp -rf ~/Dev/tools/nw/** ~/Dev/workspace/github/xsin/one
cp -rf ${NWFILES} ${APPFOLDER}
$NWEXE --url="$FILE"
