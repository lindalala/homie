var React = require('react-native');
var CoreStyle = require('./CoreStyle.js');
var {
  AppRegistry,
  AsyncStorage,
  StyleSheet,
  View,
  TouchableHighlight,
  Image
} = React;
var {
  Text
} = CoreStyle;

var Parse = require('parse').Parse;

// App views
var Views = {};
Views.CreateHome = require('./CreateHome.js');
Views.JoinHome = require('./JoinHome.js');
Views.Home = require('./Home.js');

var HomesView = React.createClass({
  getInitialState() {
    return {
      houses: null,
      curUserName: Parse.User.current().get('name'),
      selectedHouseId: null,
    }
  },

  createHouse() {
    // Navigate to CreateHome view
    this.props.navigator.push({
      title: 'Create Home',
      component: Views.CreateHome
    });
  },

  joinHouse() {
    // Navigate to JoinHome view
    this.props.navigator.push({
      title: 'Join Home',
      component: Views.JoinHome
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

  makeHouse(house) {
    return (<TouchableHighlight onPress={this.enterHouse.bind(this, house.get('name'), house.id)}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>
                    {house.get('name')}
                  </Text>
                </View>
              </TouchableHighlight>
            )
  },

  componentDidMount() {
    var self = this;
    // query for houses that contain Parse.User.current()
    var House = Parse.Object.extend('House');
    var houseQuery = new Parse.Query(House);
    houseQuery.equalTo('homies', Parse.User.current());
    houseQuery.find({
      success: function(homes) {
        // homes is a list of homes Parse.User.current() belongs to
        if (homes.length) {
          self.setState({houses: homes.map(self.makeHouse)});
        } else {
          // Parse.User.current() not currently in house
          self.setState({houses: (<View style={styles.container}>
                                      <Text style={styles.loading}>
                                        NO HOUSES YET
                                      </Text>
                                  </View>)});
        }
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  },

  render() {
    return (
      <View style={styles.background}>
        <View style={styles.backgroundOverlay} />
        <View style={styles.contentContainer}>
          <View>
            <Text style={styles.name}>
              Welcome {'\n'} {this.state.curUserName}!
            </Text>
          </View>

          <View>
            <Text style={styles.name}>
            Your Homes:
            </Text>
            <View style={styles.houseList}>
              {this.state.houses}
            </View>
          </View>

          <TouchableHighlight onPress={this.createHouse}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>
                Create New House
              </Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.joinHouse} activeOpacity={0.9} underlayColor="rgba(0,0,0,0.1)">
            <View style={styles.button}>
              <Text style={styles.buttonText}>
                Join House
              </Text>
            </View>
          </TouchableHighlight>

        </View>
      </View>);
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  loading: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
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
});

module.exports = HomesView;
