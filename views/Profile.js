var React = require('react-native');
var moment = require('moment');
var CoreStyle = require('./CoreStyle.js');
var {
  AsyncStorage,
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  ListView,
  ScrollView
} = React;
var {
  TextInput,
  H1,
  H2,
  Text
} = CoreStyle;

var Parse = require('parse').Parse;

// App views
var Views = {};
Views.Loading = require('./Loading.js');

var HomiesView = React.createClass({
  getInitialState() {
    return {
      userInfo: {
        id: global.curUser.id,
        name: global.curUser.get('name'),
        picture: global.curUser.get('picture')
      }
    }
  },

  render() {
    return (
      <View style={styles.contentContainer}>
        <Image source={{uri: this.state.userInfo.picture}}
               style={styles.profilePicture} />
        <Text style={styles.name}>
          {this.state.userInfo.name}
        </Text>
      </View> );
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

module.exports = HomiesView;
