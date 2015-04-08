var React = require('react-native');
var {
  AppRegistry,
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  TextInput
} = React;

var Parse = require('parse').Parse;

// App views
var Views = {};
Views.Home = require('./Home.js');

// Statuses
var STATUS = {CREATE: 0, ENTER: 1};

var CreateHomeView = React.createClass({
  getInitialState() {
    return {
      input: '',
      status: STATUS.CREATE,
      houseId: null
    }
  },

  saveHouse() {
    var House = Parse.Object.extend('House');
    var house = new House();

    house.set('name', this.state.input);

    var self = this;
    house.save().then(function(house) {
      // house saved successfully.
    }, function(error) {
      // the save failed.
      alert('Failed to create new object, with error code: ' + error.message);
    }).then(function() {
      self.setState({status: STATUS.ENTER, houseId: house.id});
      console.log(Parse.User.current());
      var homies = house.relation('homies');
      homies.add(global.curUser);
      house.save();
    });
  },

  renderView() {
    return (<View style={styles.background}>
        <View style={styles.backgroundOverlay} />
        <View style={styles.contentContainer}>
          <View>
            <Text style={styles.name}>
              Enter House Name
            </Text>
          </View>

          <TextInput
            autoFocus={true} style={styles.textInput}
            onSubmitEditing={(text) => this.setState({input: text.nativeEvent.text})}
            placeholder="enter house name"
          />
          <TouchableHighlight onPress={this.saveHouse}>
            <View style={styles.loginButton}>
              <Text style={styles.buttonText}>
                Create House
              </Text>
            </View>
          </TouchableHighlight>

        </View>
      </View>)
  },

  render() {
    if (this.state.status === STATUS.CREATE) {
      return this.renderView();
    } else if (this.state.status === STATUS.ENTER) {
      return <Views.Home houseId={this.state.houseId}/>;
    } else {
      console.error("Error: STATUS unknown");
    }
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
  textInput: {
    height: 26,
    borderWidth: 0.5,
    borderColor: '#0f0f0f',
    padding: 4,
    flex: 1,
    fontSize: 13,
  }
});

module.exports = CreateHomeView;
