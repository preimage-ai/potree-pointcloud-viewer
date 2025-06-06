import { IFCLoader } from "../../../libs/three.js/extra/IFCLoader.js";
import * as THREE from "../../../libs/three.js/build/three.module.js";
import { IFCUNITASSIGNMENT } from "../../../libs/three.js/extra/ifc/web-ifc-api.js";

// Global scale factor shared across all IFC instances
let globalIFCScaleFactor = null;


export class IFC {

	constructor(viewer) {
		this.viewer = viewer;
		this.ifcLoader = new IFCLoader();
		this.ifcLoader.ifcManager.setWasmPath('../../../libs/three.js/extra/ifc/');
	}

	load(url, scene, name, visible = true, matrix = [], forceScaleFactor = null) {
		return new Promise((resolve, reject) => {
			this.ifcLoader.load(url, async (model) => {
				console.log("ifc loaded");

				console.log("model", model);
				console.log("modelId", model.modelID);
				const unit = await this.ifcLoader.ifcManager.getAllItemsOfType(
					model.modelID,
					IFCUNITASSIGNMENT,
					false
				)
				console.log(unit)

				let scaleFactor = 1.0;
				
				// If a scale factor is forced, use it directly
				if (forceScaleFactor !== null) {
					console.log(`Using forced scale factor: ${forceScaleFactor}`);
					scaleFactor = forceScaleFactor;
				} else if (!unit || unit.length === 0) {
					console.warn("No unit assignments found in IFC file.");
					// Use the global scale factor if available
					if (globalIFCScaleFactor !== null) {
						console.log(`Using global scale factor: ${globalIFCScaleFactor}`);
						scaleFactor = globalIFCScaleFactor;
					} else {
						// Default to feet-to-meters as that seems to be common
						scaleFactor = 0.3048;
						console.log(`No global scale factor found. Using default: ${scaleFactor}`);
						// Set the global scale factor to this default
						globalIFCScaleFactor = scaleFactor;
					}
				} else {
					const unitAssignment = await this.ifcLoader.ifcManager.getItemProperties(
						model.modelID,
						unit[0],
						false
					)
					console.log(unitAssignment)

					let lengthUnit = null;

					// Check each unit in the Units array
					for (let i = 0; i < unitAssignment.Units.length; i++) {
						const unitRef = unitAssignment.Units[i];
						const unitId = unitRef.value;

						// Get the properties of each unit
						const unit = await this.ifcLoader.ifcManager.getItemProperties(
							model.modelID,
							unitId,
							true
						);

						console.log(`Unit ${i} (ID: ${unitId}):`, unit);

						// Check if this is a length unit
						if (unit.UnitType && unit.UnitType.value === 'LENGTHUNIT') {
							console.log("🎯 Found length unit!");
							console.log("Unit Name:", unit.Name?.value);
							console.log("Unit Prefix:", unit.Prefix?.value);
							console.log("Full unit object:", unit);

							lengthUnit = unit;

							// Determine scale factor based on the unit
							const unitName = unit.Name?.value;
							const prefix = unit.Prefix?.value;

							if (unitName === 'METRE') {
								if (prefix === 'MILLI') {
									scaleFactor = 0.001; // millimeters to meters
								} else if (prefix === 'CENTI') {
									scaleFactor = 0.01; // centimeters to meters
								} else {
									scaleFactor = 1.0; // meters
								}
							} else if (unitName === 'FOOT') {
								scaleFactor = 0.3048; // feet to meters
							} else if (unitName === 'INCH') {
								scaleFactor = 0.0254; // inches to meters
							} else {
								console.warn(`Unknown unit: ${prefix || ''}${unitName}`);
								scaleFactor = 1.0;
							}

							console.log(`Scale factor determined: ${scaleFactor}`);
							break; // Found the length unit, no need to continue
						}
					}

					if (lengthUnit) {
						console.log(`Applying scale factor: ${scaleFactor} for unit: ${lengthUnit.Prefix?.value || ''}${lengthUnit.Name?.value}`);
						// Store the determined scale factor globally for future use
						globalIFCScaleFactor = scaleFactor;
						console.log(`Storing global scale factor: ${scaleFactor}`);
					} else {
						console.log("No length unit found, using default scaling");
						scaleFactor = 0.3048; // Default to feet-to-meters
						// Store this default globally
						globalIFCScaleFactor = scaleFactor;
						console.log(`Storing default global scale factor: ${scaleFactor}`);
					}
				}
				// Apply the determined or forced scale factor
				console.log(`Applying final scale factor: ${scaleFactor}`);
				model.mesh.scale.multiplyScalar(scaleFactor);

				// model.mesh.rotateX(Math.PI * 0.5);

				model.mesh.rotateX(Math.PI * 0.5);
				// model.scale.multiplyScalar(0.3048);
				model.mesh.name = name;

				const directionalLight1 = new THREE.DirectionalLight(0xffeeff, 0.8);
				directionalLight1.position.set(1, 1, 1);

				const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
				directionalLight2.position.set(- 1, 0.5, - 1);
				const ambientLight = new THREE.AmbientLight(0xffffee, 0.25);

				scene.scene.add(ambientLight, directionalLight1, directionalLight2, model.mesh);
				model.visible = visible;

				if (matrix && matrix.length > 0) {
					const mat = new THREE.Matrix4();
					mat.set(
						matrix[0][0], matrix[0][1], matrix[0][2], matrix[0][3],
						matrix[1][0], matrix[1][1], matrix[1][2], matrix[1][3],
						matrix[2][0], matrix[2][1], matrix[2][2], matrix[2][3],
						matrix[3][0], matrix[3][1], matrix[3][2], matrix[3][3]
					);
					model.mesh.applyMatrix4(mat);
					model.mesh.updateMatrixWorld(true);
				}

				scene.addIfc(model.mesh);
				resolve(model.mesh);
			}, undefined, (error) => reject(null));
		});
	};
}