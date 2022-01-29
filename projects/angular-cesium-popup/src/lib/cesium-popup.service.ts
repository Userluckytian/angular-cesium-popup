import { Injectable } from '@angular/core';

import * as Cesium from 'cesium'

interface PopupOptions {
  content: HTMLDivElement | string | null | undefined;
  title: string;
  position: any;
}

interface PopupDom {
  headerTitle: HTMLDivElement | undefined | null;
  panelContainer: HTMLDivElement | undefined | null; // 最外部div
  headerContainer: HTMLDivElement | undefined | null;  // 最外部div
  closeBtn: HTMLDivElement | undefined | null;   // 关闭按钮
  contentContainer: HTMLDivElement | undefined | null;  // 内容dom部分
  tipContaienr: HTMLDivElement | undefined | null; // 三角箭头
}

@Injectable({
  providedIn: 'root'
})
export class CesiumPopupService {
  viewer: any; // cesium对象
  options: PopupOptions = {
    title: '',
    position: null,
    content: null
  };
  initClassName: string | undefined | null;
  offset: Array<number> = [0, 0];
  // dom元素整体内容
  popupDom: PopupDom = {
    headerTitle: null,
    panelContainer: undefined,
    headerContainer: undefined,
    closeBtn: null,
    contentContainer: null,
    tipContaienr: null,
  };
  renderListener: any;
  public remove: () => void;
  contentIsDom: boolean = false; // 内容部分是DOM元素
  contentIsHTML: boolean = false; // 内容部分是HTML内容
  constructor() {
    this.remove = () => { this.closeHander(); };
  }

  /**
   * 将popup框添加到指定位置
   * @param {any} viewer cesium对象
   * @memberof CesiumPopupService
   */
  public addTo(viewer: any): CesiumPopupService {
    if (viewer) { this.remove(); }
    this.viewer = viewer;
    this.initPanel();

    if (this.options.position) {
      if (this.popupDom.panelContainer) {
        // 实时渲染
        this.popupDom.panelContainer.style.display = 'block';
        this.renderListener = this.viewer.scene.postRender.addEventListener(this.render, this);
      }
    }
    return this;
  }

  /**
   * 构建自定义popup
   * 
   * @memberof CesiumPopupService
   */
  private initPanel(): any {
    const closeBtnIcon = '<svg t="1603334792546" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1328" width="32" height="32"><path d="M568.922 508.232L868.29 208.807a39.139 39.139 0 0 0 0-55.145l-1.64-1.64a39.139 39.139 0 0 0-55.09 0l-299.367 299.82-299.425-299.934a39.139 39.139 0 0 0-55.088 0l-1.697 1.64a38.46 38.46 0 0 0 0 55.09l299.48 299.594-299.424 299.48a39.139 39.139 0 0 0 0 55.09l1.64 1.696a39.139 39.139 0 0 0 55.09 0l299.424-299.48L811.56 864.441a39.139 39.139 0 0 0 55.089 0l1.696-1.64a39.139 39.139 0 0 0 0-55.09l-299.48-299.537z" p-id="1329"></path></svg>';
    // (1) 构建大的div容器
    this.popupDom.panelContainer = document.createElement('div');
    this.popupDom.panelContainer.classList.add('cesium-popup-panel');

    if (this.initClassName) {
      this.popupDom.panelContainer.classList.add(this.initClassName);
    }
    // 如果是HTML才会用这些! 如果是DOM就不要用这些!
    if (this.contentIsHTML) {
      // （1.1）关闭按钮
      this.popupDom.closeBtn = document.createElement('div');
      this.popupDom.closeBtn.classList.add('cesium-popup-close-btn');

      this.popupDom.closeBtn.innerHTML = closeBtnIcon;

      // (2) 设置title
      this.popupDom.headerContainer = document.createElement('div');
      this.popupDom.headerContainer.classList.add('cesium-popup-header-panel');

      this.popupDom.headerTitle = document.createElement('div');
      this.popupDom.headerTitle.classList.add('cesium-poput-header-title');
      this.popupDom.headerTitle.innerHTML = this.options.title;
      // （2.1）先把title填入到头部div容器
      this.popupDom.headerContainer.appendChild(this.popupDom.headerTitle);
      // （2.9）这里可能是想做关闭按钮的绝对定位，头部标题的话没有做定位
      this.popupDom.panelContainer.appendChild(this.popupDom.closeBtn);
      this.popupDom.panelContainer.appendChild(this.popupDom.headerContainer);
    }

    // (3) 内容容器
    if (this.options.content instanceof String) {
      this.popupDom.contentContainer = document.createElement('div');
      this.popupDom.contentContainer.classList.add('cesium-popup-content-panel');
      this.popupDom.contentContainer.innerHTML = (this.options.content) as string;
    } else {
      this.popupDom.contentContainer = this.options.content as HTMLDivElement;
    }

    this.popupDom.panelContainer.appendChild(this.popupDom.contentContainer);

    // (4) 三角箭头
    // （5）设置隐藏

    this.popupDom.panelContainer.style.display = 'none';
    // (6) add to Viewer Container
    this.viewer.cesiumWidget.container.appendChild(this.popupDom.panelContainer);
    // this.emit('open');
    // 关闭按钮的监听事件
    if (this.contentIsHTML) {
      if (this.popupDom.closeBtn) {
        this.popupDom.closeBtn.addEventListener('click', this.remove, false);
      }
    }
  }


  /**
   * 设置内容
   *
   * @param {string} html dom元素内容填充
   * @return {*}  {CesiumPopupService}
   * @memberof CesiumPopupService
   */
  public setHTML(html: string): CesiumPopupService {
    this.contentIsDom = false;
    this.contentIsHTML = true;

    if (this.popupDom.contentContainer) {
      this.popupDom.contentContainer.innerHTML = html;
    }
    this.options.content = html;
    return this;
  }

