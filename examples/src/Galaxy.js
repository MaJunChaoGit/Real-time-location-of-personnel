function $i(id) {
  return document.getElementById(id);
}

function get_screen_size() {
  var w = document.documentElement.clientWidth;
  var h = document.documentElement.clientHeight;
  return [w, h];
}

var url = document.location.href;

var flag = true;

var test = true;

var n = 512;

var w = 0;

var h = 0;

var x = 0;

var y = 0;

var z = 0;

var star_color_ratio = 0;

var star_x_save, star_y_save;

var star_ratio = 256;

var star_speed = 4;

var star_speed_save = 0;

var star = new Array(n);

var opacity = 0.1;

var cursor_x = 0;

var cursor_y = 0;

var mouse_x = 0;

var mouse_y = 0;

var canvas_x = 0;

var canvas_y = 0;

var context;

var key;

var timeout;

var fps = 0;

function init() {
  for (var i = 0; i < n; i++) {
    star[i] = new Array(5);
    star[i][0] = Math.random() * w * 2 - x * 2;
    star[i][1] = Math.random() * h * 2 - y * 2;
    star[i][2] = Math.round(Math.random() * z);
    star[i][3] = 0;
    star[i][4] = 0;
  }
  var starfield = $i('starfield');
  starfield.style.position = 'absolute';
  starfield.width = w;
  starfield.height = h;
  context = starfield.getContext('2d');
  context.fillStyle = 'rgb(0,0,0)';
  context.strokeStyle = 'rgb(255,255,255)';
  var adsense = $i('adsense');
  adsense.style.left = Math.round((w - 728) / 2) + 'px';
  adsense.style.top = (h - 15) + 'px';
  adsense.style.width = 728 + 'px';
  adsense.style.height = 15 + 'px';
  adsense.style.display = 'block';
}

function anim() {

  mouse_x = cursor_x - x;

  mouse_y = cursor_y - y;

  context.fillRect(0, 0, w, h);

  for (var i = 0; i < n; i++) {

    test = true;

    star_x_save = star[i][3];

    star_y_save = star[i][4];

    star[i][0] += mouse_x >> 4;
    if (star[i][0] > x << 1) {
      star[i][0] -= w << 1;
      test = false;
    }
    if (star[i][0] < -x << 1) {
      star[i][0] += w << 1;
      test = false;
    }

    star[i][1] += mouse_y >> 4;
    if (star[i][1] > y << 1) {
      star[i][1] -= h << 1;
      test = false;
    }
    if (star[i][1] < -y << 1) {
      star[i][1] += h << 1;
      test = false;
    }

    star[i][2] -= star_speed;
    if (star[i][2] > z) {
      star[i][2] -= z;
      test = false;
    }
    if (star[i][2] < 0) {
      star[i][2] += z;
      test = false;
    }

    star[i][3] = x + (star[i][0] / star[i][2]) * star_ratio;

    star[i][4] = y + (star[i][1] / star[i][2]) * star_ratio;

    if (star_x_save > 0 && star_x_save < w && star_y_save > 0 && star_y_save < h && test) {

      context.lineWidth = (1 - star_color_ratio * star[i][2]) * 2;

      context.beginPath();

      context.moveTo(star_x_save, star_y_save);

      context.lineTo(star[i][3], star[i][4]);

      context.stroke();

      context.closePath();

    }

  }

  timeout = setTimeout(anim, fps);

}

function move(evt) {
  evt = evt;
  cursor_x = evt.pageX - canvas_x;
  cursor_y = evt.pageY - canvas_y;
}

function key_manager(evt) {

  evt = evt;

  key = evt.which || evt.keyCode;

  switch (key) {

    case 27:
      if (flag) {
        timeout = setTimeout(anim, fps);
      } else {
        clearTimeout(timeout);
      }
      break;
    case 32:
      star_speed_save = (star_speed !== 0) ? star_speed : star_speed_save;
      star_speed = (star_speed !== 0) ? 0 : star_speed_save;
      break;
    case 13:
      context.fillStyle = 'rgba(0,0,0,' + opacity + ')';
      break;
  }
  top.status = 'key=' + ((key < 100) ? '0' : '') + ((key < 10) ? '0' : '') + key;

}

function release() {
  switch (key) {
    case 13:
      context.fillStyle = 'rgb(0,0,0)';
      break;
  }
}

function mouse_wheel(evt) {
  var delta = 0;
  if (evt.wheelDelta) {
    delta = evt.wheelDelta / 120;
  } else if (evt.detail) {
    delta = -evt.detail / 3;
  }

  star_speed += (delta >= 0) ? -0.2 : 0.2;

  if (evt.preventDefault) evt.preventDefault();

}

function start() {

  resize();

  anim();

}

function resize() {
  [w, h] = get_screen_size();
  x = Math.round(w / 2);
  y = Math.round(h / 2);
  z = (w + h) / 2;

  star_color_ratio = 1 / z;

  cursor_x = x;

  cursor_y = y;

  init();

}

document.onmousemove = move;

document.onkeypress = key_manager;

document.onkeyup = release;

document.onmousewheel = mouse_wheel;
if (window.addEventListener) window.addEventListener('DOMMouseScroll', mouse_wheel, false);
