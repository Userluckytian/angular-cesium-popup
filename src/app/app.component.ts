import { Component, OnDestroy, OnInit } from '@angular/core';
import { Cesium3DTileFeature } from 'cesium';
import { environment } from 'src/environments/environment';
import { PopuptestComponent } from './components/popuptest/popuptest.component';
import { CesiumPopupService, ComponentUtilService } from 'angular-cesium-popup';
interface propertyNames {
  [key: string]: string
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'cesiumDemo';
  viewer: any; // cesium对象
  tileset = new Cesium.Cesium3DTileset({ url: environment.west3DTilesetUrl });
  model: any; // 三维tileset模型

  constructor(
    private popup: CesiumPopupService,
    private componentUtilService: ComponentUtilService,
  ) { }

  ngOnInit(): void {
    if (!this.viewer) {
      this.viewer = this.initCesium();
      // 添加模型
      this.addModel(this.viewer);
    }
  }


  /** 实例化cesium对象
   */
  initCesium() {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxOGQ4NjJiNS01ZmQ1LTQ0MzAtYTcyNi04OWE3ZDhiMTZmMjAiLCJpZCI6NzM5MzcsImlhdCI6MTYzNzI4NDY4NH0.5FT4btmJ0pVt6NiCn4eJUaxR9sUv4-ih9s2s2bHi7m4';
    const viewer = new Cesium.Viewer('cesiumContainer', {
      animation: false,       // 是否显示动画控件
      homeButton: false,       // 是否显示home键
      geocoder: false,         // 是否显示地名查找控件        如果设置为true，则无法查询
      baseLayerPicker: false, // 是否显示图层选择控件
      timeline: false,        // 是否显示时间线控件
      fullscreenButton: true, // 是否全屏显示
      scene3DOnly: true,     // 如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
      infoBox: true,         // 是否显示点击要素之后显示的信息  // <------------------------------------------------      看这里
      sceneModePicker: true,  // 是否显示投影方式控件  三维/二维
      navigationInstructionsInitiallyVisible: false,
      navigationHelpButton: false,     // 是否显示帮助信息控件
      selectionIndicator: false// 是否显示指示器组件
    });
    this.setSomeCesiumProperty(viewer);
    this.setSomeCesiumListener(viewer);
    return viewer;
  }

  /**
   * 添加三维模型
   *
   * @param {*} cesiumObj
   * @memberof AppComponent
   */
  addModel(cesiumObj: any) {
    this.model = cesiumObj.scene.primitives.add(this.tileset);
    cesiumObj.scene.globe.depthTestAgainstTerrain = true;
    //   设置相机角度
    cesiumObj.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(120.72349477589557, 31.01838537030235, 200.0), //   设置位置
      orientation: {
        heading: 4.752400736662963,
        pitch: -0.5583131645813717,
        roll: 6.279695958944261,
      }
    });
  }

  /**
   * 设置部分三维场景属性
   *
   * @memberof AppComponent
   */
  setSomeCesiumProperty(cesiumObj: any) {
    // DirectionalLight 表示 从无限远的地方向单一方向发射的光。
    cesiumObj.scene.light = new Cesium.DirectionalLight({
      direction: new Cesium.Cartesian3(0.354925, -0.890918, -0.283358)
    });
    cesiumObj.cesiumWidget.creditContainer.style.display = 'none';
    //  鼠标左键平移，右键旋转
    cesiumObj.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.RIGHT_DRAG];
    cesiumObj.scene.screenSpaceCameraController.rotateEventTypes = [Cesium.CameraEventType.LEFT_DRAG];
  }

  /**
   * 设置部分三维对象监听事件
   *
   * @param {*} cesiumObj
   * @memberof AppComponent
   */
  setSomeCesiumListener(cesiumObj: any) {
    //  添加图标点击事件
    const handler = new Cesium.ScreenSpaceEventHandler(cesiumObj.canvas);

    handler.setInputAction((event: any) => {
      this.showPopup(event);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);  // <------------------------------------------------      看这里

    // 相机随滚轮移动进入模型
    let lastWhellCameraPosition: { x: number; y: number; z: number; };
    let lastWhellCameraPositionTimes = 0;
    const currentCameraPosition = cesiumObj.camera.position;
    const ellipsoid = cesiumObj.scene.globe.ellipsoid;
    // 滚轮事件
    handler.setInputAction(function onMouseWheel(e: number) {
      if (e > 0 && lastWhellCameraPosition
        && Math.abs(currentCameraPosition.x - lastWhellCameraPosition.x) < 0.001
        && Math.abs(currentCameraPosition.y - lastWhellCameraPosition.y) < 0.001
        && Math.abs(currentCameraPosition.z - lastWhellCameraPosition.z) < 0.001) {
        if (lastWhellCameraPositionTimes > 1) {
          console.log(e);
          const cameraHeight = ellipsoid.cartesianToCartographic(currentCameraPosition).height;
          cesiumObj.camera.moveForward(cameraHeight / 50.0);
        } else {
          lastWhellCameraPositionTimes++;
        }
      } else {
        lastWhellCameraPositionTimes = 0;
      }
      lastWhellCameraPosition = currentCameraPosition.clone();
    }, Cesium.ScreenSpaceEventType.WHEEL); // <------------------------------------------------      看这里
  }

  /**
   * 展示popup框
   *
   * @memberof WestSewageCompanyComponent
   */
  showPopup(event: any): void {
    //  用来拾取三维空间中的物体
    const position = this.viewer.scene.pickPosition(event.position);
    const pickobject = this.viewer.scene.pick(event.position);
    if (Cesium.defined(pickobject)) {
      const params = this.getPickedFeatureAllPropertyInfo(pickobject);
      const dom = this.componentUtilService.getComponentElement(PopuptestComponent, params);
      this.popup.setPosition(position).setDomContent(dom).addTo(this.viewer);
    }
  }


  /**
   * 获取 3DtileSet选中要素 的所有属性信息
   *
   * @param {Cesium3DTileFeature} pickFeature 选择的要素
   * @memberof WestSewageCompanyComponent
   */
  getPickedFeatureAllPropertyInfo(pickFeature: Cesium3DTileFeature): any {
    const propertyObj: propertyNames = {};
    const propertyNames: Array<string> = pickFeature.getPropertyNames();
    const length = propertyNames.length;
    for (let i = 0; i < length; ++i) {
      const propertyName: string = propertyNames[i];
      propertyObj[propertyName] = pickFeature.getProperty(propertyName);
    }
    return propertyObj;
  }


  ngOnDestroy(): void {

  }
}