  /**
   * 设置内容
   *
   * @param {string} html dom元素内容填充
   * @return {*}  {CesiumPopupService}
   * @memberof CesiumPopupService
   */
  public setDomContent(html: HTMLDivElement): CesiumPopupService {
    this.contentIsDom = true;
    this.contentIsHTML = false;

    if (this.popupDom.contentContainer) {
      this.popupDom.contentContainer = html;
    }
    this.options.content = html;
    return this;
  }

  /**
   * 内部函数，实时渲染函数
   *
   * @return {*}  {void}
   * @memberof CesiumPopupService
   */
  private render(): void {
    const geometry = this.options.position;
    if (!geometry) { return; }
    const position = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, geometry);
    if (!position) {
      return;
    }
    if (this.popupDom.panelContainer) {
      this.popupDom.panelContainer.style.left = position.x - this.popupDom.panelContainer.offsetWidth / 2 + this.offset[0] + 'px';
      this.popupDom.panelContainer.style.top = position.y - this.popupDom.panelContainer.offsetHeight - 10 + this.offset[1] + 'px';
    }
    // 修复背面不隐藏bug
    this.fixNotHideOnFaceBackbug(geometry)
  }

  /**
   * 设置定位的位置
   *
   * @param {*} position // cesium的【event.position】
   * @return {*}  {CesiumPopupService}
   * @memberof CesiumPopupService
   */
  public setPosition(position: any): CesiumPopupService {
    this.options.position = position;
    return this;
  }

  /**
   * 添加自定义类名
   *
   * @param {string} className
   * @return {*}  {CesiumPopupService}
   * @memberof CesiumPopupService
   */
  public addClassName(className: string): CesiumPopupService {
    if (this.popupDom.panelContainer) {
      this.popupDom.panelContainer.classList.add(className);
    } else {
      this.initClassName = className;
    }
    return this;
  }

  /**
   * 移除指定类名
   *
   * @param {string} className
   * @return {*}  {CesiumPopupService}
   * @memberof CesiumPopupService
   */
  public removeClass(className: string): CesiumPopupService {
    if (this.popupDom.panelContainer) {
      this.popupDom.panelContainer.classList.remove(className);
    } else if (this.initClassName === className) {
      this.initClassName = undefined;
    }
    return this;
  }

  /**
   * 设置popup标题
   *
   * @param {string} title
   * @return {*}  {CesiumPopupService}
   * @memberof CesiumPopupService
   */
  public setTitle(title: string): CesiumPopupService {
    if (this.popupDom.headerTitle) {
      this.popupDom.headerTitle.innerHTML = title;
    }
    this.options.title = title;
    return this;
  }

  /**
   * 设置偏移量
   *
   * @param {Array<number>} offset
   * @return {*}  {CesiumPopupService}
   * @memberof CesiumPopupService
   */
  public setOffset(offset: Array<number>): CesiumPopupService {
    this.offset = offset;
    return this;
  }


  /**
   * 移除popup框
   *
   * @memberof CesiumPopupService
   */
  private closeHander(): void {
    if (this.contentIsHTML) {
      if (this.popupDom.closeBtn) {
        this.popupDom.closeBtn.removeEventListener('click', this.remove, false);
        if (this.popupDom.closeBtn.parentNode) {
          this.popupDom.closeBtn.parentNode.removeChild(this.popupDom.closeBtn);
          this.popupDom.closeBtn = null;
        }
      }
    }
    if (this.popupDom.contentContainer) {
      if (this.popupDom.contentContainer.parentNode) {
        this.popupDom.contentContainer.parentNode.removeChild(this.popupDom.contentContainer);
        this.popupDom.contentContainer = null;
      }
    }

    if (this.popupDom.panelContainer) {
      if (this.popupDom.panelContainer.parentNode) {
        this.popupDom.panelContainer.parentNode.removeChild(this.popupDom.panelContainer);
        this.popupDom.panelContainer = null;
      }
    }
    // 不明白
    if (this.renderListener) {
      this.renderListener();
      this.renderListener = null;
    }
    if (this.viewer) {
      this.viewer = null;
    }
    // 重置为false
    this.contentIsDom = false;
    this.contentIsHTML = false;
    // this.emit('close')
  }

  /**
   * 修复popup在地球旋转到背面后仍不隐藏bug
   *
   * @memberof CesiumPopupService
   */
  private fixNotHideOnFaceBackbug(position: any) {
    const cartographic = Cesium.Cartographic.fromCartesian(position); //   根据笛卡尔坐标获取到弧度
    const lng = Cesium.Math.toDegrees(cartographic.longitude); //   根据弧度获取到经度
    const lat = Cesium.Math.toDegrees(cartographic.latitude); //   根据弧度获取到纬度
    const height = cartographic.height; //   模型高度
    const divPosition = Cesium.Cartesian3.fromDegrees(lng, lat, height);

    // 修复背面不隐藏bug

    const scene = this.viewer.scene;
    const camera = this.viewer.camera;
    const cameraPosition = camera.position;

    let tempHeight = scene.globe.ellipsoid.cartesianToCartographic(cameraPosition).height;

    tempHeight += scene.globe.ellipsoid.maximumRadius;

    if (!(Cesium.Cartesian3.distance(cameraPosition, divPosition) > tempHeight)) {
      // show
      if (this.popupDom.panelContainer) {
        this.popupDom.panelContainer.style.display = 'block';
      }
    } else {
      // hide
      if (this.popupDom.panelContainer) {
        this.popupDom.panelContainer.style.display = 'none';
      }
    }
  }

}
