class Galaxy {
  constructor(el) {
    this.flag = true;
    this.test = true;
    this.n = 512;
    this.w = 0;
    this.h = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.star_color_ratio = 0;
    this.star_x_save = 0;
    this.star_y_save = 0;
    this.star_ratio = 256;
    this.star_speed = 4;
    this.star_speed_save = 0;
    this.star = new Array(this.n);
    this.opacity = 0.1;
    this.cursor_x = 0;
    this.cursor_y = 0;
    this.mouse_x = 0;
    this.mouse_y = 0;
    this.canvas_x = 0;
    this.canvas_y = 0;
    this.context;
    this.key;
    this.timeout;
    this.fps = 0;
    this.el = el;
    this.init();
  }

  init() {
    for (let i = 0; i < this.n; i++) {
      this.star[i] = new Array(5);
      this.star[i][0] = Math.random() * this.w * 2 - this.x * 2;
      this.star[i][1] = Math.random() * this.h * 2 - this.y * 2;
      this.star[i][2] = Math.round(Math.random() * this.z);
      this.star[i][3] = 0;
      this.star[i][4] = 0;
    }
    this.el.width = this.w;
    this.el.height = this.h;
    this.context = this.el.getContext('2d');
    this.context.fillStyle = 'rgb(0,0,0)';
    this.context.strokeStyle = 'rgb(255,255,255)';
  }

  anim() {
    this.mouse_x = this.cursor_x - this.x;
    this.mouse_y = this.cursor_y - this.y;
    this.context.fillRect(0, 0, this.w, this.h);
    for (let i = 0; i < this.n; i++) {
      this.test = true;
      this.star_x_save = this.star[i][3];
      this.star_y_save = this.star[i][4];
      this.star[i][0] += this.mouse_x >> 4;
      if (this.star[i][0] > this.x << 1) {
        this.star[i][0] -= this.w << 1;
        this.test = false;
      }
      if (this.star[i][0] < -this.x << 1) {
        this.star[i][0] += this.w << 1;
        this.test = false;
      }
      this.star[i][1] += this.mouse_y >> 4;
      if (this.star[i][1] > this.y << 1) {
        this.star[i][1] -= this.h << 1;
        this.test = false;
      }
      if (this.star[i][1] < -this.y << 1) {
        this.star[i][1] += this.h << 1;
        this.test = false;
      }
      this.star[i][2] -= this.star_speed;
      if (this.star[i][2] > this.z) {
        this.star[i][2] -= this.z;
        this.test = false;
      }
      if (this.star[i][2] < 0) {
        this.star[i][2] += this.z;
        this.test = false;
      }
      this.star[i][3] = this.x + (this.star[i][0] / this.star[i][2]) * this.star_ratio;
      this.star[i][4] = this.y + (this.star[i][1] / this.star[i][2]) * this.star_ratio;
      if (this.star_x_save > 0 && this.star_x_save < this.w && this.star_y_save > 0 && this.star_y_save < this.h && this.test) {
        this.context.lineWidth = (1 - this.star_color_ratio * this.star[i][2]) * 2;
        this.context.beginPath();
        this.context.moveTo(this.star_x_save, this.star_y_save);
        this.context.lineTo(this.star[i][3], this.star[i][4]);
        this.context.stroke();
        this.context.closePath();
      }
    }
    this.timeout = setTimeout(this.anim.bind(this), this.fps);
  }

  move(evt) {
    evt = evt;
    this.cursor_x = evt.pageX - this.canvas_x;
    this.cursor_y = evt.pageY - this.canvas_y;
  }

  key_manager(evt) {
    evt = evt;
    this.key = evt.which || evt.keyCode;
    switch (this.key) {
      case 27:
        if (this.flag) {
          this.timeout = setTimeout(this.anim.bind(this), this.fps);
        } else {
          clearTimeout(this.timeout);
        }
        break;
      case 32:
        this.star_speed_save = (this.star_speed !== 0) ? this.star_speed : this.star_speed_save;
        this.star_speed = (this.star_speed !== 0) ? 0 : this.star_speed_save;
        break;
      case 13:
        this.context.fillStyle = 'rgba(0,0,0,' + this.opacity + ')';
        break;
    }
    top.status = 'key=' + ((this.key < 100) ? '0' : '') + ((this.key < 10) ? '0' : '') + this.key;
  }

  release() {
    switch (this.key) {
      case 13:
        this.context.fillStyle = 'rgb(0,0,0)';
        break;
    }
  }
  escHandler() {
    if (this.flag) {
      this.timeout = setTimeout(this.anim.bind(this), this.fps);
    } else {
      clearTimeout(this.timeout);
    }
  }
  mouse_wheel(evt) {
    let delta = 0;
    if (evt.wheelDelta) {
      delta = evt.wheelDelta / 120;
    } else if (evt.detail) {
      delta = -evt.detail / 3;
    }

    this.star_speed += (delta >= 0) ? -0.2 : 0.2;
    if (evt.preventDefault) evt.preventDefault();
  }

  start() {
    this.resize();
    this.anim();
  }

  resize() {
    [this.w, this.h] = this.get_screen_size();
    this.x = Math.round(this.w / 2);
    this.y = Math.round(this.h / 2);
    this.z = (this.w + this.h) / 2;
    this.star_color_ratio = 1 / this.z;
    this.cursor_x = this.x;
    this.cursor_y = this.y;
    this.init();
  }
  get_screen_size() {
    return [document.documentElement.clientWidth, document.documentElement.clientHeight];
  }
}
export default Galaxy;

// document.onmousemove = move;
// document.onkeypress = key_manager;
// document.onkeyup = release;
// document.onmousewheel = mouse_wheel;
// if (window.addEventListener) window.addEventListener('DOMMouseScroll', mouse_wheel, false);
