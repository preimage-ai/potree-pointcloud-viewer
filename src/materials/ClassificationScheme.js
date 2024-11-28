
import * as THREE from "../../libs/three.js/build/three.module.js";

export const ClassificationScheme = {
	DEFAULT: {
		0:       { visible: true, name: 'never classified'  , color: [0.5,  0.5,  0.5,  1.0] },
		1:       { visible: true, name: 'unclassified'      , color: [0.5,  0.5,  0.5,  1.0] },
		2:       { visible: true, name: 'ground'            , color: [0.63, 0.32, 0.18, 1.0] },
		3:       { visible: true, name: 'low vegetation'    , color: [0.0,  1.0,  0.0,  1.0] },
		4:       { visible: true, name: 'medium vegetation' , color: [0.0,  0.8,  0.0,  1.0] },
		5:       { visible: true, name: 'high vegetation'   , color: [0.0,  0.6,  0.0,  1.0] },
		6:       { visible: true, name: 'building'          , color: [1.0,  0.66, 0.0,  1.0] },
		7:       { visible: true, name: 'low point(noise)'  , color: [1.0,  0.0,  1.0,  1.0] },
		8:       { visible: true, name: 'key-point'         , color: [1.0,  0.0,  0.0,  1.0] },
		9:       { visible: true, name: 'water'             , color: [0.0,  0.0,  1.0,  1.0] },
		12:      { visible: true, name: 'overlap'           , color: [1.0,  1.0,  0.0,  1.0] },
		DEFAULT: { visible: true, name: 'default'           , color: [0.3,  0.6,  0.6,  0.5] },
	},
	PREIMAGE: {
	  0: { visible: true, name: 'Wall', color: [0.47, 0.47, 0.47, 1.0] },
	  1: { visible: true, name: 'Building', color: [0.71, 0.47, 0.47, 1.0] },
	  2: { visible: true, name: 'Sky', color: [0.02, 0.9, 0.9, 1.0] },
	  3: { visible: true, name: 'Floor', color: [0.31, 0.2, 0.2, 1.0] },
	  4: { visible: true, name: 'Tree', color: [0.02, 0.78, 0.01, 1.0] },
	  5: { visible: true, name: 'Ceiling', color: [0.47, 0.47, 0.31, 1.0] },
	  6: { visible: true, name: 'Road', color: [0.55, 0.55, 0.55, 1.0] },
	  7: { visible: true, name: 'Bed', color: [0.8, 0.02, 1.0, 1.0] },
	  8: { visible: true, name: 'Window', color: [0.9, 0.9, 0.9, 1.0] },
	  9: { visible: true, name: 'Grass', color: [0.02, 0.98, 0.03, 1.0] },
	  10: { visible: true, name: 'Cabinet', color: [0.88, 0.02, 1.0, 1.0] },
	  11: { visible: true, name: 'Sidewalk', color: [0.92, 1.0, 0.03, 1.0] },
	  13: { visible: true, name: 'Ground', color: [0.47, 0.47, 0.27, 1.0] },
	  14: { visible: true, name: 'Door', color: [0.03, 1.0, 0.2, 1.0] },
	  15: { visible: true, name: 'Table', color: [1.0, 0.02, 0.32, 1.0] },
	  17: { visible: true, name: 'Plant', color: [0.8, 1.0, 0.02, 1.0] },
	  18: { visible: true, name: 'Curtain', color: [1.0, 0.2, 0.03, 1.0] },
	  19: { visible: true, name: 'Chair', color: [0.8, 0.27, 0.01, 1.0] },
	  20: { visible: true, name: 'Car', color: [0.0, 0.4, 0.78, 1.0] },
	  21: { visible: true, name: 'Water', color: [0.24, 0.9, 0.98, 1.0] },
	  22: { visible: true, name: 'Painting', color: [0.98, 0.02, 0.32, 1.0] },
	  23: { visible: true, name: 'Sofa', color: [0.04, 0.4, 1.0, 1.0] },
	  24: { visible: true, name: 'Shelf', color: [1.0, 0.04, 0.28, 1.0] },
	  27: { visible: true, name: 'Mirror', color: [0.86, 0.86, 0.86, 1.0] },
	  28: { visible: true, name: 'Rug', color: [1.0, 0.04, 0.36, 1.0] },
	  30: { visible: true, name: 'Armchair', color: [0.03, 1.0, 0.84, 1.0] },
	  31: { visible: true, name: 'Seat', color: [0.03, 1.0, 0.88, 1.0] },
	  32: { visible: true, name: 'Fence', color: [1.0, 0.72, 0.02, 1.0] },
	  33: { visible: true, name: 'Desk', color: [0.04, 1.0, 0.28, 1.0] },
	  34: { visible: true, name: 'Rock', color: [1.0, 0.16, 0.04, 1.0] },
	  35: { visible: true, name: 'Wardrobe', color: [0.03, 1.0, 1.0, 1.0] },
	  36: { visible: true, name: 'Lamp', color: [0.88, 1.0, 0.03, 1.0] },
	  37: { visible: true, name: 'Bathtub', color: [0.4, 0.04, 1.0, 1.0] },
	  38: { visible: true, name: 'Railing', color: [1.0, 0.24, 0.02, 1.0] },
	  42: { visible: true, name: 'Pillar', color: [1.0, 0.03, 0.16, 1.0] },
	  50: { visible: true, name: 'Refrigerator', color: [0.08, 1.0, 0.0, 1.0] },
	  59: { visible: true, name: 'Staircase', color: [0.12, 0.8, 1.0, 1.0] },
	  65: { visible: true, name: 'Toilet', color: [0.0, 1.0, 0.52, 1.0] },
	  72: { visible: true, name: 'Palm', color: [0.0, 0.32, 1.0, 1.0] },
	  82: { visible: true, name: 'Light', color: [1.0, 0.76, 0.02, 1.0] },
	  200: { visible: true, name: 'Noise', color: [0.0, 0.0, 0.0, 0.0] }
	}
  };  

Object.defineProperty(ClassificationScheme, 'RANDOM', {
	get: function() { 

		let scheme = {};

		for(let i = 0; i <= 255; i++){
			scheme[i] = new THREE.Vector4(Math.random(), Math.random(), Math.random());
		}

		scheme["DEFAULT"] = new THREE.Vector4(Math.random(), Math.random(), Math.random());

		return scheme;
	}
});