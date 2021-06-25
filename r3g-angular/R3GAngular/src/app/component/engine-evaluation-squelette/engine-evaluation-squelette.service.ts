import {ElementRef, Injectable, NgZone, OnDestroy} from '@angular/core';
import * as THREE from 'three';
import {AnimationClip, AnimationMixer, Clock, VectorKeyframeTrack} from 'three';
import {TrackballControls} from 'three/examples/jsm/controls/TrackballControls';
import {SqueletteAnimation} from '../../class/ThreeJS/squelette-animation';
import {EvaluationService} from '../../module/evaluation/evaluation.service';
import {BddService} from '../../service/bdd.service';

interface MaScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: TrackballControls;
}

interface MaSceneElement {
  elem: ElementRef<HTMLCanvasElement>;
  fn: (rect: DOMRect) => void;
}


@Injectable({
  providedIn: 'root'
})
export class EngineEvaluationSqueletteService implements OnDestroy {
  private listElementHtmlRefresh: Array<ElementRef<HTMLCanvasElement>> = [];
  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  public sceneElements: Array<MaSceneElement> = [];
  public clip!: AnimationClip;
  private frameId!: number;
  public squelette: SqueletteAnimation = new SqueletteAnimation();
  public controls!: TrackballControls;
  public facteurGrossissement = 1.5;
  public facteurScale = 1;
  private lastCameraPosition = 0;

  constructor(private ngZone: NgZone, public evaluationServ: EvaluationService, public bddService: BddService) {
    this.evaluationServ.pauseAction = true;
  }

  public ngOnDestroy(): void {
    if (this.frameId !== 0) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public initialize(canvas: ElementRef<HTMLCanvasElement> | undefined, listElementHtml: Array<ElementRef<HTMLCanvasElement>> | undefined
                  , refresh: boolean): void {
    this.sceneElements = [];
    this.frameId = 0;

    if (!refresh && canvas !== undefined) {
      this.canvas = canvas.nativeElement;
    }
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, alpha: true, antialias: true});
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // this.sequenceCurrent = Array.from(this.sequencesChargeesService.sequences.values())[0];

