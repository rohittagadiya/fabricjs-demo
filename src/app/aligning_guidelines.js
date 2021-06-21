export function initAligningGuidelines(canvas) {

    var ctx = canvas.getSelectionContext(),
        aligningLineMargin = 10,
        aligningLineWidth = 2,
        aligningLineColor = '#6aacff',
        viewportTransform,
        zoom = 1;

    function drawVerticalLine(coords) {
        drawLine(
            coords.x + 0.5,
            coords.y1 > coords.y2 ? coords.y2 : coords.y1,
            coords.x + 0.5,
            coords.y2 > coords.y1 ? coords.y2 : coords.y1);
    }

    function drawHorizontalLine(coords) {
        drawLine(
            coords.x1 > coords.x2 ? coords.x2 : coords.x1,
            coords.y + 0.5,
            coords.x2 > coords.x1 ? coords.x2 : coords.x1,
            coords.y + 0.5);
    }

    function drawLine(x1, y1, x2, y2) {
        ctx.save();
        ctx.lineWidth = aligningLineWidth;
        ctx.strokeStyle = aligningLineColor;
        ctx.beginPath();
        ctx.moveTo(((x1 + viewportTransform[4]) * zoom), ((y1 + viewportTransform[5]) * zoom));
        ctx.lineTo(((x2 + viewportTransform[4]) * zoom), ((y2 + viewportTransform[5]) * zoom));
        ctx.stroke();
        ctx.restore();
    }

    function isInRange(value1, value2) {
        value1 = Math.round(value1);
        value2 = Math.round(value2);
        if (value2 >= (value1 - aligningLineMargin) && value2 <= (value1 + aligningLineMargin)) {
            return true
        } else {
            return false
        }
    }

    async function reAssignPosition(activeObject) {
        let activeObjectCenter = activeObject.getCenterPoint(),
            activeObjectBoundingRect = activeObject.getBoundingRect();
        return {
            activeObjectCenter: activeObject.getCenterPoint(),
            activeObjectLeft: activeObjectCenter.x,
            activeObjectTop: activeObjectCenter.y,
            activeObjectBoundingRect: activeObject.getBoundingRect(),
            activeObjectHeight: activeObjectBoundingRect.height / viewportTransform[3],
            activeObjectWidth: activeObjectBoundingRect.width / viewportTransform[3]
        }
    }

    async function activeBottomOtherTop(objectTop, objectHeight, positions) {
        if (isInRange(objectTop - objectHeight / 2, positions.activeObjectTop + positions.activeObjectHeight / 2)) {
            return {
                top: objectTop - objectHeight / 2 - positions.activeObjectHeight / 2
            };
        } else return {};
    }

    async function activeBottomOtherBottom(objectTop, objectHeight, positions) {
        if (isInRange(objectTop + objectHeight / 2, positions.activeObjectTop + positions.activeObjectHeight / 2)) {
            return {
                top: objectTop + objectHeight / 2 - positions.activeObjectHeight / 2
            };
        } else {
            return {};
        }
    }

    async function activeTopOtherTop(objectTop, objectHeight, positions) {
        if (isInRange(objectTop - objectHeight / 2, positions.activeObjectTop - positions.activeObjectHeight / 2)) {
            return {
                top: objectTop - objectHeight / 2 + positions.activeObjectHeight / 2
            };
        } else return {};
    }

    async function activeTopOtherBottom(objectTop, objectHeight, positions) {
        if (isInRange(objectTop + objectHeight / 2, positions.activeObjectTop - positions.activeObjectHeight / 2)) {
            return {
                top: objectTop + objectHeight / 2 + positions.activeObjectHeight / 2
            };
        } else return {};
    }

    async function activeCenterOtherCenterH(objectLeft, positions) {
        if (isInRange(objectLeft, positions.activeObjectLeft)) {
            return {
                left: objectLeft
            };
        } else return {};
    }

    async function activeCenterOtherCenterV(objectTop, positions) {
        if (isInRange(objectTop, positions.activeObjectTop)) {
            return {
                top: objectTop
            };
        } else return {};
    }

    function setRoundedPosition(activeObject, left, top) {
        activeObject.setPositionByOrigin(new fabric.Point(Math.round(left), Math.round(top)), 'center', 'center');
    }

    var verticalLines = [],
        horizontalLines = [];

    canvas.on('mouse:down', function() {
        viewportTransform = canvas.viewportTransform;
        zoom = canvas.getZoom();
    });

    canvas.on('object:moving', (e) => {

        var activeObject = e.target,
            canvasObjects = canvas.getObjects(),
            activeObjectCenter = activeObject.getCenterPoint(),
            activeObjectBoundingRect = activeObject.getBoundingRect(),
            positions = {
                activeObjectCenter: activeObject.getCenterPoint(),
                activeObjectLeft: activeObjectCenter.x,
                activeObjectTop: activeObjectCenter.y,
                activeObjectBoundingRect: activeObject.getBoundingRect(),
                activeObjectHeight: activeObjectBoundingRect.height / viewportTransform[3],
                activeObjectWidth: activeObjectBoundingRect.width / viewportTransform[3]
            },
            horizontalInTheRange = false,
            verticalInTheRange = false,
            transform = canvas._currentTransform,
            canvasHeight = canvas.getHeight() / viewportTransform[3],
            canvasWidth = canvas.getWidth() / viewportTransform[3]

        if (!transform) return;

        canvas.forEachObject((object, i) => {
                if (activeObject.hasOwnProperty('_objects') && activeObject._objects.indexOf(object) != -1) {
                    // this is for group
                    return;
                }
                if (object === activeObject) return;

                var objectCenter = object.getCenterPoint(),
                    objectLeft = objectCenter.x,
                    objectTop = objectCenter.y,
                    objectBoundingRect = object.getBoundingRect(),
                    objectHeight = objectBoundingRect.height / viewportTransform[3],
                    objectWidth = objectBoundingRect.width / viewportTransform[0];

                // active : top | other : bottom
                if (isInRange(objectTop + objectHeight / 2, positions.activeObjectTop - positions.activeObjectHeight / 2)) {
                    horizontalInTheRange = true;
                    horizontalLines.push({
                        y: objectTop + objectHeight / 2,
                        x1: 0,
                        x2: canvasWidth
                    });
                    setRoundedPosition(activeObject, positions.activeObjectLeft, objectTop + objectHeight / 2 + positions.activeObjectHeight / 2);
                    reAssignPosition(activeObject).then(result => {
                        positions = result
                    });
                }

                // active : top | other : top
                if (isInRange(objectTop - objectHeight / 2, positions.activeObjectTop - positions.activeObjectHeight / 2)) {
                    horizontalInTheRange = true;
                    horizontalLines.push({
                        y: objectTop - objectHeight / 2,
                        x1: 0,
                        x2: canvasWidth
                    });
                    setRoundedPosition(activeObject, positions.activeObjectLeft, objectTop - objectHeight / 2 + positions.activeObjectHeight / 2);
                    reAssignPosition(activeObject).then(result => {
                        positions = result
                    });
                }

                // active : bottom | other : bottom
                if (isInRange(objectTop + objectHeight / 2, positions.activeObjectTop + positions.activeObjectHeight / 2)) {
                    horizontalInTheRange = true;
                    horizontalLines.push({
                        y: objectTop + objectHeight / 2,
                        x1: 0,
                        x2: canvasWidth
                    });
                    setRoundedPosition(activeObject, positions.activeObjectLeft, objectTop + objectHeight / 2 - positions.activeObjectHeight / 2);
                    reAssignPosition(activeObject).then(result => {
                        positions = result
                    });
                }

                // active : bottom | other : top
                if (isInRange(objectTop - objectHeight / 2, positions.activeObjectTop + positions.activeObjectHeight / 2)) {
                    horizontalInTheRange = true;
                    horizontalLines.push({
                        y: objectTop - objectHeight / 2,
                        x1: 0,
                        x2: canvasWidth
                    });
                    setRoundedPosition(activeObject, positions.activeObjectLeft, objectTop - objectHeight / 2 - positions.activeObjectHeight / 2);
                    reAssignPosition(activeObject).then(result => {
                        positions = result
                    });
                }

                // active : left | other : right
                if (isInRange(objectLeft + objectWidth / 2, positions.activeObjectLeft - positions.activeObjectWidth / 2)) {
                    verticalInTheRange = true;
                    verticalLines.push({
                        x: objectLeft + objectWidth / 2,
                        y1: 0,
                        y2: canvasHeight
                    });
                    var top = positions.activeObjectTop;
                    activeTopOtherBottom(objectTop, objectHeight, positions).then(snappable => {
                        snappable && snappable.top ? top = snappable.top : null;
                        activeCenterOtherCenterV(objectTop, positions).then(snappable => {
                            snappable && snappable.top ? top = snappable.top : null;
                            activeTopOtherTop(objectTop, objectHeight, positions).then(snappable => {
                                snappable && snappable.top ? top = snappable.top : null;
                                activeBottomOtherBottom(objectTop, objectHeight, positions).then(snappable => {
                                    snappable && snappable.top ? top = snappable.top : null;
                                    activeBottomOtherTop(objectTop, objectHeight, positions).then(snappable => {
                                        snappable && snappable.top ? top = snappable.top : null;
                                        setRoundedPosition(activeObject, objectLeft + objectWidth / 2 + positions.activeObjectWidth / 2, top || positions.activeObjectTop);
                                        reAssignPosition(activeObject).then(result => {
                                            positions = result
                                        });
                                    });
                                });
                            });
                        });
                    })
                }

                // active : left | other : left
                if (isInRange(objectLeft - objectWidth / 2, positions.activeObjectLeft - positions.activeObjectWidth / 2)) {
                    verticalInTheRange = true;
                    verticalLines.push({
                        x: objectLeft - objectWidth / 2,
                        y1: 0,
                        y2: canvasHeight
                    });
                    var top = positions.activeObjectTop;
                    activeTopOtherBottom(objectTop, objectHeight, positions).then(snappable => {
                        snappable && snappable.top ? top = snappable.top : null;
                        activeCenterOtherCenterV(objectTop, positions).then(snappable => {
                            snappable && snappable.top ? top = snappable.top : null;
                            activeTopOtherTop(objectTop, objectHeight, positions).then(snappable => {
                                snappable && snappable.top ? top = snappable.top : null;
                                activeBottomOtherBottom(objectTop, objectHeight, positions).then(snappable => {
                                    snappable && snappable.top ? top = snappable.top : null;
                                    activeBottomOtherTop(objectTop, objectHeight, positions).then(snappable => {
                                        snappable && snappable.top ? top = snappable.top : null;
                                        setRoundedPosition(activeObject, objectLeft - objectWidth / 2 + positions.activeObjectWidth / 2, top);
                                        reAssignPosition(activeObject).then(result => {
                                            positions = result
                                        });
                                    })
                                })
                            })
                        })
                    })
                }

                // active : right | other : right
                if (isInRange(objectLeft + objectWidth / 2, positions.activeObjectLeft + positions.activeObjectWidth / 2)) {
                    verticalInTheRange = true;
                    verticalLines.push({
                        x: objectLeft + objectWidth / 2,
                        y1: 0,
                        y2: canvasHeight
                    });
                    var top = positions.activeObjectTop;
                    activeTopOtherBottom(objectTop, objectHeight, positions).then(snappable => {
                        snappable && snappable.top ? top = snappable.top : null;
                        activeCenterOtherCenterV(objectTop, positions).then(snappable => {
                            snappable && snappable.top ? top = snappable.top : null;
                            activeTopOtherTop(objectTop, objectHeight, positions).then(snappable => {
                                snappable && snappable.top ? top = snappable.top : null;
                                activeBottomOtherBottom(objectTop, objectHeight, positions).then(snappable => {
                                    snappable && snappable.top ? top = snappable.top : null;
                                    activeBottomOtherTop(objectTop, objectHeight, positions).then(snappable => {
                                        snappable && snappable.top ? top = snappable.top : null;
                                        setRoundedPosition(activeObject, objectLeft + objectWidth / 2 - positions.activeObjectWidth / 2, top);
                                        reAssignPosition(activeObject).then(result => {
                                            positions = result
                                        });
                                    });
                                });
                            });
                        });
                    });
                }

                // active : right | other : left
                if (isInRange(objectLeft - objectWidth / 2, positions.activeObjectLeft + positions.activeObjectWidth / 2)) {
                    verticalInTheRange = true;
                    verticalLines.push({
                        x: objectLeft - objectWidth / 2,
                        y1: 0,
                        y2: canvasHeight
                    });
                    var top = positions.activeObjectTop;
                    activeTopOtherBottom(objectTop, objectHeight, positions).then(snappable => {
                        snappable && snappable.top ? top = snappable.top : null;
                        activeCenterOtherCenterV(objectTop, positions).then(snappable => {
                            snappable && snappable.top ? top = snappable.top : null;
                            activeTopOtherTop(objectTop, objectHeight, positions).then(snappable => {
                                snappable && snappable.top ? top = snappable.top : null;
                                activeBottomOtherBottom(objectTop, objectHeight, positions).then(snappable => {
                                    snappable && snappable.top ? top = snappable.top : null;
                                    activeBottomOtherTop(objectTop, objectHeight, positions).then(snappable => {
                                        snappable && snappable.top ? top = snappable.top : null;
                                        setRoundedPosition(activeObject, objectLeft - objectWidth / 2 - positions.activeObjectWidth / 2, top || positions.activeObjectTop);
                                        reAssignPosition(activeObject).then(result => {
                                            positions = result
                                        });
                                    })
                                })
                            })
                        })
                    })
                }

                // CENTER SNAPPING
                // snap in center when move vertically
                if (isInRange(objectTop, positions.activeObjectTop)) {
                    horizontalInTheRange = true;
                    horizontalLines.push({
                        y: objectTop,
                        x1: 0,
                        x2: canvasWidth
                    });
                    setRoundedPosition(activeObject, positions.activeObjectLeft, objectTop);
                    reAssignPosition(activeObject).then(result => {
                        positions = result
                    });
                }

                // center snap when move horizontally
                if (isInRange(objectLeft, positions.activeObjectLeft)) {
                    verticalInTheRange = true;
                    verticalLines.push({
                        x: objectLeft,
                        y1: 0,
                        y2: canvasHeight
                    });
                    var top = positions.activeObjectTop
                    activeTopOtherBottom(objectTop, objectHeight, positions).then(snappable => {
                        snappable && snappable.top ? top = snappable.top : null;
                        activeCenterOtherCenterV(objectTop, positions).then(snappable => {
                            snappable && snappable.top ? top = snappable.top : null;
                            activeTopOtherTop(objectTop, objectHeight, positions).then(snappable => {
                                snappable && snappable.top ? top = snappable.top : null;
                                activeBottomOtherBottom(objectTop, objectHeight, positions).then(snappable => {
                                    snappable && snappable.top ? top = snappable.top : null;
                                    activeBottomOtherTop(objectTop, objectHeight, positions).then(snappable => {
                                        snappable && snappable.top ? top = snappable.top : null;
                                        setRoundedPosition(activeObject, objectLeft, top);
                                        reAssignPosition(activeObject).then(result => {
                                            positions = result
                                        });
                                    })
                                });
                            })
                        })
                    })
                }
            })
            // }

        if (!horizontalInTheRange) {
            horizontalLines.length = 0;
        }

        if (!verticalInTheRange) {
            verticalLines.length = 0;
        }
    });

    canvas.on('before:render', function() {
        canvas.clearContext(canvas.contextTop);
    });

    canvas.on('after:render', function() {
        for (var i = verticalLines.length; i--;) {
            drawVerticalLine(verticalLines[i]);
        }
        for (var i = horizontalLines.length; i--;) {
            drawHorizontalLine(horizontalLines[i]);
        }

        verticalLines.length = horizontalLines.length = 0;
    });

    canvas.on('mouse:up', function() {
        verticalLines.length = horizontalLines.length = 0;
        canvas.renderAll();
    });
}