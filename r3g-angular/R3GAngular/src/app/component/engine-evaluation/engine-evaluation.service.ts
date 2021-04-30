import {ElementRef, Injectable, NgZone, OnDestroy, OnInit} from '@angular/core';
import * as THREE from 'three';
import {AnimationClip, AnimationMixer, Clock, VectorKeyframeTrack} from 'three';
import {SqueletteAnimation} from '../../class/ThreeJS/squelette-animation';
import {TrackballControls} from 'three/examples/jsm/controls/TrackballControls';
import {BddService} from '../../service/bdd.service';
import {Poids} from '../../class/evaluation/poids';
import {EvaluationService} from '../../module/evaluation/evaluation.service';
import {SequencesChargeesService} from '../../service/sequences-chargees.service';
import {Model} from '../../class/evaluation/model';
import {HttpClient} from '@angular/common/http';
import {Sequence} from '../../class/commun/sequence';

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
export class EngineEvaluationService implements OnDestroy {
  private listElementHtmlRefresh: Array<ElementRef<HTMLCanvasElement>> = [];
  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  public sceneElements: Array<MaSceneElement> = [];
  public clip!: AnimationClip;
  public filtre: Array<string> = [];
  public layerList: Set<string>;
  public layerSelected = '';
  public filtreSelected = '';
  modelSelected = '';
  modelesList: Array<Model> = [];
  public poids: Array<Poids> = [];
  public model = '';
  private frameId!: number;
  public squelette: SqueletteAnimation = new SqueletteAnimation();
  public controls!: TrackballControls;
  public sequences: Set<Sequence> = new Set<Sequence>();
  public sequenceCurrent!: Sequence;
  public facteurGrossissement = 1.5;
  public facteurScale = 0.001;

  constructor(private ngZone: NgZone, public evalService: EvaluationService, public bddService: BddService,
              public sequencesChargeesService: SequencesChargeesService, public http: HttpClient) {
    this.layerList = new Set<string>();
    this.sequences = this.sequencesChargeesService.sequences1;
    this.evalService.pauseAction = true;

  }

