var React = require('react-native');
var moment = require('moment');
var CoreStyle = require('./CoreStyle.js');
var {
  ActivityIndicatorIOS,
  AsyncStorage,
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  ListView
} = React;
var {
  H1,
  H2,
  Text,
  CustomPlusButton
} = CoreStyle;

var Parse = require('parse').Parse;

// App views
var Views = {
  Loading: require('./Loading.js')
};

var STATUS = {ENTER: 0, SETUP: 1};

var HomesView = React.createClass({
  getInitialState() {
    return {
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      loading: true
    }
  },

  componentDidMount() {
    this.fetchData();
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

  enterHouse(houseToEnter) {
    var House = Parse.Object.extend('House');
    var query = new Parse.Query(House);

    var self = this;
    query.get(houseToEnter.id, {
      success: function(house) {
        // The object was retrieved successfully.
        self.storeDefault(house);
        self.props.navigator.immediatelyResetRouteStack([{
          navBar: true,
          title: house.get('name'),
          component: require('./Home.js'),
          hidePrev: true,
          data: {houseId: house.id}
        }]);
      },
      error: function(object, error) {
        console.error(error.message);
      }
    });
  },

  fetchHouse(house) {
    var homieRelation = house.relation('homies');
    var query = homieRelation.query();
    return query.find().then(function(list) {
      var homies = list.filter(function(hm) {
                                return (hm.id !== global.curUser.id);
                              }).map(function(hm) {
                                return (hm.get('firstName'));
                              });
      var isCurHouse = false;
      if (house.id === curHouse.id) {
        isCurHouse = true;
      }
      return {
        id: house.id,
        title: house.get('name'),
        homies: homies,
        isCurHouse: isCurHouse
      };
    });
  },

  fetchData() {
    // Set loading back to true, in case it is a refresh call
    this.setState({loading: true});

    var self = this;
    // query for curUser's houses
    var House = Parse.Object.extend('House');
    var query = new Parse.Query(House);
    query.equalTo('homies', global.curUser);
    query.find({
      success: function(houses) {
        // houses is a list of curUser's houses
        if (houses.length) {
          var fetchedHouses = houses.map(self.fetchHouse);
          Promise.all(fetchedHouses).then(function(houses) {
            houses.sort(function(h1, h2) {return (h1.isCurHouse) ? -1 : 1;});
            self.setState({
              dataSource: self.state.dataSource.cloneWithRows(houses),
              loading: false
            });
          });
        } else {
          // no hosues found
          self.setState({loading: false});
        }
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  },

  renderHouseCell(house) {
    var displayedHomies = house.homies.slice(0,5).join(', ');
    var numRest = house.homies.slice(5).length;
    var homies = (numRest) ? displayedHomies + ' and ' + numRest + ' more' : displayedHomies;
    return (
      <TouchableOpacity onPress={() => this.enterHouse(house)}>
        <View style={styles.house}>
          <H1 style={{marginBottom: 5}}>{house.title}</H1>
            <View style={styles.namesRow}>
              <Image style={styles.icon} source={require('image!group')} resizeMode="contain" />
              <H2 style={{paddingLeft: 5}}> {homies} </H2>
            </View>
        </View>
      </TouchableOpacity>
    );
  },

  render() {
    var content = this.state.loading ?
                    <Views.Loading /> :
                    (<ListView
                      style={styles.houseList}
                      dataSource={this.state.dataSource}
                      renderRow={this.renderHouseCell}/>);

    return (
      <View style={styles.contentContainer}>
        {content}
      </View>);
  }
});


var styles = StyleSheet.create({
  contentContainer: {
    flex:1
  },
  houseList: {
    flex:1,
    backgroundColor: CoreStyle.colors.background,
    paddingTop: 1
  },
  house: {
    backgroundColor: CoreStyle.colors.paleBlue,
    marginTop: 1,
    marginBottom: 1,
    padding: 25
  },
  namesRow: {
    flexDirection: 'row'
  },
  icon: {
    height: 15,
    width: 15
  }
});

module.exports = HomesView;
