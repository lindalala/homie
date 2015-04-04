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

var HomesView = React.createClass({
  saveHouse() {
    var House = Parse.Object.extend('House');
    var house = new House();

    var homies = house.relation('homies');
    homies.add(Parse.User.current());

    // house.set("playerName", "Sean Plott");
    // house.set("cheatMode", false);
  },

  joinHouse() {
    return <Views.JoinHouse user={this.props.user}/>;
  },

  render() {
    return (<View style={styles.background}>
        <View style={styles.backgroundOverlay} />
        <View style={styles.contentContainer}>
          <View>
            <Text style={styles.name}>
              Welcome {'\n'} {this.props.user.name}!
            </Text>
          </View>

          <TouchableHighlight onPress={this.createHouse}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>
                Create New House
              </Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.joinHouse}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>
                Join House
              </Text>
            </View>
          </TouchableHighlight>

        </View>
      </View>)
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundOverlay: {
    opacity: 0.85,
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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

module.exports = HomesView;
