      
      zip.workerScriptsPath = 'static/js/';

      
      vector = new ol.layer.Vector({
        source: new ol.source.Vector({
          format: new ol.format.KML({
            extractStyles: true
          })
        })
      });

      
      var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          }),
          vector
        ],
        view: new ol.View({
          center: ol.proj.transform(
            [116.390471,39.929101],
            'EPSG:4326',
            'EPSG:3857'
          ),
          zoom: 4
        })
      });
     
	  var url = 'huanghe.kmz';
	
      function addFeatures(text) {
        var formatter = new ol.format.KML();
        var kml_features = formatter.readFeatures(text, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });
        vector.getSource().addFeatures(kml_features);
      }
      function parseKmlText(text) {
          var oParser = new DOMParser();
          var oDOM = oParser.parseFromString(text, 'text/xml');
          var links = oDOM.querySelectorAll('NetworkLink Link href');
          var files = Array.prototype.slice.call(links).map(function(el) {
            return el.textContent;
          });
          // console.log(files);
          return files;
      }
      
      function unzipFromBlob(callback) {
        return function unzip(blob) {
          zip.createReader(new zip.BlobReader(blob), function(reader) {
            reader.getEntries(function(entries) {
              if (entries.length) {
                entries[0].getData(new zip.TextWriter(), function(text) {                 
                //  console.log(text);
                  // callback(text);     
					addFeatures	(text);			  
                  reader.close(function() {                  
                  });
                });
              }
            });
          });
        };
      }
      function ajaxKMZ(url, callback) {
        qwest.get(url, null, {
          responseType: 'blob'
        })
        .then(function(response) {

          callback(response);
        })
        .catch(function(e, url) {
         
        })
        .complete(function() {
          
        });
      }
     
      var readAndAddFeatures = function(text) {
        var listFilesKMZ = parseKmlText(text);
        //console.log(listFilesKMZ);
        listFilesKMZ.forEach(function(el) {
          ajaxKMZ(el, unzipFromBlob(addFeatures));
        });
      };

      function repeat_kmz_calls(){
          var combinedCallback = unzipFromBlob(readAndAddFeatures);
          ajaxKMZ(url, combinedCallback);
      }
      vector.on('render', function(event) {
        var ctx = event.context;
        ctx.fillStyle = "red";
        ctx.font = "72px Arial";
        var metrics = ctx.measureText("WaterMark Demo");
        var width = metrics.width;
        
        if(vector.getSource().getFeatures().length == 0) {
            ctx.fillText("WaterMark Demo", ctx.canvas.width/2 - (metrics.width/2) , ctx.canvas.height/2);
        }
        ctx.restore();
      });

      repeat_kmz_calls();


