import {ElementRef, Injectable, NgZone, OnDestroy, OnInit} from '@angular/core';
import * as THREE from 'three';
import {AnimationAction, AnimationClip, AnimationMixer, BoxGeometry, Clock, ColorKeyframeTrack,
        VectorKeyframeTrack, NumberKeyframeTrack} from 'three';
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
  public tempsTotal!: number;
  public action!: AnimationAction;
  public pauseAction: boolean;
  public traceVoxel: Array<Array<Array<Array<number>>>> = [];
  public arr3: Array<AnimationAction> = [];

  constructor(private ngZone: NgZone, public evalService: EvaluationService, public bddService: BddService,
              public sequencesChargeesService: SequencesChargeesService, public http: HttpClient) {
    this.layerList = new Set<string>();
    this.sequences = this.sequencesChargeesService.sequences1;
    this.pauseAction = true;

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
    // this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const sceneInitFunctionsByName = {
      ['box']: (elem: HTMLCanvasElement) => {
        const {scene, camera, controls} = this.makeScene('rgb(30,30,30)', elem, 1);
        const tabPositionArticulation: Array<ColorKeyframeTrack> = [];
        const arr: Array<AnimationAction> = [];
        const arr2: Array<THREE.Mesh> = [];
        this.squelette = new SqueletteAnimation();
        this.squelette.initialize();
        this.arr3 = [];
        const mixers: Array<THREE.AnimationMixer> = [];
        if (this.sequenceCurrent !== undefined) {
          this.traceVoxel = this.sequenceCurrent.traceVoxel;
          const numberX = this.traceVoxel[0].length;
          const numberY = this.traceVoxel[0][0].length;
          const numberZ = this.traceVoxel[0][0][0].length;
          for (let k = 0; k < numberX; k++) {
            for (let j = 0; j < numberY; j++) {
              for (let i = 0; i < numberZ; i++) {
                const material = new THREE.MeshPhongMaterial({color: 0xffffff, opacity: 0.2, transparent: true});
                const object = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), material);
                object.position.x = k;
                object.position.y = j;
                object.position.z = i;
                scene.add(object);
                arr2.push(object);

              }
            }
          }
          let index = 0;
          for (let x = 0; x < this.traceVoxel[0].length; x++) {
            for (let y = 0; y < this.traceVoxel[0][0].length; y++) {
              for (let z = 0; z < this.traceVoxel[0][0][0].length; z++) {
                const tabColor: Array<number> = [];
                const tabTemps: Array<number> = [];
                const opacityKF: Array<number> = [];
                for (let temps = 0; temps < this.traceVoxel.length; temps++) {
                  tabTemps.push(temps);
                  if (this.traceVoxel[temps][x][y][z] === 0) {
                    tabColor.push(1);
                    tabColor.push(1);
                    tabColor.push(1);
                    opacityKF.push(0.2);
                    opacityKF.push(0.2);
                    opacityKF.push(0.2);
                  } else {
                    tabColor.push(0);
                    tabColor.push(0);
                    tabColor.push(0);
                    opacityKF.push(0.8);
                    opacityKF.push(0.8);
                    opacityKF.push(0.8);
                  }
                }
                const positionArticulation1 = new ColorKeyframeTrack(
                  '.material.color',
                  tabTemps,
                  tabColor,
                );
                const positionArticulation2 = new NumberKeyframeTrack(
                  '.material.opacity',
                  tabTemps,
                  opacityKF,
                );


                const colorClip = new THREE.AnimationClip(undefined, -1, [positionArticulation1, positionArticulation2]);
                const id = x + y * this.traceVoxel[0].length + z * this.traceVoxel[0].length * this.traceVoxel[0][0].length;
                const mixer = new THREE.AnimationMixer(arr2[index]);
                index++;
                mixers.push(mixer);
                const ac = mixer.clipAction(colorClip);
                this.arr3.push(ac);
              }
            }
          }
        }


          // this.action.time = 4;
          // this.clip.duration = this.action.time;
          // this.stopToStart();
        const clock = new Clock();
        return (rect: DOMRect) => {
            this.evalService.draw();
            const delta = clock.getDelta();
            for ( let i = 0, l = mixers.length; i < l; i ++ ) {


            mixers[ i ].update( delta );

          }
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

  public playSeq(): void{
    this.arr3.forEach(elt => {
      elt.play();
    });
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
    this.squelette = new SqueletteAnimation();

    // this.sequenceCurrent = Array.from(this.sequencesChargeesService.sequences.values())[0];
    const s = this.bddService.sequenceCourante;

    const sceneInitFunctionsByName = {
      ['box']: (elem: HTMLCanvasElement) => {
        const {scene, camera, controls} = this.makeScene('rgb(30,30,30)', elem, 0);
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
        this.action = mixer.clipAction(this.clip);
        this.action.loop = THREE.LoopOnce;
        this.action.clampWhenFinished = true;
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
    this.action.timeScale = 1;
    this.action.stop();
    this.action.time = 0;
    this.clip.duration = 0;
    this.action.play();
    this.pauseAction = true;
  }


  public addScene(elem: ElementRef<HTMLCanvasElement>, fn: (rect: DOMRect) => void): void {
    this.sceneElements.push({elem, fn});
  }

  public makeScene(bg: string, elem: HTMLCanvasElement, x: number): MaScene {
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
    if (x === 0) {
      camera.position.set(0, 1, -8);
      camera.lookAt(0, 0, 0);
    }
    else if (x === 1) {
      camera.position.set(8, 30, -30);
      camera.lookAt(16, 50, 16);
    }

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
    this.pauseAction = false;
    const t = this.action.time;
    this.action.stop();
    this.action.time = t;
    this.clip.duration = this.tempsTotal;
    this.action.timeScale = 1;
    this.action.play();
  }

  public refreshInitialize(): void {
    this.initialize(undefined, undefined, true);
  }


  public play(): void {
    if (this.pauseAction === true) {
      this.playForward();
    } else {
      this.action.timeScale = 1;
      this.pauseAction = true;
      this.clip.duration = this.action.time;
      this.action.play();
    }
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
