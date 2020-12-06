'use strict';

function Rect() {
    this.x = 0;
    this.y = 0;
    this.xpos = 0;
    this.ypos = 0;
    this.zpos = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.color = "#ffffff";
    this.alpha = 1;
    this.lineWidth = 1;
    this.width = 100;
    this.height = 100;
}

Rect.prototype.draw = function (ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
};

Rect.prototype.hitTest = function (ctx, x, y) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(this.scaleX, this.scaleY);
    const transformedPoint = ctx.transformedPoint(x, y);
    ctx.restore();

    if (transformedPoint.x < this.width && transformedPoint.x > 0 && transformedPoint.y > 0 && transformedPoint.y < this.height) {
        return true;

    } else {
        return false;
    }
};

window.onload = function () {
    var canvas = document.getElementById('space-canvas'),
        width = (window.innerWidth - 3),
        height = (window.innerHeight - 3);

    // canvas.style.width = (window.innerWidth - 3) + 'px';
    canvas.width = (window.innerWidth - 3);
    // canvas.style.height = (window.innerHeight - 4) + 'px';
    canvas.height = (window.innerHeight - 4);

    var context = canvas.getContext('2d'),
        objects = [],
        numrects = 10,
        fl = 250,
        vpX = width / 2,
        vpY = height / 2,
        ax = 0,
        ay = 0,
        az = 0,
        vx = 0,
        vy = 0,
        vz = 0,
        friction = 0.98,
        lastX,
        lastY,
        dragged = false,
        dragStart;

    trackTransforms(context);

    // for (var rect, i = 0; i < numrects; i++) {
    //     rect = new Rect();
    //     rect.xpos = Math.random() * 9000 - 50;
    //     rect.ypos = Math.random() * 5000 - 20;
    //     rect.zpos = Math.random() * 10000000;
    //     rects.push(rect);
    // }

    var rect = new Rect();
    rect.xpos = -300;
    rect.ypos = 100;
    rect.zpos = 1;

    objects.push(rect);

    var rect1 = new Rect();
    rect1.xpos = 300;
    rect1.ypos = -200;
    rect1.zpos = 500;

    objects.push(rect1);

    var rect2 = new Rect();
    rect2.xpos = -100;
    rect2.ypos = -300;
    rect2.zpos = 1000;

    objects.push(rect2);

    window.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
            case 38:        //up
                vz = -1;
                break;
            case 40:        //down
                vz = 1;
                break;
            case 37:        //left
                vx = 1;
                break;
            case 39:        //right
                vx = -1;
                break;
        }
    }, false);

    window.addEventListener('keyup', function (event) {
        switch (event.keyCode) {
            case 38:        //up
            case 40:        //down
                vz = 0;
                break;
            case 37:        //left
            case 39:        //right
                vx = 0;
                break;
        }
    }, false);

    canvas.addEventListener('mousedown', function (evt) {
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragStart = context.transformedPoint(lastX, lastY);
        dragged = false;
    }, false);

    canvas.addEventListener('mousemove', function (evt) {
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);

        dragged = true;
        if (dragStart) {
            var pt = context.transformedPoint(lastX, lastY);
            var changeX = pt.x - dragStart.x;
            var changeY = pt.y - dragStart.y;

            updatePosition(changeX, changeY);
        }

        var hit = false;

        for (let index = 0; index < objects.length; index++) {
            const object = objects[index];

            hit = hit || object.hitTest(context, lastX, lastY);
        }

        if (hit) {
            evt.target.style.cursor = 'pointer';
        } else {
            evt.target.style.cursor = 'default';
        }
    }, false);

    canvas.addEventListener('mouseup', function (evt) {
        dragStart = null;
    }, false);

    var handleScroll = function (evt) {
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta > 0) {
            vz = -3;
        } else {
            vz = 3;
        }
        setTimeout(() => {
            vz = 0;
        }, 100);
        return evt.preventDefault() && false;
    };

    canvas.addEventListener('DOMMouseScroll', handleScroll, false);
    canvas.addEventListener('mousewheel', handleScroll, false);

    canvas.addEventListener('click', function (evt) {
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);

        let hitObject = null;

        for (let index = 0; index < objects.length; index++) {
            const object = objects[index];

            if (object.hitTest(context, lastX, lastY)) {
                hitObject = object;
            }
        }

        var diffX = -100 - hitObject.xpos;
        var diffY = -100 - hitObject.ypos;
        var diffZ = 1 - hitObject.zpos;

        for (let index = 0; index < objects.length; index++) {
            const object = objects[index];

            object.xpos += diffX;
            object.ypos += diffY;
            object.zpos += diffZ;
        }
    }, false);

    function updatePosition(x, y) {
        objects.forEach(rect => {
            rect.xpos += x;
            rect.ypos += y;

            var scale = fl / (fl + rect.zpos);
            rect.scaleX = rect.scaleY = scale;
            rect.x = rect.xpos * scale;
            rect.y = rect.ypos * scale;
            rect.alpha = scale;
        });
    }

    function move(rect) {
        rect.xpos += vx;
        rect.ypos += vy;
        rect.zpos += vz;
        // if (rect.xpos > 5000) {
        //     rect.xpos += -9000;
        // }
        // if (rect.xpos < -5000) {
        //     rect.xpos += 9000;
        // }
        if (rect.zpos < -fl) {
            rect.zpos += 1000000;
        }
        if (rect.zpos > 1000000 - fl) {
            rect.zpos -= 1000000;
        }
        var scale = fl / (fl + rect.zpos);
        rect.scaleX = rect.scaleY = scale;
        rect.x = vpX + rect.xpos * scale;
        rect.y = vpY + rect.ypos * scale;
        rect.alpha = scale;
    }

    function zSort(a, b) {
        return (b.zpos - a.zpos);
    }

    function draw(rect) {
        rect.draw(context);
    }

    (function drawFrame() {
        window.requestAnimationFrame(drawFrame, canvas);
        context.clearRect(0, 0, width, height);

        // vx += ax;
        // vy += ay;
        // vz += az;
        objects.forEach(move);
        // vx *= friction;
        // vy *= friction;
        // vz *= friction;
        objects.sort(zSort);
        objects.forEach(draw);
    }());
};

