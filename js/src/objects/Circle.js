// import * as THREE from '../../libs/three.module.js';
import { convertCSVtoArray2D, loadCSV } from "../utils/AssetsLoader.js";


export default class Circle extends THREE.Object3D {

  constructor() {

    super();
    this.datUpdate = this.datUpdate.bind(this);
    this.createMatCirc = this.createMatCirc.bind(this);

    this.frame = -1;
    this.listNum = -1;
    this.firstListNum = -1;
    this.firstListNumBool = false;//けしていい
    this.birth_freq = 15;
    this.createCircle = this.createCircle.bind(this);
    this.startSetting = this.startSetting.bind(this);

    //csvからのデータ取得
    this.getDateValue = this.getDateValue.bind(this);
    this.loadCSVandConvertToArray2D = this.loadCSVandConvertToArray2D.bind(this);
    this.dateValue = 0;
    this.data = [];
    this.TimesList = [1,1,1,1,1,1,1,1,1,1,1,1,1,1];
    this.loadCSVandConvertToArray2D();
    this.DATAisOK = false;

    this.NUM = 14;
    this.boxList = [];//mesh入れる
    this.boxMatList = [];//mat入れる

    this.nowBoxPos = [];
    this.targetBoxPos = [];//「丸が大きさ」で可視化、大きさが98%以上になったらリセット

    this.nowBoxRot=[];
    this.targetBoxRot=[];

    this.nowBoxScl=[];
    this.targetBoxScl=[];

    this.nowBoxOpc=[];
    this.targetBoxOpc=[];

    let Params = function(){
      // size
      this.distanseX = 20;
      this.distanseY = 15;
      this.pos_easing = 0.011;
      this.rot_easing = 0.02;
      this.scl_easing = 0.023;
      this.opc_easing = 0.026;
    }
    this.params = new Params();

    var gui = new dat.GUI();
    this.datUpdate();

    var folder1 = gui.addFolder('circle');
        folder1.add( this.params, 'distanseX', 1, 100 ).onChange( this.datUpdate );
        folder1.add( this.params, 'distanseY', 1, 100 ).onChange( this.datUpdate );
        folder1.add( this.params, 'pos_easing', 0, 0.1 ).onChange( this.datUpdate );
        folder1.add( this.params, 'rot_easing', 0, 0.1 ).onChange( this.datUpdate );
        folder1.add( this.params, 'scl_easing', 0, 0.1).onChange( this.datUpdate );
        folder1.add( this.params, 'opc_easing', 0, 0.05 ).onChange( this.datUpdate );
    folder1.open();
  }

  datUpdate() {
    this.distanseX = this.params.distanseX;
    this.distanseY = this.params.distanseY;
    this.pos_easing = this.params.pos_easing;
    this.rot_easing = this.params.rot_easing;
    this.scl_easing = this.params.scl_easing;
    this.opc_easing = this.params.opc_easing;
  }


  createCircle(NUM){

    this.colors = [
      0x9FE3ED,//シアン
      0x7E8DF7,//青
      0xB361DF,//紫
    ];

    this.colorsPair0 = [this.colors[0],this.colors[1]];
    this.colorsPair1 = [this.colors[1],this.colors[2]];
    this.colorsPair2 = [this.colors[2],this.colors[0]];
    this.colorsPairList = [this.colorsPair0, this.colorsPair1,this.colorsPair2];


    for (let i = 0; i < NUM; i++) {
      this.geoCirc = new THREE.SphereGeometry(1, 64,64);
      // this.matCirc = new THREE.MeshPhongMaterial({
      //   color: new THREE.Color( this.colors[ ~~Maf.randomInRange( 0, this.colors.length)]),
      //   opacity: 0.8,
      //   transparent: true,
      //   side: THREE.DoubleSide,
      //   // specular: 0xeeeeee,
      // });
      this.createMatCirc();
      this.meshCirc = new THREE.Mesh(
        this.geoCirc,
        this.matCirc
      );
      this.startSetting(this.meshCirc, this.matCirc, i);
    }
  }

