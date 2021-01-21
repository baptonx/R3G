import * as THREE from 'three';
import {ElementRef, Injectable, NgZone, OnDestroy} from '@angular/core';

interface MaScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  mesh: THREE.Mesh;
}

interface MaSceneElement {
  elem: ElementRef<HTMLCanvasElement>;
  fn: (rect: DOMRect) => void;
}


@Injectable()
export class EngineService implements OnDestroy {
  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  public sceneElements: Array<MaSceneElement> = [];
  private frameId!: number;

  constructor(private ngZone: NgZone) {
  }

  public ngOnDestroy(): void {
    if (this.frameId !== 0) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public initialize(canvas: ElementRef<HTMLCanvasElement>, listElementHtml: Array<ElementRef<HTMLCanvasElement>>): void {
    this.sceneElements = [];
    this.frameId = 0;

    this.canvas = canvas.nativeElement;
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, alpha: true});


    const x1 = this.getRandomInt(255);
    const x2 = this.getRandomInt(255);
    const x3 = this.getRandomInt(255);
    const sceneInitFunctionsByName = {
      ['box']: () => {
        let {scene, camera, mesh} = this.makeScene('rgb('+x1+','+x2+','+x3+')');
        const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({color: 'red'});
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        return (rect: DOMRect) => {
          mesh.rotation.y += 0.01;
          camera.aspect = rect.width / rect.height;
          camera.updateProjectionMatrix();
          this.renderer.render(scene, camera);
        };
      },
      ['pyramid']: () => {
        let {scene, camera, mesh} = this.makeScene('black');
        const radius = .8;
        const widthSegments = 4;
        const heightSegments = 2;
        const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
        const material = new THREE.MeshPhongMaterial({
          color: 'blue',
          flatShading: true,
        });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        return (rect: DOMRect) => {
          mesh.rotation.y += 0.01;
          camera.aspect = rect.width / rect.height;
          camera.updateProjectionMatrix();
          this.renderer.render(scene, camera);
        };
      },
    };

    for (const element of listElementHtml) {
      const sceneName = element.nativeElement.dataset.diagram;
      if (sceneName === 'box') {
        const key: 'box' = 'box';
        const sceneInitFunction: () => (rect: DOMRect) => void = sceneInitFunctionsByName[key];
        const sceneRenderFunction = sceneInitFunction();
        this.addScene(element, sceneRenderFunction);
      }
      else if (sceneName === 'pyramid') {
        const key: 'pyramid' = 'pyramid';
        const sceneInitFunction: () => (rect: DOMRect) => void = sceneInitFunctionsByName[key];
        const sceneRenderFunction = sceneInitFunction();
        this.addScene(element, sceneRenderFunction);
      }
    }
  }

  public addScene(elem: ElementRef<HTMLCanvasElement>, fn: (rect: DOMRect) => void): void {
    this.sceneElements.push({elem, fn});
  }

  public makeScene(bg: string): MaScene {
    const scene = new THREE.Scene();
    if (bg !== null) {
      scene.background = new THREE.Color(bg);
    }

    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 1, 2);
    camera.lookAt(0, 0, 0);

    {
      const color = 0xFFFFFF;
      const intensity = 1;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(-1, 2, 4);
      scene.add(light);
    }
    const mesh = new THREE.Mesh();
    return {scene, camera, mesh};
  }

  public resizeRendererToDisplaySize(): boolean {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, false);
    }
    return needResize;
  }

  public render(): void{
    this.resizeRendererToDisplaySize();

    this.renderer.setScissorTest(false);
    this.renderer.setClearColor('black', 0);
    this.renderer.clear(true, true);
    this.renderer.setScissorTest(true);

    const transform = `translateY(${window.scrollY}px)`;
    this.renderer.domElement.style.transform = transform;

    for (const {elem, fn} of this.sceneElements) {
      // get the viewport relative position of this element
      const rect = elem.nativeElement.getBoundingClientRect();
      const {left, right, top, bottom, width, height} = rect;

      const isOffscreen =
        bottom < 0 ||
        top > this.renderer.domElement.clientHeight ||
        right < 0 ||
        left > this.renderer.domElement.clientWidth;

      if (!isOffscreen) {
        const positiveYUpBottom = this.renderer.domElement.clientHeight - bottom;
        this.renderer.setScissor(left, positiveYUpBottom, width, height);
        this.renderer.setViewport(left, positiveYUpBottom, width, height);

        fn(rect);
      }
    }


    requestAnimationFrame(() => {
      this.render();
    });
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          //this.render();
        });
      }
    });
  }

  public getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }


}