  changeValue(value: any): void {
    this.layerList.clear();
    this.modelesList.forEach(elt => {
        if (elt.idM === value) {
          this.modelSelected = elt.idM;
        }
      }
    );
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

    if (refresh === false && canvas !== undefined) {
      this.canvas = canvas.nativeElement;
    }
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, alpha: true, antialias: true});
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // this.sequenceCurrent = Array.from(this.sequencesChargeesService.sequences.values())[0];

    console.log(this.sequenceCurrent);
    const sceneInitFunctionsByName = {
      ['box']: (elem: HTMLCanvasElement) => {
        const {scene, camera, controls} = this.makeScene('rgb(30,30,30)', elem);
        const tabPositionArticulation: Array<VectorKeyframeTrack> = [];
        for (let x = 0; x < 16; x++) {
          for (let y = 0; y < 16; y++) {
            for (let z = 0; z < 16; z++) {
              const tabPosXYZ: Array<number> = [];
              if (z === 3 && y === 2) {
                this.squelette.addArticulationBlackAndWhite('black');
              } else {
                this.squelette.addArticulationBlackAndWhite('white');
              }
              tabPosXYZ.push(x);
              tabPosXYZ.push(y);
              tabPosXYZ.push(z);
              const id = x + y * 16 + z * 16 * 16;
              const positionArticulation1 = new VectorKeyframeTrack(
                '.children[' + id + '].position',
                [0],
                tabPosXYZ,
              );
              tabPositionArticulation.push(positionArticulation1);
            }
          }
        }

        this.clip = new AnimationClip('move', 0, tabPositionArticulation);
        scene.add(this.squelette.root);
        const mixer = new AnimationMixer(this.squelette.root);
        this.evalService.action = mixer.clipAction(this.clip);
        this.evalService.action.loop = THREE.LoopOnce;
        this.evalService.action.clampWhenFinished = true;
        // this.action.time = 4;
        // this.clip.duration = this.action.time;
        this.stopToStart();

        const clock = new Clock();
        return (rect: DOMRect) => {
          this.evalService.draw();
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

    if (refresh === false && listElementHtml !== undefined) {
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

  public initPoids(canvas: ElementRef<HTMLCanvasElement> | undefined, listElementHtml: Array<ElementRef<HTMLCanvasElement>> | undefined
                 , refresh: boolean): void {
    this.sceneElements = [];
    this.frameId = 0;

    if (refresh === false && canvas !== undefined) {
      this.canvas = canvas.nativeElement;
    }
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, alpha: true, antialias: true});
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // this.sequenceCurrent = Array.from(this.sequencesChargeesService.sequences.values())[0];
    const s = this.bddService.sequenceCourante;

    const sceneInitFunctionsByName = {
      ['box']: (elem: HTMLCanvasElement) => {
        const {scene, camera, controls} = this.makeScene('rgb(30,30,30)', elem);
        const tabPositionArticulation: Array<VectorKeyframeTrack> = [];
        this.squelette.initialize();
        // tslint:disable-next-line:no-shadowed-variable
        this.poids.forEach(elem => {
          if (this.layerSelected === elem.name && elem.numero === Number(this.filtreSelected) - 1) {
            for (let temps = 0; temps < elem.filtre.length; temps++) {
              for (let x = 0; x < elem.filtre[temps].length; x++) {
                for (let y = 0; y < elem.filtre[temps][x].length; y++) {
                  for (let z = 0; z < elem.filtre[temps][x][y].length; z++) {
                    const tabPosXYZ: Array<number> = [];
                    this.squelette.addArticulationPoids(elem.filtre[temps][x][y][z]);
                    tabPosXYZ.push(temps + x * elem.filtre.length);
                    tabPosXYZ.push(y);
                    tabPosXYZ.push(z);
                    const id = temps + x * elem.filtre.length + y * elem.filtre.length *
                      elem.filtre[temps].length + z * elem.filtre.length *
                      elem.filtre[temps].length * elem.filtre[temps][x].length;
                    const positionArticulation1 = new VectorKeyframeTrack(
                      '.children[' + id + '].position',
                      [0],
                      tabPosXYZ,
                    );
                    tabPositionArticulation.push(positionArticulation1);
                  }
                }
              }
            }
          }
        });
        console.log(tabPositionArticulation.length);
        this.clip = new AnimationClip('move', 0, tabPositionArticulation);


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


        scene.add(this.squelette.root);
        const mixer = new AnimationMixer(this.squelette.root);
        this.evalService.action = mixer.clipAction(this.clip);
        this.evalService.action.loop = THREE.LoopOnce;
        this.evalService.action.clampWhenFinished = true;
        // this.clip.duration = this.action.time;
        this.stopToStart();

        const clock = new Clock();
        return (rect: DOMRect) => {
          this.evalService.draw();
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

    if (refresh === false && listElementHtml !== undefined) {
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


  public stopToStart(): void {
    this.evalService.action.timeScale = 1;
    this.evalService.action.stop();
    this.evalService.action.time = 0;
    this.clip.duration = 0;
    this.evalService.action.play();
    this.evalService.pauseAction = true;
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

  public playForward(): void {
    this.evalService.pauseAction = false;
    const t = this.evalService.action.time;
    console.log(this.evalService.action);
    this.evalService.action.stop();
    this.evalService.action.time = t;
    this.clip.duration = this.evalService.tempsTotal;
    this.evalService.action.timeScale = 1;
    this.evalService.action.play();
  }

  public refreshInitialize(): void {
    this.initialize(undefined, undefined, true);
  }


  public play(): void {
    if (this.evalService.pauseAction === true) {
      this.playForward();
    }
    this.evalService.action.timeScale = 1;
    this.evalService.pauseAction = true;
    this.clip.duration = this.evalService.action.time;
    this.evalService.action.play();
  }


  public pause(): void {
    this.evalService.pauseAction = true;
    this.clip.duration = this.evalService.action.time;
    this.evalService.action.play();
  }


  public resetCamera(): void {
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