    const sceneInitFunctionsByName = {
      ['box']: (elem: HTMLCanvasElement) => {
        const {scene, camera, controls} = this.makeScene('rgb(30,30,30)', elem);
        if (this.evaluationServ.sequenceCurrent !== undefined && this.evaluationServ.showSquelette === true) {
          const tabPositionArticulation: Array<VectorKeyframeTrack> = [];

          const tabPosX: Array<number> = [];
          const tabPosY: Array<number> = [];
          const tabPosZ: Array<number> = [];
          let averageX: number;
          let averageY: number;
          let averageZ: number;

          for (const frame of this.evaluationServ.sequenceCurrent.traceNormal[0]) {
            tabPosX.push(frame[0]);
            tabPosY.push(frame[1]);
            tabPosZ.push(frame[2]);
          }

          averageX = this.calculateAverage(tabPosX);
          averageY = this.calculateAverage(tabPosY);
          averageZ = this.calculateAverage(tabPosZ);


          this.squelette.initialize();
          for (let i = 0; i < this.evaluationServ.sequenceCurrent.traceNormal.length; i++) {
            const tabPosXYZ: Array<number> = [];
            const tabTime: Array<number> = [];
            this.squelette.addArticulation();

            for (const frame of this.evaluationServ.sequenceCurrent.traceNormal[i]) {
              tabPosXYZ.push((frame[0] - averageX) * this.facteurGrossissement);
              tabPosXYZ.push((frame[1] - averageY) * this.facteurGrossissement);
              tabPosXYZ.push((frame[2] - averageZ) * this.facteurGrossissement);
              tabTime.push(frame[3] / this.facteurScale);
            }

            if (i === 0) {
              this.evaluationServ.tabTimeCurrent = tabTime;
            }

            const positionArticulation = new VectorKeyframeTrack(
              '.children[' + i + '].position',
              tabTime,
              tabPosXYZ,
            );
            tabPositionArticulation.push(positionArticulation);
            this.evaluationServ.tempsTotal = tabTime[tabTime.length - 1];
          }

          console.log('temps total : ' + this.evaluationServ.tempsTotal);
          this.clip = new AnimationClip('move', -1, tabPositionArticulation);

          /*
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
           */
        } else {
          this.clip = new AnimationClip('move', -1, []);
        }

        scene.add(this.squelette.root);
        const mixer = new AnimationMixer(this.squelette.root);
        this.evaluationServ.action = mixer.clipAction(this.clip);
        this.evaluationServ.action.loop = THREE.LoopOnce;
        this.evaluationServ.action.clampWhenFinished = true;
        // this.action.time = 4;
        // this.clip.duration = this.action.time;
        this.stopToStart();

        const clock = new Clock();
        return (rect: DOMRect) => {
          this.evaluationServ.draw();
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

    if (!refresh && listElementHtml !== undefined) {
      for (const element of listElementHtml) {
        this.listElementHtmlRefresh.push(element);
        // console.log(this.listElementHtmlRefresh);
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
    } else {
      for (const element of this.listElementHtmlRefresh) {
        const sceneName = element.nativeElement.dataset.diagram;
        let key: 'box' = 'box';
        if (sceneName === 'box') {
          key = 'box';
        }
        const sceneInitFunction: (elem: HTMLCanvasElement) => (rect: DOMRect) => void = sceneInitFunctionsByName[key];
        const sceneRenderFunction = sceneInitFunction(element.nativeElement);
        this.addScene(element, sceneRenderFunction);
      }
    }
  }

  public refreshInitialize(): void {
    this.initialize(undefined, undefined, true);
  }

  public addScene(elem: ElementRef<HTMLCanvasElement>, fn: (rect: DOMRect) => void): void {
    this.sceneElements.push({elem, fn});
  }

  public makeScene(bg: string, elem: HTMLCanvasElement): MaScene {
    const scene = new THREE.Scene();
    if (bg !== null) {
      scene.background = new THREE.Color(bg);
    }
    scene.background = new THREE.Color(0x707070);
    scene.fog = new THREE.Fog(0x707070, 10, 50);

    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 1, -8);
    camera.lookAt(0, 0, 0);

    scene.add(camera);

    const controls = new TrackballControls(camera, elem);
    // controls.noPan = true;
    controls.rotateSpeed = 2;
    this.controls = controls;


    // light
    const ambientLight = new THREE.AmbientLight(0Xffffff, 0.2);
    scene.add(ambientLight);

    const light = new THREE.PointLight(0xffffff, 1, 30);
    light.position.set(2, 5, -2);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;
    scene.add(light);

    // ground
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({color: 0x999999}));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -1.7;
    mesh.receiveShadow = true;
    scene.add(mesh);

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

  public render(): void {
    this.resizeRendererToDisplaySize();

    this.renderer.setScissorTest(false);
    this.renderer.setClearColor('black', 0);
    this.renderer.clear(true, true);
    this.renderer.setScissorTest(true);

    this.renderer.domElement.style.transform = `translateY(${window.scrollY}px)`;

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
    this.evaluationServ.play();
  }

  public playForward(): void {
    this.evaluationServ.playForward()
  }

  public playBackward(): void {
    this.evaluationServ.playBackward()
  }

  public stopToStart(): void {
    this.evaluationServ.stopToStart();
  }

  public stopToEnd(): void {
    this.evaluationServ.stopToEnd();
  }

  public pause(): void {
    this.evaluationServ.pause();
  }
  updateActionTime(event: any): void {
    const timeEditText = Number(event.target.value);
    if (timeEditText >= 0 && timeEditText <= this.evaluationServ.tempsTotal) {
      this.evaluationServ.action.time = timeEditText;
    }
  }

  updateSizeCube(event: any): void {
    const size = Number(event.target.value);
    if (size > 0) {
      for (const cube of this.squelette.root.children) {
        cube.scale.set(size, size, size);
      }
    }
  }

  updateTimeScale(event: any): void {
    const scale = Number(event.target.value);
    if (scale > 0) {
      this.facteurScale = scale;
      this.refreshInitialize();
    }
  }

  public resetCamera(): void {
    this.controls.position0 = new THREE.Vector3(0, 1, -8) ;
    this.lastCameraPosition = 0;
    this.controls.update();
    this.controls.reset();
  }

  public changeCameraSpot(): void{
    if (this.lastCameraPosition === 0) {
      this.controls.position0 = new THREE.Vector3(-8, this.controls.position0.y, 0);
      this.lastCameraPosition = 1;
    }
    else if (this.lastCameraPosition === 1) {
      this.controls.position0 = new THREE.Vector3(0, this.controls.position0.y, 8);
      this.lastCameraPosition = 2;
    }
    else if (this.lastCameraPosition === 2) {
      this.controls.position0 = new THREE.Vector3(8, this.controls.position0.y, 0);
      this.lastCameraPosition = 3;
    }
    else{
      this.controls.position0 = new THREE.Vector3(0, this.controls.position0.y, -8) ;
      this.lastCameraPosition = 0;
    }
    this.controls.update();
    this.controls.reset();

  }

  public calculateAverage(tab: Array<number>): number {
    let average = 0;
    for (const n of tab) {
      average = average + Number(n);
    }
    return average / tab.length;
  }
}
