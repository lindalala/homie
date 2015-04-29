var React = require('react-native');
var moment = require('moment');
var CoreStyle = require('./CoreStyle.js');
var NavigationBar = require('./NavigationBar.js');
var Camera = require('react-native-camera');
//var Camera=React.createClass({render:function() {return <View />;}});
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
      imageTaken: false
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
    var content;
    if (this.state.imageTaken) {
      return (
        <View style={styles.contentContainer}>
          <Text>Saving image...</Text>
        </View>);
    } else {
      return (
        <View style={styles.contentContainer}>
          <Camera
            ref="cam"
            style={styles.cameraView}
          />
          <TouchableOpacity onPress={() => this.props.navigator.pop()}>
            <View style={styles.closeButton}>
              <Text style={{fontSize: 40, color: 'white'}}>{'\u00D7'}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.bottomRow}>
            <View style={styles.dummy} />
            <TouchableOpacity activeOpacity={0.7} onPress={this.takePicture}>
              <View style={styles.takeButton}>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.flipButton} onPress={() => this.refs.cam.switch()}>
              <Image resizeMode="contain" style={styles.flipButtonImage} source={require('image!cameraFlip')} />
            </TouchableOpacity>
          </View>
        </View>
        );
    }
  },
  takePicture() {
    this.setState({imageTaken: true});
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
  },
  closeButton: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 50,
    right: 20
  },
  bottomRow: {
    paddingHorizontal: 25,
    backgroundColor: 'transparent',
    position: 'absolute',
    left:0,
    right:0,
    bottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dummy: {
    width: 50,
    height: 50
  },
  takeButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: CoreStyle.colors.lightPurple
  },
  flipButtonImage: {
    width: 50,
    height: 50
  },
  flipButton: {
    width: 50,
    height: 50
  }
});

module.exports = AddPhotoView;
