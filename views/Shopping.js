var React = require('react-native');
var moment = require('moment');
var CoreStyle = require('./CoreStyle.js');
var {
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
var NavigationBar = require('./NavigationBar.js');

// App views
var Views = {
  Loading: require('./Loading.js'),
  ShoppingItems: require('./ShoppingItems.js'),
  AddShopping: require('./AddShopping.js')
};

var STATUS = {ENTER: 0, SETUP: 1};

var ShoppingView = React.createClass({
  getInitialState() {
    return {
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
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

  componentDidMount() {
    this.fetchData();
  },

  fetchList(list) {
    var itemRel = list.relation('items');
    var query = itemRel.query();
    return query.find().then(function(items) {
      var numItems = items.length;
      return {
        title: list.get('title'),
        numItems: items.length,
        parseObj: list
      };
    });
  },

  fetchData() {
    // Set loading back to true, in case it is a refresh call
    this.setState({loading: true});

    var self = this;
    // query for shopping lists that are in current house
    var ShopList = Parse.Object.extend('ShoppingList');
    var shopQ = new Parse.Query(ShopList);
    shopQ.equalTo('house', global.curHouse);
    shopQ.find({
      success: function(lists) {
        // lists is a list of shopping lists in curHouse
        if (lists.length) {
          var fetchedLists = lists.map(self.fetchList);
          Promise.all(fetchedLists).then(function(lists) {
            self.setState({
              dataSource: self.state.dataSource.cloneWithRows(lists),
              loading: false
              });
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

  renderShoppingListCell(list) {
    return (<ListCell title={list.title}
                      numItems={list.numItems}
                      onPress={() => this.enterList(list.parseObj)} />);
  },

  render() {
    var content = this.state.loading ?
                    <Views.Loading /> :
                    (<ListView
                      style={styles.shoppingList}
                      dataSource={this.state.dataSource}
                      renderRow={this.renderShoppingListCell}/>);

    return (
      <View style={styles.contentContainer}>
        <NavigationBar navigator={this.props.navigator}
                                backgroundColor={CoreStyle.colors.lightPurple}
                                customNext={<CustomPlusButton plusView={Views.AddShopping} title={'Add Shopping List'} callPrevView={this.fetchData} />}
                                title="Shopping Lists"
                                titleColor={CoreStyle.colors.mediumBlue} />
        {content}
      </View>);
  }
});

var ListCell = React.createClass({
  render() {
    return (
      <TouchableOpacity activeOpacity={0.6} onPress={this.props.onPress}>
        <View style={styles.listItem}>
          <H1 style={{marginBottom: 5}}>{this.props.title}</H1>
          <H2>{this.props.numItems} <H2 style={{fontFamily: 'MetaPro'}}>Items</H2></H2>
        </View>
      </TouchableOpacity>);
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex:1
  },
  list: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },
  shoppingList: {
    flex:1,
    backgroundColor: CoreStyle.colors.background,
    paddingTop: 1
  },
  listItem: {
    backgroundColor: CoreStyle.colors.paleBlue,
    marginTop: 1,
    marginBottom: 1,
    padding: 25
  }
});

module.exports = ShoppingView;
