let vmCollection = [];
let status = 'pending';

class Infobox {
  static listen(vm) {
    vmCollection.push(vm);
    if (status === 'pending') Infobox.startListening();
  }
  static startListening() {
    status = 'listening';
    
  }
}
export default Infobox;

Infobox.listen({
  type: MovingTarget,
  props: 'options',
  keys: ['id', 'phone', 'type', 'ascriptions', 'time'],
  close: function() {},
  icon: [function() {}],
  trigger: LEFT_CLICK,
  single: false
})

Infobox.listen({
  type: Cesium3DTileFeature,
  props: 'getProperty',
  keys: ['id', 'type', 'height', 'area', 'longitude', 'latitude'],
  close: function() {},
  icon: [function() {}],
  trigger: LEFT_CLICK,
  single: true
})