  createMatCirc(){

    this.selectColorsPair = this.colorsPairList[ ~~Maf.randomInRange( 0, this.colorsPairList.length)];

    this.uniforms = {
        uAspect:    { value: 1 / 1 },
        // uTime:    { value: 100.0 },
        uAlpha:    { value: 1.0 },
        color:    { value: new THREE.Color(this.selectColorsPair[0]) },
        color2:    { value: new THREE.Color(this.selectColorsPair[1]) },
        resolution:    { value: new THREE.Vector2()} ,
    };

    this.uniforms.resolution.value.x = 100;
    this.uniforms.resolution.value.y = 100;

    const vertexSource = `
    varying vec2 vUv;
    uniform float uAspect;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `;

    const fragmentSource = `
    varying vec2 vUv;
    uniform float uAspect;
    // uniform float uTime;
    uniform float uAlpha;
    uniform vec3 color;
    uniform vec3 color2;

    void main() {

        //グラデ
        vec2 uv = vec2( vUv.x * uAspect, vUv.y );
        vec3 gradate = color * uv.y + color2 * (1.0 - uv.y);
        gl_FragColor = vec4(gradate, uAlpha );

    }
    `;

    this.matCirc = new THREE.ShaderMaterial({
        vertexShader: vertexSource,
        fragmentShader: fragmentSource,
        uniforms: this.uniforms,
        opacity: 0.8,
        side: THREE.DoubleSide,
        transparent: true,
    });

    return this.matCirc;
  }



  startSetting(mesh, mat, i){
    mesh.position.set(
        Maf.randomInRange( -window.innerWidth/2, window.innerWidth/2),
        Maf.randomInRange( -window.innerHeight/2, window.innerHeight/2),
        -10
    );

    // mesh.rotation.z = 0;
    mesh.scale.set(1,1,1);
    // mesh.receiveShadow = true;
    this.add(mesh);

    this.boxList.push(mesh);
    this.boxMatList.push(mat);


    // ここからnow, targetの初期値設定

    // positions
    // 現在のpositions
    this.nowBoxPos.push(mesh.position.x, mesh.position.y, mesh.position.z);
    // ターゲットのpositions
    let Randomselect = Math.random();
    let lineLength = Maf.randomInRange(100, 200);
    if(Randomselect >0.5){
        this.targetBoxPos.push(this.nowBoxPos[3 * i + 0]+lineLength);
        this.targetBoxPos.push(this.nowBoxPos[3 * i + 1]+lineLength);
        this.targetBoxPos.push(this.nowBoxPos[3 * i + 2]);
    }else{
        this.targetBoxPos.push(this.nowBoxPos[3 * i + 0]+lineLength);
        this.targetBoxPos.push(this.nowBoxPos[3 * i + 1]+lineLength);
        this.targetBoxPos.push(this.nowBoxPos[3 * i + 2]);
    }

    //opacity
    // 現在のopacity
    this.nowBoxRot.push(0.0);
    // ターゲットのopacity
    this.targetBoxRot.push(0.0);


    //scale
    // 現在のscale
    this.nowBoxScl.push(mesh.scale.x);
    // ターゲットのscale
    this.targetBoxScl.push(mesh.scale.x);

    //opacity
    // 現在のopacity
    this.nowBoxOpc.push(0.0);
    // ターゲットのopacity
    this.targetBoxOpc.push(0.0);

  }


  getDateValue(i){
        this.dateValue = (this.data[this.TimesList[i]][i+1])*0.5;
        return this.dateValue;
  }

  loadCSVandConvertToArray2D(){
      loadCSV("./js/src/data/kanto_7area_short.csv", e =>{
          const result = e.result;
          this.data = convertCSVtoArray2D(result);
          this.DATAisOK = true;
          this.createCircle(this.NUM);
      });
      // console.log(this.data[0][0]);//これは表示されない
  }


