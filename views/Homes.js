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
Views.CreateHome = require('./CreateHome.js');
Views.JoinHome = require('./JoinHome.js');
Views.Home = require('./Home.js');

// Statuses
var STATUS = {CREATE: 0, JOIN: 1, ENTER: 2, HOMES: 3};

var HomesView = React.createClass({
  getInitialState() {
    return {
      status: STATUS.HOMES,
      houses: null,
      curUserName: Parse.User.current().get('name'),
      selectedHouseId: null
    }
  },

  createHouse() {
    this.setState({status: STATUS.CREATE});
  },

  joinHouse() {
    console.log("joining...");
    //return <Views.JoinHouse user={this.props.user}/>;
  },

  enterHouse(id) {
    this.setState({status: STATUS.ENTER, selectedHouseId: id});
  },

  makeHouse(house) {
    return (<TouchableHighlight onPress={this.enterHouse.bind(this, house.id)}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>
                    {house.get('name')}
                  </Text>
                </View>
              </TouchableHighlight>
            )
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
    if (this.state.status === STATUS.HOMES) {
      return this.renderView();
    } else if (this.state.status === STATUS.CREATE) {
      return <Views.CreateHome/>;
    } else if (this.state.status === STATUS.ENTER) {
      return <Views.Home houseId={this.state.selectedHouseId}/>;
    } else {
      console.error("Error: STATUS unknown");
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
