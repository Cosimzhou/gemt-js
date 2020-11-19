#! /bin/bash

resfile=${1:-pic-svg.js}
echo "var SvgPack = {" > $resfile
for f in `ls *.svg`; do
  bf=`sed "s/  //g" $f|base64`
  echo "  \"$f\": \"data:image/svg+xml;base64,"$bf\",
done >> $resfile
echo "};" >> $resfile
