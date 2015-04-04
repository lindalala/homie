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
Views.CreateHouse = require('./CreateHouse.js');
Views.JoinHouse = require('./JoinHouse.js');


var HomesView = React.createClass({
  getInitialState() {
    return {
      houses: null,
      curUserName: Parse.User.current().get('name')
    }
  },

  createHouse() {
    //return <Views.CreateHouse user={this.props.user}/>;
    console.log("creating...");
  },

  joinHouse() {
    console.log("joining...");
    //return <Views.JoinHouse user={this.props.user}/>;
  },

  enterHouse() {
    console.log("entering...");
    //return <Views.House user={this.props.user}/>;
  },

  makeHouse(house) {
    return (<View style={styles.container}>
              <TouchableHighlight onPress={this.enterHouse(house.id)}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>
                    {house.name}
                  </Text>
                </View>
              </TouchableHighlight>
            </View>);
  },

  renderLoadingView() {
    return (
      <View style={styles.container}>
          <Text style={styles.loading}>
            LOADING
          </Text>
      </View>
    );
  },

  renderView() {
    return (<View style={styles.background}>
        <View style={styles.backgroundOverlay} />
        <View style={styles.contentContainer}>
          <View>
            <Text style={styles.name}>
              Welcome {'\n'} {this.state.curUserName}!
            </Text>
          </View>

          <View>
            <Text style={styles.name}>
            Your Houses:
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
          <TouchableHighlight onPress={this.joinHouse}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>
                Join House
              </Text>
            </View>
          </TouchableHighlight>

        </View>
      </View>);
  },

  componentDidMount() {
    var self = this;
    // query for houses that contain Parse.User.current()
    var House = Parse.Object.extend("House");
    var houseQuery = new Parse.Query(House);
    houseQuery.equalTo('homies', Parse.User.current());
    houseQuery.find({
      success: function(homes) {
        // homes is a list of homes Parse.User.current() belongs to
        if (homes.length) {
          self.setState({houses: homes.map(makeHouse)});
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
    if (this.state.houses) {
      console.log(this.state.houses);
      return this.renderView();
    } else {
      return this.renderLoadingView();
    }
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    position: 'absolute',
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
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
  houseList: {
    position: 'absolute',
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
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
