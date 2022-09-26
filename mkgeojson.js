const fs = require('fs');
const child_process = require('child_process');

// 10/908/403 のタイルに収まるような領域を設定
const x1 = 35.470736;
const x2 = 35.735366;
const y1 = 139.227676;
const y2 = 139.557266;

const dx = x2 - x1;
const dy = y2 - y1

//領域内でランダムな点を発生
const mkRondomVertex = () => {
  const rdx = dx * Math.random();
  const rdy = dy * Math.random();
  return [ rdy + y1, rdx + x1 ];
}

const geojson = {
  "type": "FeatureCollection",
  "features": []
}

//ランダムな2点を持つラインデータを10000個作成
for(let i=0; i < 10000; i++){
  const f = {
    "type": "Feature",
    "properties": {
      "code": i+1
    },
    "geometry": {
      "type": "LineString",
      "coordinates": [
        mkRondomVertex(),
        mkRondomVertex()
      ]
    }
  };
  geojson.features.push(f);
}

//ファイルに書き出し
fs.writeFileSync("sample.json", JSON.stringify(geojson, null, 2));


