var React = require('react-native');
var CoreStyle = require('./CoreStyle.js');
var {
  AppRegistry,
  AsyncStorage,
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableOpacity,
  TextInput,
  Image
} = React;
var {
  Text,
  H2,
  Button,
  TextInput
} = CoreStyle;

var Parse = require('parse').Parse;

var STATUS = {ENTER: 0, SETUP: 1};

var SetupView = React.createClass({
  getInitialState() {
    return {
      input: null,
      status: STATUS.SETUP,
    }
  },

  createHouse() {
    var House = Parse.Object.extend('House');
    var house = new House();

    house.set('name', this.state.input);

    var self = this;
    house.save().then(function(house) {
      var homies = house.relation('homies');
      homies.add(global.curUser);
      house.save().then(function(house) {
        self.storeDefault(house);
        self.props.navigator.immediatelyResetRouteStack([{
          navBar: true,
          title: house.get('name'),
          component: require('./Home.js'),
          hidePrev: true,
          data: {houseId: house.id}
        }]);
      });
    });
  },

  joinHouse() {
    var House = Parse.Object.extend('House');
    var query = new Parse.Query(House);

    var self = this;
    query.get(this.state.input, {
      success: function(house) {
        // The object was retrieved successfully.
        var homies = house.relation('homies');
        homies.add(global.curUser);

        global.curUser.save().then(function() {
          house.save().then(function() {
            self.storeDefault(house);
            self.props.navigator.immediatelyResetRouteStack([{
              navBar: true,
              title: house.get('name'),
              component: require('./Home.js'),
              hidePrev: true,
              data: {houseId: house.id}
            }]);
          });
        });
      },
      error: function(object, error) {
        // The object was not retrieved successfully.
        // error is a Parse.Error with an error code and message.
        alert('Invalid ID');
      }
    });
  },

  storeDefault(house) {
    AsyncStorage.setItem("@Homie:defaultHouse", house.id, (error) => {
      if (error) {
        self._appendMessage('AsyncStorage error: ' + error.message);
      } else {
        // sucessfully stored user data to disk
        global.curHouse = house;
      }
    });
  },

  renderView() {
    return (
      <View style={styles.background}>
        <View style={styles.backgroundOverlay} />
        <View style={styles.contentContainer}>
          <View style={styles.buttonContents}>
            <TextInput
              style={styles.textInput}
              onSubmitEditing={(text) => this.setState({input: text.nativeEvent.text})}
              placeholder="Home Name"
            />
            <Button onPress={this.createHouse}>
                  build home
            </Button>
          </View>

          <H2>- or -</H2>

          <View style={styles.buttonContents}>
            <TextInput
              style={styles.textInput}
              onSubmitEditing={(text) => this.setState({input: text.nativeEvent.text})}
              placeholder="Home ID"
            />
            <Button onPress={this.joinHouse}>
              enter home
            </Button>
          </View>
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
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 150
  },
  buttonContents: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
    marginVertical: 40,
    padding: 5,
    backgroundColor: 'transparent',
    borderRadius: 3,
    paddingVertical: 10,
    height: 150
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
    marginBottom: 5,
    borderWidth: 1
  }
});

module.exports = SetupView;
