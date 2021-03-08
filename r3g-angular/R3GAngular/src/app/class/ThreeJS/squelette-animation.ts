import * as THREE from 'three';
import {Object3D} from 'three/src/core/Object3D';

export class SqueletteAnimation {
  root: Object3D;
  articulation1: THREE.Mesh;
  articulation2: THREE.Mesh;

  constructor(){
    this.root = new Object3D();

    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshPhongMaterial( {color: 0xff0000} );
    this.articulation1 = new THREE.Mesh(geometry, material);
    this.articulation1.receiveShadow = true;
    this.articulation1.castShadow = true;

    this.articulation2 = new THREE.Mesh(geometry, material);
    this.articulation2.receiveShadow = true;
    this.articulation2.castShadow = true;

    this.root.add(this.articulation1);
    this.root.add(this.articulation2);
  }



}
