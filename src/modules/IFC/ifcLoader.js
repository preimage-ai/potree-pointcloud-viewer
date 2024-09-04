import { IFCLoader } from "../../../libs/three.js/extra/IFCLoader.js";
import * as THREE from "../../../libs/three.js/build/three.module.js";

export class IFC {

	constructor(viewer){
		this.viewer = viewer;
		this.ifcLoader = new IFCLoader();
		this.ifcLoader.ifcManager.setWasmPath('../../../libs/three.js/extra/ifc/');
	}

	load(url){
        console.log("inside ifc load", this.viewer)
		this.ifcLoader.load(url, (model) => {
            console.log("ifc loaded");
			const scene = this.viewer.scene.scene;

			model.mesh.rotateX(Math.PI * 0.5);
			model.scale.multiplyScalar(0.3048);
			model.mesh.name = "ifc";

			const directionalLight1 = new THREE.DirectionalLight(0xffeeff, 0.8);
			directionalLight1.position.set(1, 1, 1);

			const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
			directionalLight2.position.set(- 1, 0.5, - 1);

			const ambientLight = new THREE.AmbientLight(0xffffee, 0.25);
			scene.add(ambientLight,directionalLight1, directionalLight2, model.mesh);

			this.viewer.scene.addIfc(model.mesh);

		});
	};
}