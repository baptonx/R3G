import * as THREE from 'three';
import {ElementRef, Injectable, NgZone, OnDestroy} from '@angular/core';
import {AnimationAction, AnimationClip, AnimationMixer, Clock, NumberKeyframeTrack, VectorKeyframeTrack} from 'three';
import {SqueletteAnimation} from '../../class/ThreeJS/squelette-animation';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import {MatSlider} from '@angular/material/slider';
import {TimelineService} from '../timeline/timeline.service';
import {AnnotationService} from '../../module/annotation/annotation.service';

interface MaScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: TrackballControls;
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
  public clip!: AnimationClip;
  private frameId!: number;
  public squelette: SqueletteAnimation = new SqueletteAnimation();
  public controls!: TrackballControls;

    constructor(private ngZone: NgZone, private annotationServ: AnnotationService) {
      this.annotationServ.pauseAction = true;
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
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, alpha: true, antialias: true});
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const sceneInitFunctionsByName = {
      ['box']: (elem: HTMLCanvasElement) => {
        const {scene, camera, controls} = this.makeScene('rgb(30,30,30)', elem);

        scene.add(this.squelette.root);

        // ANIMATION
        const positionArticulation1 = new VectorKeyframeTrack(
          '.children[0].position',
          [0, 4, 6],
          [-2, 1, 0, -2, 2, 0, -2, 1, 0],
        );
        const positionArticulation2 = new VectorKeyframeTrack(
          '.children[1].position',
          [0, 4, 6],
          [2, 1, 0, 2, 2, 0, 2, 1, 0],
        );
        this.annotationServ.tempsTotal = 6;
        this.clip = new AnimationClip('move', -1, [
          positionArticulation1,
          positionArticulation2
        ]);
        const mixer = new AnimationMixer(this.squelette.root);
        this.annotationServ.action = mixer.clipAction(this.clip);
        this.annotationServ.action.loop = THREE.LoopOnce;
        this.annotationServ.action.clampWhenFinished = true;
        // this.action.time = 4;
        // this.clip.duration = this.action.time;
        // action.play();
        this.stopToStart();

        const clock = new Clock();
        return (rect: DOMRect) => {
          this.annotationServ.draw();
          const delta = clock.getDelta();
          mixer.update(delta);
          camera.aspect = rect.width / rect.height;
          camera.updateProjectionMatrix();
          controls.handleResize();
          controls.update();
          this.renderer.render(scene, camera);
        };
      }/*,
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
      },*/
    };

    for (const element of listElementHtml) {
      const sceneName = element.nativeElement.dataset.diagram;
      // let key: 'box'|'pyramid' = 'box';
      let key: 'box' = 'box';
      if (sceneName === 'box') {
        key = 'box';
      }
      /*
      else if (sceneName === 'pyramid') {
        key = 'pyramid';
      }
       */
      const sceneInitFunction: (elem: HTMLCanvasElement) => (rect: DOMRect) => void = sceneInitFunctionsByName[key];
      const sceneRenderFunction = sceneInitFunction(element.nativeElement);
      this.addScene(element, sceneRenderFunction);
    }
  }

  public addScene(elem: ElementRef<HTMLCanvasElement>, fn: (rect: DOMRect) => void): void {
    this.sceneElements.push({elem, fn});
  }

  public makeScene(bg: string, elem: HTMLCanvasElement): MaScene {
    const scene = new THREE.Scene();
    if (bg !== null) {
      scene.background = new THREE.Color(bg);
    }
    scene.background = new THREE.Color( 0x707070 );
    scene.fog = new THREE.Fog( 0x707070, 10, 50 );

    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set( 0, 6, 15 );
    camera.lookAt( 0, 6, 0 );

    scene.add(camera);

    const controls = new TrackballControls(camera, elem);
    controls.noPan = true;
    controls.rotateSpeed = 0.5;
    this.controls = controls;


    // light
    const ambientLight = new THREE.AmbientLight(0Xffffff, 0.2);
    scene.add(ambientLight);

    const light = new THREE.PointLight(0xffffff, 1, 30);
    light.position.set(0, 5, 3);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;
    scene.add(light);

    // ground
    const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x999999 } ) );
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add( mesh );

    return {scene, camera, controls};
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
          this.render();
        });
      }
    });
  }

  public getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  public play(): void {
      if (this.annotationServ.pauseAction === true) {
        this.playForward();
      }
      else {
        this.annotationServ.action.timeScale = 1;
        this.annotationServ.pauseAction = true;
        this.clip.duration = this.annotationServ.action.time;
        this.annotationServ.action.play();
      }
  }

  public playForward(): void {
    this.annotationServ.pauseAction = false;
    const t = this.annotationServ.action.time;
    this.annotationServ.action.stop();
    this.annotationServ.action.time = t;
    this.clip.duration = this.annotationServ.tempsTotal;
    this.annotationServ.action.timeScale = 1;
    this.annotationServ.action.play();
  }

  public playBackward(): void {
    this.annotationServ.pauseAction = false;
    const t = this.annotationServ.action.time;
    this.annotationServ.action.stop();
    this.annotationServ.action.time = t;
    this.clip.duration = this.annotationServ.tempsTotal;
    // this.annotationServ.action.setLoop(THREE.LoopOnce);
    this.annotationServ.action.timeScale = -1;
    this.annotationServ.action.play();
  }

  public stopToStart(): void {
      this.annotationServ.action.timeScale = 1;
      this.annotationServ.action.stop();
      this.annotationServ.action.time = 0;
      this.clip.duration = 0;
      this.annotationServ.action.play();
      this.annotationServ.pauseAction = true;
  }

  public stopToEnd(): void {
    this.annotationServ.action.timeScale = 1;
    this.annotationServ.action.stop();
    this.annotationServ.action.time = this.annotationServ.tempsTotal;
    this.clip.duration = this.annotationServ.tempsTotal;
    this.annotationServ.action.play();
    this.annotationServ.pauseAction = true;
  }

  public pause(): void {
      this.annotationServ.pauseAction = true;
      this.clip.duration = this.annotationServ.action.time;
      this.annotationServ.action.play();
  }

  updateActionTime(event: any): void {
      const timeEditText = Number(event.target.value);
      if (timeEditText >= 0 && timeEditText <= this.annotationServ.tempsTotal) {
        this.annotationServ.action.time = timeEditText;
      }
  }

  public resetCamera(): void {
    this.controls.reset();
  }

}
