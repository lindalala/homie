var React = require('react-native');
var {
  AppRegistry,
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  NavigatorIOS
} = React;

var Parse = require('parse').Parse;

// App views
var Views = {};
Views.Homes = require('./Homes.js');

var AppNavigatorView = React.createClass({
  getInitialState() {
    return {

    }
  },

  render() {
    return (<NavigatorIOS
             style={styles.container}
             initialRoute={{
               component: Views.Homes,
               title: 'Homes',
             }} />);
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6EF'
  }
});

module.exports = AppNavigatorView;
