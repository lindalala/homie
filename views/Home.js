var React = require('react-native');
var {
  AppRegistry,
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image
} = React;

var Parse = require('parse').Parse;

// App views
var Views = {};

var HomeView = React.createClass({
  getInitialState() {
    return {

    }
  },

  render() {
    return (<View style={styles.background}>
        <View style={styles.backgroundOverlay} />
        <View style={styles.contentContainer}>
          <View>
            <Text style={styles.name}>
              Invite your homies with your house ID:
              {'\n'} {this.props.route.data.houseId}
            </Text>
          </View>
        </View>
      </View>)
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  backgroundOverlay: {
    opacity: 0.85,
    backgroundColor: '#ffffff',
  },
  background: {
    flex: 1
  },
  name: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    marginTop: 15,
    alignSelf: 'center',
  },
});

module.exports = HomeView;
