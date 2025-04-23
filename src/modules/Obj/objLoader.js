import { OBJLoader } from "../../../libs/three.js/loaders/OBJLoader.js";
import * as THREE from "../../../libs/three.js/build/three.module.js";

export class OBJModelLoader {
	constructor(viewer) {
		this.viewer = viewer;
		this.loader = new OBJLoader();
		this.manager = new THREE.LoadingManager();
		this.textureLoader = new THREE.TextureLoader();
	}

	load(objUrl, textureUrl, scene, name = "floor plan", matrix = null, visible = true, rotation = [- Math.PI / 2, 0, 0]) {
		return new Promise((resolve, reject) => {
			this.loader.load(objUrl, (object) => {
				const texture = this.textureLoader.load(textureUrl);
				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;

				object.traverse(child => {
					if (child instanceof THREE.Mesh) {
						child.material = new THREE.MeshBasicMaterial({
							map: texture,
							side: THREE.DoubleSide,
						  });
						child.material.map = texture;
						child.material.needsUpdate = true;
					}
				});
				// object.position.set(...position);
				// object.rotation.set(...rotation);
				object.name = name;
				object.visible = visible;

				if (matrix) {
					const mat = new THREE.Matrix4();
					mat.set(...matrix.flat());
					object.applyMatrix4(mat);
				}

				// Lights
				const directionalLight1 = new THREE.DirectionalLight(0xffeeff, 0.8);
				directionalLight1.position.set(1, 1, 1);
				const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
				directionalLight2.position.set(-1, 0.5, -1);
				const ambientLight = new THREE.AmbientLight(0xffffee, 0.25);

				scene.scene.add(object, ambientLight, directionalLight1, directionalLight2);
				scene.addObj(object);
				resolve(object);

			}, undefined, error => {
				console.error("OBJ load error:", error);
				reject(error);
			});
		});
	}
}
