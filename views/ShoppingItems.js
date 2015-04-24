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

var STATUS = {ENTER: 0, SETUP: 1};

var ShoppingItemsView = React.createClass({
  getInitialState() {
    return {
      shopList: null,
      items: [],
      renderedItems: [],
      loading: true
    }
  },

  enterList() {

  },

  renderItem(item) {
    var authorRelation = item.relation('author');
    var query = authorRelation.query();
    return query.find().then(function(list) {
      var author = list[0];
      return (
        <View style={styles.note}>
          <Text>
            {item.get('name')}{'\n'}
          </Text>
          <Text>
            Requested By: {author.get('name')} {'\n'}
            {moment(item.createdAt).fromNow()}
          </Text>
        </View>
      )
    });
  },

  componentDidMount() {
    var self = this;
    // query for items in shopping lists
    console.log("PROPPPS");
    console.log(this.props);
    var shopList = this.props.navigator.route.data.shopList;
    var relation = shopList.relation('items');
    var query = relation.query();
    query.find().then(function(itemsList) {
      if (itemsList.length) {
        var renderedItems = itemsList.map(self.renderItem);
        Promise.all(renderedItems).then(function(items) {
          self.setState({shopList: shopList,
                            items: itemsList,
                    renderedItems: items,
                          loading: false});
        });
      } else {
        // no items found
        self.setState({shopList: shopList, loading: false});
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
              {this.state.renderedItems}
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

module.exports = ShoppingItemsView;
