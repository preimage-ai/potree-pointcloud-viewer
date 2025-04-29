import * as THREE from "../../libs/three.js/build/three.module.js";

// http://epsg.io/
proj4.defs([
  ["UTM10N", "+proj=utm +zone=10 +ellps=GRS80 +datum=NAD83 +units=m +no_defs"],
  ["EPSG:6339", "+proj=utm +zone=10 +ellps=GRS80 +units=m +no_defs"],
  ["EPSG:6340", "+proj=utm +zone=11 +ellps=GRS80 +units=m +no_defs"],
  ["EPSG:6341", "+proj=utm +zone=12 +ellps=GRS80 +units=m +no_defs"],
  ["EPSG:6342", "+proj=utm +zone=13 +ellps=GRS80 +units=m +no_defs"],
  ["EPSG:6343", "+proj=utm +zone=14 +ellps=GRS80 +units=m +no_defs"],
  ["EPSG:6344", "+proj=utm +zone=15 +ellps=GRS80 +units=m +no_defs"],
  ["EPSG:6345", "+proj=utm +zone=16 +ellps=GRS80 +units=m +no_defs"],
  ["EPSG:6346", "+proj=utm +zone=17 +ellps=GRS80 +units=m +no_defs"],
  ["EPSG:6347", "+proj=utm +zone=18 +ellps=GRS80 +units=m +no_defs"],
  ["EPSG:6348", "+proj=utm +zone=19 +ellps=GRS80 +units=m +no_defs"],
  [
    "EPSG:26910",
    "+proj=utm +zone=10 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ",
  ],
  [
    "EPSG:26911",
    "+proj=utm +zone=11 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ",
  ],
  [
    "EPSG:26912",
    "+proj=utm +zone=12 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ",
  ],
  [
    "EPSG:26913",
    "+proj=utm +zone=13 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ",
  ],
  [
    "EPSG:26914",
    "+proj=utm +zone=14 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ",
  ],
  [
    "EPSG:26915",
    "+proj=utm +zone=15 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ",
  ],
  [
    "EPSG:26916",
    "+proj=utm +zone=16 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ",
  ],
  [
    "EPSG:26917",
    "+proj=utm +zone=17 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ",
  ],
  [
    "EPSG:26918",
    "+proj=utm +zone=18 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ",
  ],
  [
    "EPSG:26919",
    "+proj=utm +zone=19 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ",
  ],
]);

