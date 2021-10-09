#! /bin/bash

resfile=${1:-pic-svg.js}
echo "var SvgPack = {" > $resfile
for f in `ls *.svg`; do
  bf=`sed "s/  //g" $f|base64`
  echo "  \"$f\": \"data:image/svg+xml;base64,"$bf\",
done >> $resfile
echo "};" >> $resfile

svgfile=${1:-template.svg}
echo '<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="200" height="300">
<defs>' > $svgfile
for f in `ls *.svg`; do
  if [ "$f" != "$svgfile" ]; then
    echo " <g id=\"${f%.svg}\">">> $svgfile
    tail +3 $f|grep -v "</svg>" >> $svgfile
    echo " </g>">> $svgfile
  fi
done >> $svgfile
echo "</defs>

</svg>" >> $svgfile
