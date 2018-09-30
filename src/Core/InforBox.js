class InforBox {
  constructor(id, className) {
    this.infobox = {};
    this.infobox.id = id;
    this.infobox.className = className;
    this.feature = {
      id: '',
      type: '',
      height: '',
      area: '',
      longitude: '',
      latitude: '',
      name: '',
      brokenRelation: '',
    };
    this.observe(this.feature);
  }

  observe(feature) {
    Object.keys(feature).forEach(key => {
      this.defineReactive(feature, key, feature[key]);
    });
  }

  setFeature(pickedFeature) {
    this.feature.id = pickedFeature.getProperty('id');
    this.feature.type = pickedFeature.getProperty('type');
    this.feature.height = pickedFeature.getProperty('height');
    this.feature.area = pickedFeature.getProperty('area');
    this.feature.longitude = pickedFeature.getProperty('longitude');
    this.feature.latitude = pickedFeature.getProperty('latitude');
    this.feature.name = pickedFeature.getProperty('name');
    this.feature.brokenRelation = pickedFeature.getProperty('brokenRelation');
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
          // todo 写infobox的动态set
          that.infobox[key] = '<tr id="' + key + '""><th>' + key + '</th><td>' + newValue + '</td></tr>';
        }
      }
    });
  }
};

export default InforBox;
