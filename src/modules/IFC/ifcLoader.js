import { IFCLoader } from "../../../libs/three.js/extra/IFCLoader.js";
import * as THREE from "../../../libs/three.js/build/three.module.js";

export class IFC {

	constructor(viewer){
		this.viewer = viewer;
		this.ifcLoader = new IFCLoader();
		this.ifcLoader.ifcManager.setWasmPath('../../../libs/three.js/extra/ifc/');
	}

	load(url, scene, name, visible = true){
		return new Promise((resolve, reject) => {
			this.ifcLoader.load(url, (model) => {
				console.log("ifc loaded");
	
				model.mesh.rotateX(Math.PI * 0.5);
				// model.scale.multiplyScalar(0.3048);
				model.mesh.name = name;
	
				const directionalLight1 = new THREE.DirectionalLight(0xffeeff, 0.8);
				directionalLight1.position.set(1, 1, 1);
	
				const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
				directionalLight2.position.set(- 1, 0.5, - 1);
				const ambientLight = new THREE.AmbientLight(0xffffee, 0.25);
				
				scene.scene.add(ambientLight,directionalLight1, directionalLight2, model.mesh);
				model.visible = visible;
				scene.addIfc(model.mesh);
				resolve(model.mesh);
			}, undefined, (error) => resolve(null));
		});
	};
}