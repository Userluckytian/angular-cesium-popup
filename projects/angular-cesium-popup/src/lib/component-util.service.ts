import { ApplicationRef, Component, ComponentFactoryResolver, ComponentRef, Injectable, Injector, Type } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComponentUtilService {

  compRef!: ComponentRef<any>; // 组件实例，为了后面销毁。声明为全局

  constructor(
    private injector: Injector,
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
  ) { }

  /**
   * 获取 组件Dom 元素 
   *
   * @param {*} components 要创建的组件实例
   * @param {*} params 组件的参数信息
   * @return {*} 
   * @memberof ComponentUtilService
   */
  public getComponentElement(components: Type<unknown>, params: { [key: string]: any }): any {
    // Remove the Component if it Already Exists
    if (this.compRef) {
      this.compRef.destroy();
    }
    // 实例化给定类型的组件的工厂
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(components);
    // 使用生成的 ComponentFactory.create() 方法创建该类型的组件。并存下返回的组件componentRef(获取实例，销毁组件时需要用到)
    this.compRef = componentFactory.create(this.injector);
    // 向组件实例传递参数
    this.setMulitComponentGlobalVariable(params);

    // Attach to Application
    this.appRef.attachView(this.compRef.hostView);   // 附加视图，以便对其进行脏检查。视图销毁后将自动分离。如果视图已附加到 ViewContainer，则会抛出此错误。

    const div = this.compRef.location.nativeElement;
    return div;
  }

  /**
   * 获取组件实例
   *
   * @return {*} 
   * @memberof ComponentUtilService
   */
  public getComponentInstance(): any {
    if (this.compRef) {
      return this.compRef.instance
    } else {
      throw Error('暂无组件实例对象！')
    }
  }


  /**
   * 设置【多个】组件内的全局变量
   *
   * @param {*} params
   * @memberof ComponentUtilService
   */
  private setMulitComponentGlobalVariable(params: any) {
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const element = params[key];
        this.setComponentGlobalVariable(key, element)
      }
    }
  }

  /**
   * 设置【单个】组件内的全局变量
   *
   * @param {string} variableName 变量名
   * @param {any} value 值
   * @memberof ComponentUtilService
   */
  public setComponentGlobalVariable(variableName: string, value: any): void {
    if (this.compRef) {
      this.compRef.instance[variableName] = value;
    } else {
      throw Error('暂无组件实例对象！')
    }
  }

  /**
   * 销毁组件实例
   *
   * @memberof ComponentUtilService
   */
  public destroy(): void {
    if (this.compRef) {
      this.compRef.destroy();
    }
  }

}