  update() {

    if(this.DATAisOK ==  true){

      this.frame += 1;

      // const sec = this.frame/100;
      // this.matCirc.uniforms.uTime.value = sec;// シェーダーに渡す時間を更新

      // if(this.firstListNumBool == true){
      //   if(this.frame% this.birth_freq == 0){
      //     this.firstListNum += 1;
      //     this.createCircle(this.firstListNum);
      //     if(this.firstListNum > this.NUM-2){
      //       this.firstListNumBool = false;
      //     }
      //   }
      // }

      if(this.firstListNumBool == false){

        //イージング
        //positions
        for(let i =0; i< this.NUM*3; i++){
          this.nowBoxPos[i] += (this.targetBoxPos[i]-this.nowBoxPos[i]) *this.pos_easing;
        }
        //rotate //scale //opacity
        for(let i =0; i< this.boxList.length; i++){
          this.nowBoxRot[i] += (this.targetBoxRot[i]-this.nowBoxRot[i]) *this.rot_easing;
          this.nowBoxScl[i] += (this.targetBoxScl[i]-this.nowBoxScl[i]) *this.scl_easing;
          this.nowBoxOpc[i] += (this.targetBoxOpc[i]-this.nowBoxOpc[i]) *this.opc_easing;
        }

        //一定以上の大きさになったらターゲット値と現在地の設定をし直す
        if(this.frame% this.birth_freq == 0){this.listNum += 1;}
        if(this.listNum > this.NUM-1){this.listNum = 0;}
        for(let i =this.listNum; i< this.listNum+1; i++){
        // for(let i =0; i< this.boxList.length; i++){
            if(this.nowBoxScl[i]>= this.targetBoxScl[i]*0.98){
              //positions
              this.nowBoxPos[3 * i + 0] = Maf.randomInRange( -window.innerWidth/2, window.innerWidth/2-100);
              this.nowBoxPos[3 * i + 1] = Maf.randomInRange( -window.innerHeight/2, window.innerHeight/2-100);
              this.nowBoxPos[3 * i + 2] = -10;

              let lineLengthX = Maf.randomInRange(5, 10) *this.distanseX;
              let lineLengthY = Maf.randomInRange(5, 10) *this.distanseX;

              this.targetBoxPos[3 * i + 0] = this.nowBoxPos[3 * i + 0] +lineLengthX;
              this.targetBoxPos[3 * i + 1] = this.nowBoxPos[3 * i + 1] +lineLengthY;

              //rotate
              this.nowBoxRot[i] = 0.0;
              this.targetBoxRot[i] = Maf.randomInRange(360-90, 360+90) * Math.PI/180;

              //scale
              this.nowBoxScl[i] = 5.0;
              this.TimesList[i] += 1;//0行目を題名にする場合は前におく
              // console.log(this.Times);//303まで！
              if(this.TimesList[i] >= 303){this.TimesList[i] =1;}
              this.getDateValue(i);
              this.targetBoxScl[i] = this.dateValue;

              //opacity
              this.nowBoxOpc[i] = 4.0;
              this.targetBoxOpc[i] = 0.0;
            }
        }

        for(let i =0; i< this.boxList.length; i++){
            //positions
            this.boxList[i].position.x = this.nowBoxPos[3 * i + 0];
            this.boxList[i].position.y = this.nowBoxPos[3 * i + 1];
            this.boxList[i].position.z = this.nowBoxPos[3 * i + 2];

            //rotate
            this.boxList[i].rotation.z = this.nowBoxRot[i];

            //scale
            this.boxList[i].scale.x = this.nowBoxScl[i];
            this.boxList[i].scale.y = this.nowBoxScl[i];

            //opacity
            // this.boxMatList[i].opacity = this.nowBoxOpc[i];
            this.boxMatList[i].uniforms.uAlpha.value = this.nowBoxOpc[i];
        }
      }
    }
  }

  draw(){
  }
}
