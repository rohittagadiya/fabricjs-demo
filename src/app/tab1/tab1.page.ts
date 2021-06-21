import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

import * as alignededGuides from '../aligning_guidelines.js';

declare const fabric: any;

fabric.Object.prototype._renderStroke = function (ctx) {
  if (!this.stroke || this.strokeWidth === 0) {
    return;
  }
  if (this.shadow && !this.shadow.affectStroke) {
    this._removeShadow(ctx);
  }
  ctx.save();
  ctx.scale(1 / this.scaleX, 1 / this.scaleY);
  this._setLineDash(ctx, this.strokeDashArray, this._renderDashedStroke);
  this._applyPatternGradientTransform(ctx, this.stroke);
  ctx.stroke();
  ctx.restore();
};

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  canvas: any;
  drawThis: string;
  deviceWidth: any;
  deviceHeight: any;
  canvasWidth: any;
  canvasHeight: any;
  selected: any;
  new_width: any = 0;
  new_height: any = 0;
  mainRectHeight: number = 100;
  mainRectWidth: number = 100;
  mainRect: any;
  canvasConfigOptions: any = {
    hoverCursor: 'pointer',
    selection: true,
    selectionBorderColor: '#00c3f9',
    selectionColor: 'rgba(0, 195, 249, 0.2)',
    preserveObjectStacking: true,
    originX: 'center',
    originY: 'center',
    fireRightClick: true,
    // imageSmoothingEnabled: true,
    // enableRetinaScaling: true
  }

  constructor(public platform: Platform) {
    this.deviceWidth = platform.width();
    this.deviceHeight = platform.height();
  }
  ngOnInit(): void {
    this.canvasWidth = this.deviceWidth - 50;
    this.canvasHeight = this.deviceHeight - 280;
    this.canvas = new fabric.Canvas('imageCanvas', {
      width: this.deviceWidth - 50,
      _width: this.deviceWidth - 50,
      height: this.deviceHeight - 280,
      _height: this.deviceHeight - 280,
      selection: true,
      selectionBorderColor: '#00c3f9',
      selectionColor: 'rgba(0, 195, 249, 0.2)',
      preserveObjectStacking: true,
      originX: 'center',
      originY: 'center'
    });
    alignededGuides.initAligningGuidelines(this.canvas);
    this.canvas.on({
      'selection:created': (e) => {
        this.selected = e.target;
        console.log('this.selected', this.selected);
      },
      'selection:cleared': (e) => {
        this.selected = null;
      },
      'object:moving': (e) => {
        let that = this,
          obj = e.target,
          edgedetection = 10;
        obj.setCoords(); //Sets corner position coordinates based on current angle, width and height
        that.canvas.forEachObject(function (targ) {
          let activeObject = that.canvas.getActiveObject();
          let activeObject_currentWidth = activeObject.width * activeObject.scaleX;
          let activeObject_currentHeight = activeObject.height * activeObject.scaleY;
          let target_currentWidth = targ.width * targ.scaleX;
          let target_currentHeight = targ.height * targ.scaleY;
          if (targ === activeObject) return;
          if (Math.abs(activeObject.oCoords.tr.x - targ.oCoords.tl.x) < edgedetection) {
            activeObject.left = targ.left - activeObject_currentWidth;
          }
          if (Math.abs(activeObject.oCoords.tl.x - targ.oCoords.tr.x) < edgedetection) {
            activeObject.left = targ.left + target_currentWidth;
          }
          if (Math.abs(activeObject.oCoords.br.y - targ.oCoords.tr.y) < edgedetection) {
            activeObject.top = targ.top - activeObject_currentHeight;
          }
          if (Math.abs(targ.oCoords.br.y - activeObject.oCoords.tr.y) < edgedetection) {
            activeObject.top = targ.top + target_currentHeight;
          }
        });
      },
      'object:scaling': (e) => {

      }
    });
  }

  draw(value) {
    switch (value) {
      case 'square':
        let square = new fabric.Rect({
          top: 30, left: 30, width: 100, height: 100, stroke: 'black', fill: '#ffffff',
          strokeWidth: 1,
          cornerColor: '#3880ff',
          cornerSize: 10,
          cornerStyle: 'circle',
          transparentCorners: false
        });
        this.extend(square, this.randomId());
        this.canvas.add(square);
        this.canvas.renderAll();
        break;
      case 'rectangle':
        let rect = new fabric.Rect({
          top: 10, left: 10, width: 150, height: 75, stroke: 'black', fill: '#ffffff',
          strokeWidth: 1,
          cornerColor: '#3880ff',
          cornerSize: 10,
          cornerStyle: 'circle',
          transparentCorners: false
        });
        this.extend(rect, this.randomId());
        this.canvas.add(rect);
        this.canvas.renderAll();
        break;
      case 'triangle':
        let triangle = new fabric.Triangle({
          top: 100, left: 150, width: 100, height: 100, stroke: 'black', fill: '#ffffff',
          strokeWidth: 1,
          cornerColor: '#3880ff',
          cornerSize: 10,
          cornerStyle: 'circle',
          transparentCorners: false
        });
        this.extend(triangle, this.randomId());
        this.canvas.add(triangle);
        this.canvas.renderAll();
        break;
      case 'circle':
        let circle = new fabric.Circle({
          top: 0, left: 80, radius: 50, stroke: 'black', fill: '#ffffff',
          cornerColor: '#3880ff',
          cornerSize: 10,
          cornerStyle: 'circle',
          transparentCorners: false,
          strokeWidth: 1
        });
        this.extend(circle, this.randomId());
        this.canvas.add(circle);
        this.canvas.renderAll();
        break;

      default:
        break;
    }
  }

  deleteObject() {
    let that = this;
    let activeObjects = this.canvas.getActiveObjects();
    if (activeObjects) {
      activeObjects.forEach(function (object) {
        that.canvas.remove(object);
        that.canvas.renderAll();
      });
    }
  }

  extend(obj, id) {
    obj.toObject = (function (toObject) {
      return function () {
        return fabric.util.object.extend(toObject.call(this), {
          id: id
        });
      };
    })(obj.toObject);
  }

  randomId() {
    return Math.floor(Math.random() * 999999) + 1;
  }

  addShape() {
    let targetObject = {
      width: this.mainRect?.width * this.mainRect?.scaleX || this.canvas.getWidth() * this.canvas.getZoom(),
      height: this.mainRect?.height * this.mainRect?.scaleY || this.canvas.getHeight() * this.canvas.getZoom()
    };
    let sourceObject = {
      width: this.new_width,
      height: this.new_height
    };

    if (this.new_height > 5 && this.new_width > 5) {
      this.getScaleToFit(sourceObject, targetObject).then(result => {
        if (result && result.scale) {
          let square = new fabric.Rect({
            top: this.mainRect?.top || 0,
            left: this.mainRect?.left || 0,
            width: this.new_width,
            height: this.new_height,
            scaleX: result?.scale < 1 ? result?.scale : 1,
            scaleY: result?.scale < 1 ? result?.scale : 1,
            stroke: 'blue',
            fill: '#ffffff',
            strokeWidth: 1,
            cornerColor: '#3880ff',
            cornerSize: 10,
            cornerStyle: 'circle',
            transparentCorners: false
          });
          this.extend(square, this.randomId());
          this.canvas.add(square);
          this.canvas.renderAll();
        }
      })
    }
  }

  refreshMainRect() {
    let targetObject = {
      width: this.canvas.getWidth() * this.canvas.getZoom(),
      height: this.canvas.getHeight() * this.canvas.getZoom()
    };
    let sourceObject = {
      width: this.mainRectWidth,
      height: this.mainRectHeight
    };
    if (!this.mainRect) {
      if (this.mainRectHeight > 5 && this.mainRectWidth > 5) {
        this.getScaleToFit(sourceObject, targetObject).then(result => {
          this.mainRect = new fabric.Rect({
            top: 0,
            left: 0,
            width: this.mainRectWidth,
            height: this.mainRectHeight,
            scaleX: result?.scale < 1 ? result.scale : 1,
            scaleY: result?.scale < 1 ? result.scale : 1,
            fill: '#ffffff',
            strokeWidth: 2,
            stroke: '#000',
            cornerColor: '#3880ff',
            cornerSize: 10,
            cornerStyle: 'circle',
            transparentCorners: false,
            selectable: false,
            evented: false
          })
          this.extend(this.mainRect, this.randomId());
          this.canvas.add(this.mainRect);
          this.mainRect.setPositionByOrigin({ x: this.canvas._width / 2, y: this.canvas._height / 2 }, 'center', 'center');
          this.mainRect.setCoords();
          this.canvas.sendToBack(this.mainRect)
          this.canvas.renderAll();
          this.canvas.renderAll();
          this.refreshAllObjectScale()
        })
      }
    }
    else {
      this.getScaleToFit(sourceObject, targetObject).then(result => {
        this.mainRect.set({
          width: this.mainRectWidth,
          height: this.mainRectHeight,
          scaleX: result?.scale < 1 ? result.scale : 1,
          scaleY: result?.scale < 1 ? result.scale : 1,
        })
        this.mainRect.setPositionByOrigin({ x: this.canvas._width / 2, y: this.canvas._height / 2 }, 'center', 'center');
        this.mainRect.setCoords();
        this.canvas.sendToBack(this.mainRect);
        this.canvas.renderAll();
        this.refreshAllObjectScale()
      });
    }
  }

  refreshAllObjectScale() {
    this.canvas.forEachObject(element => {
      if (element.toJSON().id !== this.mainRect.toJSON().id) {
        element.set({
          scaleX: this.mainRect?.scaleX,
          scaleY: this.mainRect?.scaleY
        })
        element.setCoords();
        this.canvas.renderAll();
      }
    })
  }

  /* refreshAllObjectScale() {
    let targetObject = {
      width: this.mainRect?.width * this.mainRect?.scaleX || this.canvas.getWidth() * this.canvas.getZoom(),
      height: this.mainRect?.height * this.mainRect?.scaleY || this.canvas.getHeight() * this.canvas.getZoom()
    };
    this.canvas.forEachObject(element => {
      if (element.toJSON().id !== this.mainRect.toJSON().id) {
        let sourceObject = {
          width: element.width,
          height: element.height,
        }
        this.getScaleToFit(sourceObject, targetObject).then(result => {
          if (result && result.scale) {
            element.set({
              scaleX: result?.scale,
              scaleY: result?.scale
            })
            element.setCoords();
            this.canvas.renderAll();
          }
        })
      }
    })
  } */

  async getScaleToFit(sourceObject: { width: number, height: number }, targetObject: { width: number, height: number }): Promise<any> {
    return new Promise(resolve => {
      let targetWidth = targetObject.width;
      let targetHeight = targetObject.height;
      const sourceWidth = sourceObject.width;
      const sourceHeight = sourceObject.height;
      if (this.isPortrait(sourceWidth, sourceHeight)) {
        const scale = targetHeight / sourceHeight;
        if (targetWidth < sourceWidth * scale) {
          resolve({ width: sourceWidth, height: sourceHeight, scale: targetWidth / sourceWidth });
        }
        else {
          resolve({ width: sourceWidth, height: sourceHeight, scale: scale });
        }
      }
      else if (this.isLandscape(sourceWidth, sourceHeight)) {
        const scale = targetWidth / sourceWidth;
        if (targetHeight < sourceHeight * scale) {
          resolve({ width: sourceWidth, height: sourceHeight, scale: targetHeight / sourceHeight });
        }
        else {
          resolve({ width: sourceWidth, height: sourceHeight, scale: scale });
        }
      }
      else {
        const scaleX = targetWidth / sourceWidth;
        const scaleY = targetHeight / sourceHeight;
        if (this.isLandscape(targetWidth, targetHeight))
          resolve({ width: sourceWidth, height: sourceHeight, scale: scaleY < 1 ? scaleY : 1 });
        else if (this.isPortrait(targetWidth, targetHeight))
          resolve({ width: sourceWidth, height: sourceHeight, scale: scaleX < 1 ? scaleX : 1 });
        else {
          resolve({ width: sourceWidth, height: sourceHeight, scale: scaleX < 1 ? scaleX : 1 });
        }
      }
    });
  }

  isPortrait(width, height) {
    return height > width + (height / 6);
  }

  isLandscape(width, height) {
    return width > height + (width / 6);
  }
}
