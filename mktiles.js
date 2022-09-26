const fs = require('fs');
const child_process = require('child_process');

//ランダムに作成した10000個のラインデータを読み込む
const geojson = require('./sample.json');

//スタイルファイルのひな型
const styletemp = (n) => {
  
  return {
	"version": 8,
	"name": "test",
	"glyphs": "https://gsi-cyberjapan.github.io/optimal_bvmap/glyphs/{fontstack}/{range}.pbf",
	"sprite": "https://gsi-cyberjapan.github.io/optimal_bvmap/sprite/std",
	"sources": {
		"v": {
			"type": "vector",
			"minzoom": 10,
			"maxzoom": 10,
			"tiles": [
				`http://localhost:8000/xyz/${n}/{z}/{x}/{y}.pbf`
			],
			"attribution": "地理院地図Vector"
		}
	},
	"layers": []
	};
}

fs.mkdirSync(`./d/`);

//ソースレイヤごとの地物数
[1, 10, 20, 100, 500, 1000, 5000, 10000].forEach( n => {
  
  //地物数毎にフォルダを分離
  fs.mkdirSync(`./d/${n}`);
  
  const style = styletemp(n);
  let sl = "---";
  
  const g = {
    "type": "FeatureCollection",
    "features": []
  };
  
  geojson.features.forEach( f => {
    g.features.push(f);
    
    if(f.properties.code > 1000) return;
    
    const np = Math.floor(f.properties.code / n);
    const rm = f.properties.code % n;
    
    if(!rm){
      
      console.log(np, rm);
      
      //地物データを GeoJSON へ書き出し
      fs.writeFileSync(`./d/${n}/${np}.json`, JSON.stringify(g, null, 2));
      
      //書き出した分の地物用のスタイルを設定
      g.features.forEach( ff => {
        style.layers.push({
          "id": `${ff.properties.code}`,
          "type": "line",
          "source": "v",
          "source-layer": `${np}`,
          "minzoom": 10,
          "maxzoom": 22,
          "filter": [ "all", [ "==", ["get", "code"], ff.properties.code ] ],
          "layout": {
            "visibility": "visible"
          },
          "paint": {
            "line-color": `rgba(${Math.floor(ff.properties.code/100)},${ff.properties.code%100},255,1)`,
            "line-width": 2
          }
        });
      });
      
      g.features.splice(0);
    }
  });
  
  //スタイルファイルを書き出し
  fs.writeFileSync(`./style/${n}.json`, JSON.stringify(style, null, 2));
  
  //tippecanoe で作成した GeoJSON をベクトルタイルへ変換
  const tipp = `tippecanoe ./d/${n}/*.json -e ./xyz/${n}/ --force `
             + ` --no-tile-size-limit --no-tile-compression --no-feature-limit`
             + ` --full-detail=10 --low-detail=10 --minimum-zoom=10 --maximum-zoom=10 --base-zoom=10`
             + ` --no-tiny-polygon-reduction --no-line-simplification`;
  child_process.execSync(`${tipp}`);
  
});