export class MapView {
  constructor(viewer) {
    this.viewer = viewer;
    console.log("map view", this);
    this.webMapService = "WMTS";
    this.mapProjectionName = "EPSG:3857";
    this.mapProjection = proj4.defs(this.mapProjectionName);
    console.log("map projection", this.mapProjection);
    this.sceneProjection = null;
    this.floorPlan = {};
    this.thumbnail = {};

    this.extentsLayer = null;
    this.cameraLayer = null;
    this.toolLayer = null;
    this.sourcesLayer = null;
    this.sourcesLabelLayer = null;
    this.images360Layer = null;
    this.enabled = false;
    this.calledOnce = false;
    let downloadControls = null;
    this.staticImageLayers = new Map();

    this.createAnnotationStyle = (text) => {
      return [
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 10,
            stroke: new ol.style.Stroke({
              color: [255, 255, 255, 0.5],
              width: 2,
            }),
            fill: new ol.style.Fill({
              color: [0, 0, 0, 0.5],
            }),
          }),
        }),
      ];
    };

    this.createLabelStyle = (text) => {
      let style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          stroke: new ol.style.Stroke({
            color: "white",
            width: 2,
          }),
          fill: new ol.style.Fill({
            color: "green",
          }),
        }),
        text: new ol.style.Text({
          font: "12px helvetica,sans-serif",
          text: text,
          fill: new ol.style.Fill({
            color: "#000",
          }),
          stroke: new ol.style.Stroke({
            color: "#fff",
            width: 2,
          }),
        }),
      });

      return style;
    };
  }

  showSources(show) {
    this.sourcesLayer.setVisible(show);
    this.sourcesLabelLayer.setVisible(show);
  }

  init() {
    if (typeof ol === "undefined") {
      return;
    }
    this.elMap = $("#potree_map");
    this.elMap.draggable({ handle: $("#potree_map_header") });
    this.elMap.resizable();

    this.elTooltip = $(`<div style="position: relative; z-index: 100"></div>`);
    this.elMap.append(this.elTooltip);

    let extentsLayer = this.getExtentsLayer();
    let cameraLayer = this.getCameraLayer();
    this.getToolLayer();
    let sourcesLayer = this.getSourcesLayer();
    this.images360Layer = this.getImages360Layer();
    this.getSourcesLabelLayer();
    this.getAnnotationsLayer();

    let mousePositionControl = new ol.control.MousePosition({
      coordinateFormat: ol.coordinate.createStringXY(5),
      projection: "EPSG:4326",
      undefinedHTML: "&nbsp;",
    });

    let _this = this;
    let DownloadSelectionControl = function (optOptions) {
      let options = optOptions || {};

      // TOGGLE TILES
      let btToggleTiles = document.createElement("button");
      btToggleTiles.innerHTML = "T";
      btToggleTiles.addEventListener(
        "click",
        () => {
          let visible = sourcesLayer.getVisible();
          _this.showSources(!visible);
        },
        false
      );
      btToggleTiles.style.float = "left";
      btToggleTiles.title = "show / hide tiles";
      // DOWNLOAD SELECTED TILES
      let link = document.createElement("a");
      link.href = "#";
      link.download = "list.txt";
      link.style.float = "left";

      let button = document.createElement("button");
      button.innerHTML = "D";
      link.appendChild(button);
      let handleDownload = (e) => {
        let features = selectedFeatures.getArray();

        let url = [
          document.location.protocol,
          "//",
          document.location.host,
          document.location.pathname,
        ].join("");
        if (features.length === 0) {
          alert(
            "No tiles were selected. Select area with ctrl + left mouse button!"
          );
          e.preventDefault();
          e.stopImmediatePropagation();
          return false;
        } else if (features.length === 1) {
          let feature = features[0];

          if (feature.source) {
            let cloudjsurl = feature.pointcloud.pcoGeometry.url;
            let sourceurl = new URL(
              url + "/../" + cloudjsurl + "/../source/" + feature.source.name
            );
            link.href = sourceurl.href;
            link.download = feature.source.name;
          }
        } else {
          let content = "";
          for (let i = 0; i < features.length; i++) {
            let feature = features[i];

            if (feature.source) {
              let cloudjsurl = feature.pointcloud.pcoGeometry.url;
              let sourceurl = new URL(
                url + "/../" + cloudjsurl + "/../source/" + feature.source.name
              );
              content += sourceurl.href + "\n";
            }
          }
          let uri = "data:application/octet-stream;base64," + btoa(content);
          link.href = uri;
          link.download = "list_of_files.txt";
        }
      };

      // assemble container
      let element = document.createElement("div");
      element.className = "ol-unselectable ol-control";
      element.appendChild(link);
      element.appendChild(btToggleTiles);
      element.style.bottom = "0.5em";
      element.style.left = "0.5em";
      element.title =
        "Download file or list of selected tiles. Select tile with left mouse button or area using ctrl + left mouse.";

      ol.control.Control.call(this, {
        element: element,
        target: options.target,
      });
    };
    ol.inherits(DownloadSelectionControl, ol.control.Control);
    (this.downloadControls = new DownloadSelectionControl()),
      (this.map = new ol.Map({
        controls: ol.control
          .defaults({
            attributionOptions: {
              collapsible: false,
            },
          })
          .extend([
            // this.controls.zoomToExtent,
            this.downloadControls,
            mousePositionControl,
          ]),
        layers: [
          new ol.layer.Tile({ source: new ol.source.OSM() }),
          this.toolLayer,
          this.annotationsLayer,
          this.sourcesLayer,
          this.sourcesLabelLayer,
          this.images360Layer,
          extentsLayer,
          cameraLayer,
        ],
        target: "potree_map_content",
        view: new ol.View({
          center: this.olCenter,
          zoom: 9,
        }),
      }));

    // DRAGBOX / SELECTION
    this.dragBoxLayer = new ol.layer.Vector({
      source: new ol.source.Vector({}),
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: "rgba(0, 0, 255, 1)",
          width: 2,
        }),
      }),
    });
    this.map.addLayer(this.dragBoxLayer);

    let select = new ol.interaction.Select();
    this.map.addInteraction(select);
    let selectedFeatures = select.getFeatures();

    let dragBox = new ol.interaction.DragBox({
      condition: ol.events.condition.platformModifierKeyOnly,
    });

    this.map.addInteraction(dragBox);

    // this.map.on('pointermove', evt => {
    // 	let pixel = evt.pixel;
    // 	let feature = this.map.forEachFeatureAtPixel(pixel, function (feature) {
    // 		return feature;
    // 	});

    // 	// console.log(feature);
    // 	// this.elTooltip.css("display", feature ? '' : 'none');
    // 	this.elTooltip.css('display', 'none');
    // 	if (feature && feature.onHover) {
    // 		feature.onHover(evt);
    // 		// overlay.setPosition(evt.coordinate);
    // 		// tooltip.innerHTML = feature.get('name');
    // 	}
    // });

    this.map.on("click", (evt) => {
      let pixel = evt.pixel;
      let feature = this.map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
      });

      if (feature && feature.onClick) {
        feature.onClick(evt);
      }
    });

    dragBox.on("boxend", (e) => {
      // features that intersect the box are added to the collection of
      // selected features, and their names are displayed in the "info"
      // div
      let extent = dragBox.getGeometry().getExtent();
      this.getSourcesLayer()
        .getSource()
        .forEachFeatureIntersectingExtent(extent, (feature) => {
          selectedFeatures.push(feature);
        });
    });

    // clear selection when drawing a new box and when clicking on the map
    dragBox.on("boxstart", (e) => {
      selectedFeatures.clear();
    });
    this.map.on("click", () => {
      selectedFeatures.clear();
    });

    this.viewer.addEventListener("scene_changed", (e) => {
      this.setScene(e.scene);
    });

    this.onPointcloudAdded = (e) => {
      this.load(e.pointcloud);
    };

    this.on360ImagesAdded = (e) => {
      this.addImages360(e.images);
    };

    this.onAnnotationAdded = (e) => {
      if (!this.sceneProjection) {
        return;
      }

      let annotation = e.annotation;
      let position = annotation.position;
      let mapPos = this.toMap.forward([position.x, position.y]);
      let feature = new ol.Feature({
        geometry: new ol.geom.Point(mapPos),
        name: annotation.title,
      });
      feature.setStyle(this.createAnnotationStyle(annotation.title));

      feature.onHover = (evt) => {
        let coordinates = feature.getGeometry().getCoordinates();
        let p = this.map.getPixelFromCoordinate(coordinates);

        this.elTooltip.html(annotation.title);
        this.elTooltip.css("display", "");
        this.elTooltip.css("left", `${p[0]}px`);
        this.elTooltip.css("top", `${p[1]}px`);
      };

      feature.onClick = (evt) => {
        annotation.clickTitle();
      };
      this.getAnnotationsLayer().getSource().addFeature(feature);
    };
    // this.map.getView().fit(extentsLayer.getSource().getExtent(), {
    // 	size: this.map.getSize(),
    // 	padding: [25, 25, 25, 25],
    // 	nearest: false
    // });

    this.setScene(this.viewer.scene);
    this.addMapButtons();
  }

  setScene(scene) {
    if (this.scene === scene) {
      return;
    }

    if (this.scene) {
      this.scene.removeEventListener(
        "pointcloud_added",
        this.onPointcloudAdded
      );
      this.scene.removeEventListener("360_images_added", this.on360ImagesAdded);
      this.scene.annotations.removeEventListener(
        "annotation_added",
        this.onAnnotationAdded
      );
    }

    this.scene = scene;

    this.scene.addEventListener("pointcloud_added", this.onPointcloudAdded);
    this.scene.addEventListener("360_images_added", this.on360ImagesAdded);
    this.scene.annotations.addEventListener(
      "annotation_added",
      this.onAnnotationAdded
    );

    for (let pointcloud of this.viewer.scene.pointclouds) {
      this.load(pointcloud);
    }

    this.viewer.scene.annotations.traverseDescendants((annotation) => {
      this.onAnnotationAdded({ annotation: annotation });
    });

    for (let images of this.viewer.scene.images360) {
      this.on360ImagesAdded({ images: images });
    }
  }

  getExtentsLayer() {
    if (this.extentsLayer) {
      return this.extentsLayer;
    }

    this.gExtent = new ol.geom.LineString([
      [0, 0],
      [0, 0],
    ]);

    let feature = new ol.Feature(this.gExtent);
    let featureVector = new ol.source.Vector({
      features: [feature],
    });

    this.extentsLayer = new ol.layer.Vector({
      source: featureVector,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(255, 255, 255, 0.2)",
        }),
        stroke: new ol.style.Stroke({
          color: "#0000ff",
          width: 2,
        }),
        image: new ol.style.Circle({
          radius: 3,
          fill: new ol.style.Fill({
            color: "#0000ff",
          }),
        }),
      }),
    });

    return this.extentsLayer;
  }

  getAnnotationsLayer() {
    if (this.annotationsLayer) {
      return this.annotationsLayer;
    }

    this.annotationsLayer = new ol.layer.Vector({
      source: new ol.source.Vector({}),
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(255, 0, 0, 1)",
        }),
        stroke: new ol.style.Stroke({
          color: "rgba(255, 0, 0, 1)",
          width: 2,
        }),
      }),
    });

    return this.annotationsLayer;
  }

  getCameraLayer() {
    if (this.cameraLayer) {
      return this.cameraLayer;
    }

    // CAMERA LAYER
    this.gCamera = new ol.geom.LineString([
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ]);
    let feature = new ol.Feature(this.gCamera);
    let featureVector = new ol.source.Vector({
      features: [feature],
    });

    this.cameraLayer = new ol.layer.Vector({
      source: featureVector,
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: "#0000ff",
          width: 2,
        }),
      }),
      zIndex: 40,
    });

    return this.cameraLayer;
  }

  getToolLayer() {
    if (this.toolLayer) {
      return this.toolLayer;
    }

    this.toolLayer = new ol.layer.Vector({
      source: new ol.source.Vector({}),
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(255, 0, 0, 1)",
        }),
        stroke: new ol.style.Stroke({
          color: "rgba(255, 0, 0, 1)",
          width: 2,
        }),
      }),
    });

    return this.toolLayer;
  }

  getImages360Layer() {
    if (this.images360Layer) {
      return this.images360Layer;
    }

    let style = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 2.7,
        stroke: new ol.style.Stroke({
          color: [255, 0, 0, 1],
          width: 1,
        }),
        fill: new ol.style.Fill({
          color: [255, 100, 100, 1],
        }),
      }),
    });

    let layer = new ol.layer.Vector({
      source: new ol.source.Vector({}),
      style: style,
      zIndex: 30,
    });

    this.images360Layer = layer;

    return this.images360Layer;
  }

  getSourcesLayer() {
    if (this.sourcesLayer) {
      return this.sourcesLayer;
    }

    this.sourcesLayer = new ol.layer.Vector({
      source: new ol.source.Vector({}),
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(0, 0, 150, 0.1)",
        }),
        stroke: new ol.style.Stroke({
          color: "rgba(0, 0, 150, 1)",
          width: 1,
        }),
      }),
      zIndex: 20,
    });

    return this.sourcesLayer;
  }

  getSourcesLabelLayer() {
    if (this.sourcesLabelLayer) {
      return this.sourcesLabelLayer;
    }

    this.sourcesLabelLayer = new ol.layer.Vector({
      source: new ol.source.Vector({}),
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(255, 0, 0, 0.1)",
        }),
        stroke: new ol.style.Stroke({
          color: "rgba(255, 0, 0, 1)",
          width: 2,
        }),
      }),
      minResolution: 0.01,
      maxResolution: 20,
    });

    return this.sourcesLabelLayer;
  }

  setSceneProjection(sceneProjection) {
    this.sceneProjection = sceneProjection;
    this.toMap = proj4(this.sceneProjection, this.mapProjection);
    this.toScene = proj4(this.mapProjection, this.sceneProjection);
    // this.toMap = proj4(this.sceneProjection, this.sceneProjection);
    // this.toScene = proj4(this.sceneProjection, this.sceneProjection);
  }

  getMapExtent() {
    let bb = this.viewer.getBoundingBox();
    //console.log("this is the bb ",bb);
    let bottomLeft = this.toMap.forward([bb.min.x, bb.min.y]);
    let bottomRight = this.toMap.forward([bb.max.x, bb.min.y]);
    let topRight = this.toMap.forward([bb.max.x, bb.max.y]);
    let topLeft = this.toMap.forward([bb.min.x, bb.max.y]);

    // let bottomLeft = [bb.min.x, bb.min.y];
    // let bottomRight = [bb.max.x, bb.min.y];
    // let topRight = [bb.max.x, bb.max.y];
    // let topLeft = [bb.min.x, bb.max.y];

    let extent = {
      bottomLeft: bottomLeft,
      bottomRight: bottomRight,
      topRight: topRight,
      topLeft: topLeft,
    };
    //console.log("this is the extend ",extent);
    return extent;
  }

  getMapCenter() {
    let mapExtent = this.getMapExtent();

    let mapCenter = [
      (mapExtent.bottomLeft[0] + mapExtent.topRight[0]) / 2,
      (mapExtent.bottomLeft[1] + mapExtent.topRight[1]) / 2,
    ];
    return mapCenter;
  }

  updateToolDrawings() {
    this.toolLayer.getSource().clear();

    let profiles = this.viewer.profileTool.profiles;
    for (let i = 0; i < profiles.length; i++) {
      let profile = profiles[i];
      let coordinates = [];

      for (let j = 0; j < profile.points.length; j++) {
        let point = profile.points[j];
        let pointMap = this.toMap.forward([point.x, point.y]);
        coordinates.push(pointMap);
      }

      let line = new ol.geom.LineString(coordinates);
      let feature = new ol.Feature(line);
      this.toolLayer.getSource().addFeature(feature);
    }
    let measurements = this.viewer.measuringTool.measurements;
    for (let i = 0; i < measurements.length; i++) {
      let measurement = measurements[i];
      let coordinates = [];

      for (let j = 0; j < measurement.points.length; j++) {
        let point = measurement.points[j].position;
        let pointMap = this.toMap.forward([point.x, point.y]);
        // let pointMap = [point.x, point.y];
        coordinates.push(pointMap);
      }

      if (measurement.closed && measurement.points.length > 0) {
        coordinates.push(coordinates[0]);
      }

      let line = new ol.geom.LineString(coordinates);
      let feature = new ol.Feature(line);
      this.toolLayer.getSource().addFeature(feature);
    }
  }

  addImages360(images) {
    let transform = this.toMap.forward;
    let layer = this.getImages360Layer();
    
    const heightThreshold = 1.2;
    const proximityThreshold = 9;
    
    // Helper function to get prefix and numeric value
    const parseImagePath = (path) => {
        const match = path.match(/(\d+)_(\d+)_(\d+)/);
        if (match) {
            return {
                prefix: `${match[1]}_${match[2]}`,
                number: parseInt(match[3])
            };
        }
        return null;
    };

    // First create all point features with correct indices
    let points = [];
    for (let i = 0; i < images.images.length; i++) {
        let currentImage = images.images[i];
        let currentPos = currentImage.position;
        
        let p = transform([currentPos[0], currentPos[1]]);
        let pointFeature = new ol.Feature({
            geometry: new ol.geom.Point(p)
        });

        // Add click handler with original index
        pointFeature.onClick = () => {
            images.focus(currentImage);
            var evt = new CustomEvent("piHotSpotClickMiniMapEvent", { detail: i });
            window.dispatchEvent(evt);
        };
        
        layer.getSource().addFeature(pointFeature);
        
        // Store point info for line creation
        points.push({
            feature: pointFeature,
            image: currentImage,
            position: p,
            path: currentImage.file
        });
    }

    // Now sort points by prefix for line creation
    points.sort((a, b) => {
        const pathA = parseImagePath(a.path);
        const pathB = parseImagePath(b.path);

        if (pathA && pathB) {
            if (pathA.prefix !== pathB.prefix) {
                return pathA.prefix.localeCompare(pathB.prefix);
            }
            return pathA.number - pathB.number;
        }
        return 0;
    });

    // Create lines between sorted points within same prefix groups
    let currentPrefix = null;
    let lastPoint = null;
    let lastImage = null;
    let groupColor = null;

    points.forEach((point, index) => {
        let parsedPath = parseImagePath(point.path);
        
        if (parsedPath) {
            if (currentPrefix !== parsedPath.prefix) {
                // Start new group
                currentPrefix = parsedPath.prefix;
                lastPoint = point.position;
                lastImage = point.image;
                groupColor = 'green';
                return;
            }

            // Check height and proximity within same prefix group
            if (lastImage && lastPoint) {
                let heightDiff = Math.abs(point.image.position[2] - lastImage.position[2]);
                let horizontalDist = Math.sqrt(
                    Math.pow(point.image.position[0] - lastImage.position[0], 2) +
                    Math.pow(point.image.position[1] - lastImage.position[1], 2)
                );

                // Only connect points if they meet both criteria
                if (heightDiff <= heightThreshold && horizontalDist <= proximityThreshold) {
                    let lineFeature = new ol.Feature({
                        geometry: new ol.geom.LineString([lastPoint, point.position])
                    });

                    lineFeature.setStyle(new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: groupColor,
                            width: 2
                        })
                    }));

                    layer.getSource().addFeature(lineFeature);
                }
            }
            
            lastPoint = point.position;
            lastImage = point.image;
        }
    });
}

