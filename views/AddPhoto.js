var React = require('react-native');
var moment = require('moment');
var CoreStyle = require('./CoreStyle.js');
var NavigationBar = require('./NavigationBar.js');
var {
  ActivityIndicatorIOS,
  AsyncStorage,
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  ListView,
  CameraRoll,
  NativeModules
} = React;
var {
  H1,
  H2,
  Text,
  CustomPlusButton
} = CoreStyle;

var Parse = require('parse').Parse;
var CameraRollView = require('./CameraRollView.js');

var CAMERA_ROLL_VIEW = 'camera_roll_view';

// App views
var Views = {
  Loading: require('./Loading.js')
};

var AddPhotoView = React.createClass({
  getInitialState() {
    return {
      loading: false,
      imageUrl: ''
    }
  },

  addPhoto(uri) {
    var self = this;
    NativeModules.ReadImageData.readImage(uri, function(image) {
      var Photo = Parse.Object.extend('Photo');
      var photo = new Photo();

      photo.set('author', global.curUser);
      photo.set('house', global.curHouse);

      var fileName = global.curUser.id + '-' + (new Date()).getTime();
      var file = new Parse.File(fileName, { base64: image });

      photo.set('file', file);
      photo.save().then(function() {
        self.props.route.callPrevView();
        self.props.navigator.pop();
      });
    });

  },

  _renderImage(asset) {
     var imageSize = 70;
     var imageStyle = [styles.image, {width: imageSize, height: imageSize}];
     return (
       <View key={asset} style={styles.row}>
        <TouchableOpacity onPress={() => this.addPhoto(asset.node.image.uri)}>
           <Image
             source={asset.node.image}
             style={imageStyle}
           />
         </TouchableOpacity>
       </View>
     );
   },

  render() {
    return (
      <View style={styles.contentContainer}>
        <CameraRollView
          ref={CAMERA_ROLL_VIEW}
          batchSize={6}
          imagesPerRow={3}
          groupTypes={'SavedPhotos'}
          renderImage={this._renderImage}
       />
      </View>);
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex:1,
  },
  image: {
    margin: 4,
  },
  info: {
    flex: 1
  }
});

module.exports = AddPhotoView;
