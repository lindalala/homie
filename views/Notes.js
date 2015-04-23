var React = require('react-native');
var CoreStyle = require('./CoreStyle.js');
var {
  AsyncStorage,
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Image
} = React;
var {
  Text
} = CoreStyle;

var Parse = require('parse').Parse;

// App views
var Views = {};
Views.Home = require('./Home.js');

var STATUS = {ENTER: 0, SETUP: 1};

var NotesView = React.createClass({
  getInitialState() {
    return {
      input: null,
      status: STATUS.SETUP,
    }
  },

  renderView() {
    return (
      <View style={styles.background}>
        <View style={styles.backgroundOverlay} />
        <View style={styles.contentContainer}>
          <Text style={styles.buttonText}>
            LOADING
          </Text>
        </View>
      </View>);
  },

  render() {
    return this.renderView();
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex:1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  buttonContents: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
    marginVertical: 40,
    padding: 5,
    backgroundColor: '#EAEAEA',
    borderRadius: 3,
    paddingVertical: 10,
  },
  background: {
    flex: 1
  },
  backgroundOverlay: {
    opacity: 0.85,
    backgroundColor: '#ffffff'
  },
  buttonText: {
    fontSize: 20,
    alignSelf: 'center'
  },
  houseList: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  name: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    marginTop: 15,
    alignSelf: 'center',
  },
  textInput: {
    height: 5,
    borderWidth: 0.5,
    borderColor: '#0f0f0f',
    padding: 4,
    flex: 1,
    fontSize: 13,
  }
});

module.exports = NotesView;