// Helper method to create line features for a group
createLineFeatures(group, transform, layer) {
    for (let i = 0; i < group.length - 1; i++) {
        let p1 = transform([
            group[i].position[0],
            group[i].position[1]
        ]);
        
        let p2 = transform([
            group[i + 1].position[0],
            group[i + 1].position[1]
        ]);

        let lineFeature = new ol.Feature({
            geometry: new ol.geom.LineString([p1, p2])
        });

        // Create a random color for this group
        // Set line style
        lineFeature.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "green",
                width: 2
            })
        }));

        layer.getSource().addFeature(lineFeature);
    }
}

  async load(pointcloud) {
    if (!pointcloud) {
      return;
    }

    if (!pointcloud.projection) {
      return;
    }

    if (!this.sceneProjection) {
      try {
        this.setSceneProjection(pointcloud.projection);
      } catch (e) {
        console.log("Failed projection:", e);

        if (pointcloud.fallbackProjection) {
          try {
            console.log("Trying fallback projection...");
            this.setSceneProjection(pointcloud.fallbackProjection);
            console.log("Set projection from fallback");
          } catch (e) {
            console.log("Failed fallback projection:", e);
            return;
          }
        } else {
          return;
        }
      }
    }
    let mapExtent = this.getMapExtent();
    let mapCenter = this.getMapCenter();
    let view = this.map.getView();
    view.setCenter(mapCenter);
    this.gExtent.setCoordinates([
      mapExtent.bottomLeft,
      mapExtent.bottomRight,
      mapExtent.topRight,
      mapExtent.topLeft,
      mapExtent.bottomLeft,
    ]);

    // Apply dynamic padding
    if (!this.viewer.isUnityView()) {
      view.fit(this.gExtent, [300, 300], {
        // Top, Right, Bottom, Left
        constrainResolution: false,
      });
    }

    if (pointcloud.pcoGeometry.type == "ept") {
      return;
    }
    let url = `${pointcloud.pcoGeometry.url}`;
    //let response = await fetch(url);

    fetch(url)
      .then(async (response) => {
        let data = await response.json();
        data.sources = [
          {
            name: data.name,
            points: data.points,
            bounds: {
              min: data.boundingBox.min,
              max: data.boundingBox.max,
            },
          },
        ];
        let sources = data.sources;

        for (let i = 0; i < sources.length; i++) {
          let source = sources[i];
          let name = source.name;
          let bounds = source.bounds;

          let mapBounds = {
            min: this.toMap.forward([bounds.min[0], bounds.min[1]]),
            max: this.toMap.forward([bounds.max[0], bounds.max[1]]),
            // min: [bounds.min[0], bounds.min[1]],
            // max: [bounds.max[0], bounds.max[1]]
          };
          let mapCenter = [
            (mapBounds.min[0] + mapBounds.max[0]) / 2,
            (mapBounds.min[1] + mapBounds.max[1]) / 2,
          ];
          let p1 = this.toMap.forward([bounds.min[0], bounds.min[1]]);
          let p2 = this.toMap.forward([bounds.max[0], bounds.min[1]]);
          let p3 = this.toMap.forward([bounds.max[0], bounds.max[1]]);
          let p4 = this.toMap.forward([bounds.min[0], bounds.max[1]]);

          // let p1 = [bounds.min[0], bounds.min[1]];
          // let p2 = [bounds.max[0], bounds.min[1]];
          // let p3 = [bounds.max[0], bounds.max[1]];
          // let p4 = [bounds.min[0], bounds.max[1]];

          // let feature = new ol.Feature({
          //	'geometry': new ol.geom.LineString([p1, p2, p3, p4, p1])
          // });
          let feature = new ol.Feature({
            geometry: new ol.geom.Polygon([[p1, p2, p3, p4, p1]]),
          });
          feature.source = source;
          feature.pointcloud = pointcloud;
          this.getSourcesLayer().getSource().addFeature(feature);

          feature = new ol.Feature({
            geometry: new ol.geom.Point(mapCenter),
            name: name,
          });
          feature.setStyle(this.createLabelStyle(name));
          this.sourcesLabelLayer.getSource().addFeature(feature);
        }
      })
      .catch(() => {});
  }

  toggle() {
    if (this.elMap.is(":visible")) {
      this.elMap.css("display", "none");
      this.enabled = false;
    } else {
      this.elMap.css("display", "block");
      this.enabled = true;
    }
  }

  getImageExtends(center, width, height) {
    let halfWidth = width / 2;
    let halfHeight = height / 2;
    //    console.log("This is the center ", center ,{
    // 	x: center.x - halfWidth,
    // 	y: center.y - halfHeight
    // } ,{
    // 	x: center.x + halfWidth,
    // 	y: center.y + halfHeight
    // })
    let min = {
      x: center.x - halfWidth,
      y: center.y - halfHeight,
    };

    let max = {
      x: center.x + halfWidth,
      y: center.y + halfHeight,
    };

    let bottomLeft = this.toMap.forward([min.x, min.y]);
    let bottomRight = this.toMap.forward([max.x, min.y]);
    let topRight = this.toMap.forward([max.x, max.y]);
    let topLeft = this.toMap.forward([min.x, max.y]);

    let extent = {
      bottomLeft: bottomLeft,
      bottomRight: bottomRight,
      topRight: topRight,
      topLeft: topLeft,
    };
    return extent;
  }

  // ...existing code...
  removeDownloadSelectionControl() {
    this.map.removeControl(this.downloadControls);
  }
  setMiniMapImage(url, center, width, height, isFloorPlan=false) {
    let imageExtents = this.getImageExtends(center, width, height);

    let imageExtent = [
        imageExtents.bottomLeft[0],
        imageExtents.bottomLeft[1],
        imageExtents.topRight[0],
        imageExtents.topRight[1]
    ];

    // Initialize storage for layers if not exists
    if (!this.staticImageLayers) {
        this.staticImageLayers = new Map(); // Using Map to store url-layer pairs
    }

    // Check if layer with this URL already exists
    if (this.staticImageLayers.has(url)) {
        console.log('Layer with this URL already exists');
        return;
    }

    // Create new static image layer
    let staticImageLayer = new ol.layer.Image({
        source: new ol.source.ImageStatic({
            url: url,
            imageExtent: imageExtent,
        }),
        zIndex: isFloorPlan ? 10 : 0,
    });

    // Add the new layer to the map and store it
    this.map.addLayer(staticImageLayer);
    this.staticImageLayers.set(url, staticImageLayer);
}

  changeMiniMapPosition(top, left, size, url, center, width, height) {
    //console.log("this is called how many tiems ");
    this.elMap.css("top", `${top / 2}vh`);
    this.elMap.css("left", `${left / 2}vw`);
    this.elMap.css("width", `${size}px`);
    this.elMap.css("height", `${size}px`);
    let elMapHeader = $("#potree_map_header");
    elMapHeader.css("background-color", "#fffe");
    elMapHeader.css("width", "60%");
    elMapHeader.css("height", "8px");
    elMapHeader.css("left", "50%");
    elMapHeader.css("transform", "translateX(-50%)");
    elMapHeader.css("border-radius", "4px");
    elMapHeader.css("top", "10px");
    if (this.calledOnce == true) return;
    this.elMap.css("display", "block");
    this.enabled = true;
    let view = this.map.getView();
    let extendsSize = 300;
    if (size <= 150) {
      extendsSize = 100;
    } else if (size <= 200) {
      extendsSize = 150;
    } else if (size == 300) {
      extendsSize = 300;
    }
    // Apply dynamic padding
    view.fit(this.gExtent, [extendsSize, extendsSize], {
      // Top, Right, Bottom, Left
      constrainResolution: false,
    });
    this.setMiniMapImage(url, center, width, height);
    //this.updateExtentsLayer();

    if (this.map && this.viewer.isUnityView()) {
      //console.log("We are trying to remove this");
      this.map.removeLayer(this.extentsLayer);
      this.map.removeLayer(this.sourcesLabelLayer);
      this.map.removeLayer(this.sourcesLayer);
      if (size <= 200) {
        this.removeDownloadSelectionControl();
      }
    }

    this.calledOnce = true;
  }
  update(delta) {
    if (!this.sceneProjection) {
      return;
    }

    let pm = $("#potree_map");

    if (!this.enabled) {
      return;
    }

    // resize
    let mapSize = this.map.getSize();
    let resized =
      mapSize &&
      mapSize.length >= 2 &&
      (pm.width() !== mapSize[0] || pm.height() !== mapSize[1]);
    if (resized) {
      this.map.updateSize();
    }

    //
    let camera = this.viewer.scene.getActiveCamera();

    let scale = this.map.getView().getResolution();
    let campos = camera.position;
    let camdir = camera.getWorldDirection(new THREE.Vector3());
    //camdir.negate();
    //console.log("this is the camdir ",camdir);
    let sceneLookAt = camdir
      .clone()
      .multiplyScalar(30 * scale)
      .add(campos);
    let geoPos = camera.position;
    let geoLookAt = sceneLookAt;
    let mapPos = new THREE.Vector2().fromArray(
      this.toMap.forward([geoPos.x, geoPos.y])
    );
    let mapLookAt = new THREE.Vector2().fromArray(
      this.toMap.forward([geoLookAt.x, geoLookAt.y])
    );
    let mapDir = new THREE.Vector2().subVectors(mapLookAt, mapPos).normalize();

    mapLookAt = mapPos.clone().add(mapDir.clone().multiplyScalar(30 * scale));
    let mapLength = mapPos.distanceTo(mapLookAt);
    let mapSide = new THREE.Vector2(-mapDir.y, mapDir.x);

    let p1 = mapPos.toArray();
    let p2 = mapLookAt
      .clone()
      .sub(mapSide.clone().multiplyScalar(0.3 * mapLength))
      .toArray();
    let p3 = mapLookAt
      .clone()
      .add(mapSide.clone().multiplyScalar(0.3 * mapLength))
      .toArray();

    this.gCamera.setCoordinates([p1, p2, p3, p1]);
  }

  get sourcesVisible() {
    return this.getSourcesLayer().getVisible();
  }

  set sourcesVisible(value) {
    this.getSourcesLayer().setVisible(value);
  }

  addMapButtons() {
    const mapContainer = this.map.getTargetElement();
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "ol-unselectable ol-control"
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.bottom = '0.5em';
    buttonContainer.style.right = '0.5em';
  
    const createButton = (label, onClick) => {
      const button = document.createElement('button');
      button.innerHTML = label;
      button.addEventListener('click', onClick);
      return button;
    };
  
    const floorPlanButton = createButton('F', () => {
      if (!this.viewer.floorPlanEnabled) {
        if (this.viewer.thumbnailEnabled) {
          this.removeMiniMapImage(this.thumbnail.url);
        }
        if (this.floorPlan.url) {
          this.viewer.setMiniMapImageInPotree(
            this.floorPlan.url,
            {
              x: this.floorPlan.center.x,
              y: this.floorPlan.center.y,
            },
            this.floorPlan.width,
            this.floorPlan.height,
          );
          this.viewer.floorPlanEnabled = true;
          this.viewer.thumbnailEnabled = false
        } else {
          console.warn('Floor plan data not available.');
          alert('Floor plan data not available.');
        }
      }
    });
  
    const thumbnailButton = createButton('T', () => {
      if (!this.viewer.thumbnailEnabled) {
        if (this.viewer.floorPlanEnabled) {
          this.removeMiniMapImage(this.floorPlan.url);
        }
        if (this.thumbnail.url) {
          this.viewer.setMiniMapImageInPotree(
            this.thumbnail.url,
            {
              x: this.thumbnail.center.x,
              y: this.thumbnail.center.y,
            },
            this.thumbnail.width,
            this.thumbnail.height
          );
          this.viewer.floorPlanEnabled = false;
          this.viewer.thumbnailEnabled = true
        } else {
          console.warn('Thumbnail data not available.');
          alert('Thumbnail data not available.');
        }
      }
    });
  
    buttonContainer.appendChild(floorPlanButton);
    buttonContainer.appendChild(thumbnailButton);

    ol.control.Control.call(this, {
      element: buttonContainer,
    });
    mapContainer.appendChild(buttonContainer);
  }

  removeMiniMapImage(urlToRemove) {
    if (this.staticImageLayers && this.staticImageLayers.has(urlToRemove)) {
      const layerToRemove = this.staticImageLayers.get(urlToRemove);
      this.map.removeLayer(layerToRemove);
      this.staticImageLayers.delete(urlToRemove);
      console.log(`Removed mini-map image layer with URL: ${urlToRemove}`);
    } else {
      console.warn(`No mini-map image layer found with URL: ${urlToRemove}`);
    }
  }
}
