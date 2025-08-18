import * as GaussianSplats3D from "../../../libs/gsplat/build/gaussian-splats-3d.module.js";
import * as THREE from "../../../libs/three.js/build/three.module.js";

export class Gsplat {
  /**
   * @param {THREE.Scene} scene
   * @param {Object} viewerOptions
   */
  constructor(scene, viewerOptions = {}) {
    if (!(scene instanceof THREE.Scene)) {
      throw new Error("Gsplat: first argument must be a THREE.Scene");
    }

    this.scene = scene;

    this.viewer = new GaussianSplats3D.DropInViewer({
      gpuAcceleratedSort: true,
      ...viewerOptions,
    });

    // Add the DropInViewer to your existing scene
    this.scene.add(this.viewer);
  }

  /**
   * Load one or more splat scenes into the DropInViewer.
   * Accepts either a single URL string or an array of scene definitions.
   *
   * @param {string|Array<Object>} source - url string OR array of scene defs
   *   Scene def example:
   *   {
   *     path: "<path to .ply | .ksplat | .splat>",
   *     name?: "My Splat",
   *     visible?: true,
   *     splatAlphaRemovalThreshold?: 5,
   *     rotation?: [x, y, z, w], // quaternion
   *     scale?: [sx, sy, sz],
   *     position?: [px, py, pz],
   *     modelMatrix?: Float32Array(16) // optional
   *   }
   * @returns {Promise<void>}
   */
  async load(source) {
    const scenes = Array.isArray(source)
      ? source
      : [
          {
            path: source,
            splatAlphaRemovalThreshold: 5,
          },
        ];

    await this.viewer.addSplatScenes(scenes);
  }
  dispose() {
    var v = this.viewer;

    // dispose if present
    if (v && typeof v.dispose === "function") {
      try {
        v.dispose();
      } catch (e) {
        /* noop */
      }
    }

    // remove viewer from the scene if it was added
    if (this.scene && v && this.scene.children) {
      var idx = this.scene.children.indexOf
        ? this.scene.children.indexOf(v)
        : -1;

      if (idx !== -1) {
        this.scene.remove(v);
      }
    }
  }
}
