var React = require('react-native');
var moment = require('moment');
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
Views.Loading = require('./Loading.js');
Views.ShoppingItems = require('./ShoppingItems.js');

var STATUS = {ENTER: 0, SETUP: 1};

var ShoppingView = React.createClass({
  getInitialState() {
    return {
      lists: null,
      loading: true
    }
  },

  enterList(shopList) {
    this.props.navigator.push({
      navBar: true,
      title: shopList.get('title'),
      component: Views.ShoppingItems,
      data: {shopList: shopList},
      hidePrev: false,
    });
  },

  renderList(shopList) {
    var self = this;
    var itemRel = shopList.relation('items');
    var query = itemRel.query();
    return query.find().then(function(items) {
      var numItems = items.length;
      return (
        <TouchableOpacity onPress={self.enterList.bind(null, shopList)}>
          <View style={styles.list}>
            <Text>
              {shopList.get('title')}{'\n'}
            </Text>
            <Text>
              {numItems} Items
            </Text>
          </View>
        </TouchableOpacity>
      )
    });
  },

  componentDidMount() {
    var self = this;
    // query for shopping lists that are in current house
    var ShopList = Parse.Object.extend('ShoppingList');
    var shopQ = new Parse.Query(ShopList);
    shopQ.equalTo('house', global.curHouse);
    shopQ.find({
      success: function(lists) {
        // lists is a list of shopping lists in curHouse
        if (lists.length) {
          var renderedLists = lists.map(self.renderList);
          Promise.all(renderedLists).then(function(lists) {
            self.setState({lists: lists, loading: false});
          });
        } else {
          // no notes found
          self.setState({lists: [], loading: false});
        }
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  },

  componentWillReceiveProps() {
    alert('I will refreshed');
  },

  renderView() {
    return (
      <View style={styles.background}>
        <View style={styles.backgroundOverlay} />
        <View style={styles.contentContainer}>
          <View>
            <View style={styles.houseList}>
              {this.state.lists}
            </View>
          </View>
        </View>
      </View>);
  },

  render() {
    if (this.state.loading) {
      return (<View style={styles.background}>
                <View style={styles.backgroundOverlay} />
                <View style={styles.contentContainer}>
                  <Text>
                    LOADING
                  </Text>
                </View>
              </View>);
    }
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
  list: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
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

module.exports = ShoppingView;
