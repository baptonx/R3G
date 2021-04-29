import * as THREE from 'three';
import {Object3D} from 'three/src/core/Object3D';



export class SqueletteAnimation {
  root: Object3D;
  // articulation1: THREE.Mesh;
  // articulation2: THREE.Mesh;

  constructor(){
    this.root = new Object3D();

    /*
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
     */
  }

  addArticulation(): void {
    const geometry = new THREE.BoxGeometry( 0.15, 0.15, 0.15 );
    const material = new THREE.MeshPhongMaterial( {color: 0xff0000} );
    const articulation = new THREE.Mesh(geometry, material);
    articulation.receiveShadow = true;
    articulation.castShadow = true;
    this.root.add(articulation);
  }


addArticulationPoids(list: Array<number>): void {
    const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
    const material = new THREE.MeshPhongMaterial( {color: 'rgba(' + Math.floor(list[0]) + ',' +
        Math.floor(list[1]) + ',' + Math.floor(list[2]) + ',' + Math.floor(list[3]) + ')'} );
    const articulation = new THREE.Mesh(geometry, material);
    articulation.receiveShadow = true;
    articulation.castShadow = true;
    this.root.add(articulation);
  }

  public initialize(): void {
    this.root = new Object3D();
  }



}
