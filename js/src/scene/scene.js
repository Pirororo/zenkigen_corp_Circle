// import * as THREE from '../../libs/three.module.js';
import Circle from '../objects/Circle.js';

export class Scene extends THREE.Scene {

    constructor(){

        super();

        //カメラ
        this._orthoCamera = new THREE.OrthographicCamera( innerWidth / - 2, innerWidth / 2, innerHeight / 2, innerHeight / - 2, 1, 100 );

        this.camera = this._orthoCamera; 
        this.camera.camPos = new THREE.Vector3(0, 0, 10);
        this.camera.position.set(this.camera.camPos.x,this.camera.camPos.y,this.camera.camPos.z);

        //円
        this._circle = new Circle();
        this.add(this._circle);

    }

    update(){

        this._circle.update();

    }
}
