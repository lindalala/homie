var React = require('react-native');
var moment = require('moment');
var CoreStyle = require('./CoreStyle.js');
var NavigationBar = require('./NavigationBar.js');
var Camera = require('react-native-camera');
var {
  ActivityIndicatorIOS,
  AsyncStorage,
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  ListView,
  NativeModules
} = React;
var {
  H1,
  H2,
  Text,
  CustomPlusButton
} = CoreStyle;

var Parse = require('parse').Parse;

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

  addPhoto(base64img) {
    var Photo = Parse.Object.extend('Photo');
    var photo = new Photo();

    photo.set('author', global.curUser);
    photo.set('house', global.curHouse);

    var fileName = global.curUser.id + '-' + (new Date()).getTime();
    var file = new Parse.File(fileName, { base64: base64img });

    photo.set('file', file);
    photo.save().then(function() {
      this.props.route.callPrevView();
      this.props.navigator.pop();
    }.bind(this));
  },

  render() {
    return (
      <View style={styles.contentContainer}>
        <Camera
            ref="cam"
            style={styles.cameraView}
          />
        <TouchableOpacity onPress={() => this.refs.cam.switch()}>
          <View>
            <Text>Flip camera</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.takePicture}>
          <View>
            <Text>Take picture</Text>
          </View>
        </TouchableOpacity>
      </View>);
  },
  takePicture() {
    this.refs.cam.takePicture(function(err, base64EncodedJpeg) {
      if (err) return;

      this.addPhoto(base64EncodedJpeg);
    }.bind(this));
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex:1,
  },
  cameraView: {
    flex: 1
  }
});

module.exports = AddPhotoView;
