# angular-cesium-popup

封装了一个 cesium 的 popup 组件。

## **使用方式**

（1）**安装组件**

` npm install angular-cesium-popup --save`

（2）**样式引入**

在全局样式文件：`style.scss` or `style.less` 中引入 popup 样式文件

```javascript
    @import "./node_modules/angular-cesium-popup/src/lib/popupStyle.less";
```

（3）**component 使用**

```javascript
...
// 引入你的popup要展示的内容组件
import { PopuptestComponent } from './components/popuptest/popuptest.component';
import { CesiumPopupService, ComponentUtilService } from 'angular-cesium-popup';
...

export class yourComponent {

    constructor(
        private popup: CesiumPopupService,
        private componentUtilService: ComponentUtilService,
    ) { 
        ...
    }

    /**
     * 添加popup到cesium地图
     *
     * @param {*} viewer cesium实例对象
     * @memberof AppComponent
     */
    addPopupToMap(viewer: any): void{
        ...
        // params中的所有的值， 会在你的组件PopuptestComponent中找到对应的变量名，并赋上对于的值
        // 举例：如果你的params = {aaa:'11', bbb:'12'}; 那么PopuptestComponent这个组件，在你初始化构建完成后就必须声明出来aaa变量和bbb变量。所以一般建议params中只传入id参数，在组件内部的OnInit事件中写请求详情接口内容的操作。
         const dom = this.componentUtilService.getComponentElement(PopuptestComponent, params);
         // tip：addTo(viewer)函数调用必须写在最后面
         this.popup.setPosition(position).setDomContent(dom).addTo(viewer);
        ...
    }
}
```

## **参数介绍**
| 参  数  名  | 类 型  | 示 例 值 |
| :---------:| :---: | :-----: |
| `dom` | `Component` |  `框架中的组件：Component` |
| `viewer` | `any` | `viewer = new Cesium.Viewer({...})` |
| `params` | `{key: any}` | `params = {name:'111',id:'222'}` |
| `position` | `any` | `handler.setInputAction((event: any) => { position = this.viewer.scene.pickPosition(event.position);                 }, Cesium.ScreenSpaceEventType.LEFT_CLICK) // 左键点击事件` |

## **相关函数介绍**
### **<table><tr><td bgcolor=#f8f8f8>$\color{#000000}{ComponentUtilService相关使用函数介绍:}$</td></tr></table>**
`getComponentElement(components: Type<unknown>, params: { [key: string]: any })`: 获取组件Dom元素 

`getComponentInstance()`: 获取组件实例

`setComponentGlobalVariable(variableName: string, value: any)`: 设置组件内部的"全局"变量

`destroy()`: 销毁组件实例
### **<table><tr><td bgcolor=#f8f8f8>$\color{#000000}{CesiumPopupService相关使用函数介绍:}$</td></tr></table>**

`addClassName(className: string)`: 给popup的最外面的边框DOM元素增加一个class类

`removeClass(className: string)`: popup的最外面的边框DOM元素移除一个class类

`setTitle(title: string)`: 设置popup框的标题内容

`setOffset(offset: [number, number])`: 设置popup的偏移量， 默认[0,0]

`setPosition(position: any)`: 设置popup定位的位置

`setHTML(html: string)`: 设置popup组件的展示内容-1：参数为构架的div标签字符串

`setDomContent(html: HTMLDivElement)`: 设置popup组件的展示内容-2：参数为组件的dom元素。（tip：使用这个就不要使用setTitle了，自己在自定义组件中写title把）

`remove: ()`: 移除popup框



## **参考图**

![alt 参考图-1](https://obohe.com/i/2022/01/28/udemgn.jpg)

## **参考文献**
文献1：[参考的github地址](https://github.com/JerckyLY/cesium-demo-view/tree/6108023ccb0207903a860f5dafffdf59cc2927ce)

文献2：[实现方案参照的博客](https://jercky.top/2020/10/22/Cesium%E5%85%A5%E9%97%A8-4/)

文献3：[在线效果](http://jerckly.gitee.io/cesium-view/#)

## **鸣谢**
这里特别鸣谢[@JerckyLY](https://github.com/JerckyLY/cesium-demo-view/tree/6108023ccb0207903a860f5dafffdf59cc2927ce)，本工具代码构建是在其源代码的基础上，方便其更适应与框架级别的代码风格，而做了部分调整。整体原理和其相同。再次感谢！
