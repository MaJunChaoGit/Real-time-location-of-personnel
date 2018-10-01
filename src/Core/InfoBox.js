import Math from 'cesium/Core/Math';

class InfoBox {
  constructor(container) {
    this.container = container;
    this.table = document.createElement('table');
    this.feature = {
      id: '',
      type: '',
      height: '',
      area: '',
      longitude: '',
      latitude: ''
    };
    this.observe(this.feature);
    this.createTable();
    this.defineInfoBoxReactive();
  }
  show(isShow) {
    document.querySelector('.rp-infobox').style.display = isShow ? 'block' : 'none';
  }
  observe(feature) {
    Object.keys(feature).forEach(key => {
      this.defineReactive(feature, key, feature[key]);
    });
  }

  setFeature(pickedFeature, names) {
    names.forEach(name => {
      this.feature[name] = pickedFeature.getProperty(name);
    });
  }

  defineReactive(obj, key, value) {
    let that = this;
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        return obj[key];
      },
      set(newValue) {
        if (newValue !== value) {
          value = newValue;
          that.infobox[key] = newValue;
        }
      }
    });
  }
  createTable() {
    this.table.setAttribute('class', 'rp-infobox__table');
    this.container.appendChild(this.table);
  }
  defineInfoBoxReactive() {
    let that = this;
    /* eslint-disable */
    that.infobox = new Proxy({}, {
      set: function(obj, prop, value) {
        value = that.toFixed(prop, value);
        if (!document.querySelector('.rp-infobox__container table #' + prop)) {
          let tr = document.createElement('tr');
          tr.setAttribute('id', prop);
          that.table.appendChild(tr);
          tr.innerHTML = '<th>' + prop + '</th><td>' + (value ? value : '暂无') + '</td>';
        } else {
          document.querySelector('.rp-infobox__container table #' + prop + '> td').textContent = value ? value : '暂无';
        }
        obj[prop] = value;
        return true;
      }
    });
  }
  toFixed(prop, value) {
    if (prop === 'longitude' || prop === 'latitude') value = Math.toDegrees(Number(value)).toFixed(2);
    if (prop === 'height' || prop === 'area') value = value.toFixed(2);
    return value;
  }
};

export default InfoBox;
