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
  Text
} = CoreStyle;

var Parse = require('parse').Parse;

// App views
var Views = {};
Views.AppNavigator = require('./AppNavigator.js');

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
      // house saved successfully.
    }, function(error) {
      // the save failed.
      alert('Failed to create new object, with error code: ' + error.message);
    }).then(function() {
      self.setState({status: STATUS.ENTER, houseId: house.id});
      var homies = house.relation('homies');
      homies.add(global.curUser);
      house.save();
    }).then(function(){
      var defaultHouse = global.curUser.relation('defaultHouse');
      defaultHouse.add(house);
      global.curUser.save();
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
        var defaultHouse = global.curUser.relation('defaultHouse');
        defaultHouse.add(house);

        global.curUser.save().then(function() {
          house.save().then(function() {
            self.setState({status: STATUS.ENTER, houseId: house.id});
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

  enterHouse(name, id) {
    // Navigate to Home view
    this.props.navigator.push({
      navBar: true,
      title: name,
      component: Views.Home,
      data: {houseId: id}
    });
  },

  renderView() {
    return (
      <View style={styles.background}>
        <View style={styles.backgroundOverlay} />
        <View style={styles.contentContainer}>
          <View style={styles.buttonContents}>
            <Text>
              Create House
            </Text>
            <TextInput
              style={styles.textInput}
              onSubmitEditing={(text) => this.setState({input: text.nativeEvent.text})}
              placeholder="enter house name"
            />
          <TouchableOpacity onPress={this.createHouse}>
              <View style={styles.loginButton}>
                <Text style={styles.buttonText}>
                  Enter House
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContents}>
            <Text>
              Join House
            </Text>
            <TextInput
              style={styles.textInput}
              onSubmitEditing={(text) => this.setState({input: text.nativeEvent.text})}
              placeholder="enter house id"
            />
          <TouchableOpacity onPress={this.joinHouse}>
              <View style={styles.loginButton}>
                <Text style={styles.buttonText}>
                  Enter House
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>);
  },

  render() {
    if (this.state.status === STATUS.ENTER) {
      return <Views.AppNavigator />;
    } else {
      return this.renderView();
    }
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

module.exports = SetupView;