function trackTransforms(ctx) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    var xform = svg.createSVGMatrix();
    ctx.getTransform = function () { return xform; };

    var savedTransforms = [];
    var save = ctx.save;
    ctx.save = function () {
        savedTransforms.push(xform.translate(0, 0));
        return save.call(ctx);
    };

    var restore = ctx.restore;
    ctx.restore = function () {
        xform = savedTransforms.pop();
        return restore.call(ctx);
    };

    var scale = ctx.scale;
    ctx.scale = function (sx, sy) {
        xform = xform.scaleNonUniform(sx, sy);
        return scale.call(ctx, sx, sy);
    };

    var rotate = ctx.rotate;
    ctx.rotate = function (radians) {
        xform = xform.rotate(radians * 180 / Math.PI);
        return rotate.call(ctx, radians);
    };

    var translate = ctx.translate;
    ctx.translate = function (dx, dy) {
        xform = xform.translate(dx, dy);
        return translate.call(ctx, dx, dy);
    };

    var transform = ctx.transform;
    ctx.transform = function (a, b, c, d, e, f) {
        var m2 = svg.createSVGMatrix();
        m2.a = a; m2.b = b; m2.c = c; m2.d = d; m2.e = e; m2.f = f;
        xform = xform.multiply(m2);
        return transform.call(ctx, a, b, c, d, e, f);
    };

    var setTransform = ctx.setTransform;
    ctx.setTransform = function (a, b, c, d, e, f) {
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(ctx, a, b, c, d, e, f);
    };

    var pt = svg.createSVGPoint();
    ctx.transformedPoint = function (x, y) {
        pt.x = x; pt.y = y;
        return pt.matrixTransform(xform.inverse());
    }
}