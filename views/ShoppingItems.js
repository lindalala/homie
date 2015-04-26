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
  TextInput,
  ListView,
  ScrollView
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
      items: [],
      shopList: null,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      loading: true
    }
  },

  componentDidMount() {
    var self = this;
    // query for items in shopping lists
    var shopList = this.props.navigator.route.data.shopList;
    var relation = shopList.relation('items');
    var query = relation.query();
    query.find().then(function(itemsList) {
      if (itemsList.length) {

        var fetchedItems = itemsList.map(self.fetchItem);
        Promise.all(fetchedItems).then(function(items) {
          items.sort(self.compareItems);
          self.setState({
            items: items,
            shopList: shopList,
            dataSource: self.state.dataSource.cloneWithRows(items),
            loading: false
          });
        });
      } else {
        // no items found
        self.setState({shopList: shopList, loading: false});
      }
    });
  },

  compareItems(item1, item2) {
    if (item1.done) {
      if (item2.done) {
        return (item2.updatedAt - item1.updatedAt);
      } else {
        // item 1 done, item 2 not done so item 2 is earlier
        return 1;
      }
    } else {
      if (item2.done) {
        return -1;
      } else {
        return (item2.createdAt - item1.createdAt);
      }
    }
  },

  addItem(item) {
    var self = this;
    var ShopItem = Parse.Object.extend('ShoppingItem');
    var shopItem = new ShopItem();
    shopItem.set('name', item);
    shopItem.set('done', false);
    shopItem.save().then(function(newItem) {
      var author = newItem.relation('author')
      author.add(global.curUser);
      newItem.save();
      var items = self.state.shopList.relation('items');
      items.add(newItem);
      self.state.shopList.save();

      var itemInfo = {id: newItem.id,
                  name: item,
                  author: global.curUser.get('name'),
                  done: false,
                  createdAt: newItem.createdAt };
      var newItems = React.addons.update(self.state.items,{$push: [itemInfo]});
      newItems.sort(self.compareItems);
      self.setState({
       items: newItems,
       dataSource: self.state.dataSource.cloneWithRows(newItems)
      });
    });
  },

  fetchItem(item) {
    var authorRelation = item.relation('author');
    var authorQuery = authorRelation.query();
    return authorQuery.find().then(function(list) {
      var author = list[0];
      return {
        id: item.id,
        name: item.get('name'),
        done: item.get('done'),
        author: author.get('name'),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });
  },

  completeItem(itemId) {
    for (var i=0; i<this.state.items.length; i++) {
      if (this.state.items[i].id === itemId) {
        var newItem = React.addons.update(this.state.items[i], {
          done: {$set: true},
          author: {$set: global.curUser.get('name')},
          updatedAt: {$set: new Date()}
        });

        var newItems = React.addons.update(this.state.items,{$splice: [[i,1,newItem]]});
        newItems.sort(this.compareItems);
        this.setState({
          items: newItems,
          dataSource: this.state.dataSource.cloneWithRows(newItems)
        });
        break;
      }
    }
    var ShopItem = Parse.Object.extend('ShoppingItem');
    var query = new Parse.Query(ShopItem);
    query.get(itemId).then(function(item) {
      var completer = item.relation('author');
      completer.add(global.curUser);
      item.set('done', true);
      item.save();
    });
  },

  renderItemCell(item) {
    if (item.done) {
      return (<View style={styles.doneItem} key={item.id}>
                <View>
                  <Text>
                    {item.name}{'\n'}
                  </Text>
                  <Text>
                    Completed By: {item.author}
                    {moment(item.updatedAt).fromNow()}
                  </Text>
                </View>
                <Image style={styles.icon}
                       source={require('image!checked')} />
              </View>);
    } else {
      return (<TouchableOpacity onPress={() => this.completeItem(item.id)} key={item.id}>
                <View style={styles.activeItem}>
                  <View>
                    <Text>
                      {item.name}{'\n'}
                    </Text>
                    <Text>
                      Requested By: {item.author}
                      {moment(item.createdAt).fromNow()}
                    </Text>
                  </View>
                  <Image style={styles.icon}
                         source={require('image!unchecked')} />
                </View>
              </TouchableOpacity>);
    }
  },

  render() {
    if (this.state.loading) {
      return <Views.Loading />;
    } else {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              onSubmitEditing={(event) => this.addItem(event.nativeEvent.text)}
              placeholder="add new item and press enter"
            />
          </View>
          <ListView
            style={styles.itemList}
            dataSource={this.state.dataSource}
            renderRow={this.renderItemCell}/>
        </View>);
    }
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex:1
  },
  buttonText: {
    fontSize: 20,
    alignSelf: 'center'
  },
  list: {
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
  textInputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#EAEAEA',
    borderRadius: 5,
    paddingVertical: 10,
    height: 40
  },
  textInput: {
    height: 12,
    borderWidth: 0.5,
    borderColor: '#0f0f0f',
    padding: 4,
    flex: 1,
    fontSize: 13,
  },
  itemList: {
    flex:1,
    backgroundColor: '#fff',
    paddingTop: 1
  },
  icon: {
    flex: 1,
    width: 20,
    height: 20,
  },
  doneItem: {
    backgroundColor:CoreStyle.colors.palePurple,
    marginBottom: 2
  },
  activeItem: {
    backgroundColor:CoreStyle.colors.paleBlue,
    marginBottom: 2
  }
});

module.exports = ShoppingItemsView;
