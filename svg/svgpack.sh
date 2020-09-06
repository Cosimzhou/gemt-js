#! /bin/bash

#########################################################################
# File Name: svgpack.sh
# Author: cosim
# mail: cosimzhou@hotmail.com
# Created Time: 六  9/12 17:10:36 2020
#########################################################################

resfile=${1:-pic-svg.js}
echo "var SvgPack = {" > $resfile
for f in `ls *.svg`; do
  bf=`sed "s/  //g" $f|base64`
  echo "  \"$f\": \"data:image/svg+xml;base64,"$bf\",
done >> $resfile
echo "};" >> $resfile
