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
  ListView,
  ScrollView
} = React;
var {
  TextInput,
  H1,
  H2,
  Text
} = CoreStyle;

var Parse = require('parse').Parse;

// App views
var Views = {};
Views.Loading = require('./Loading.js');

var STATUS = {ENTER: 0, SETUP: 1};

var ShoppingItemsView = React.createClass({
  getInitialState() {
    return {
      items: [],
      shopList: null,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      loading: true,
      newItemText: ''
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
        return (item2.updatedAt - item1.updatedAt);
      }
    }
  },

  addItem() {
    var item = this.state.newItemText;

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
                  updatedAt: newItem.updatedAt };
      var newItems = React.addons.update(self.state.items,{$push: [itemInfo]});
      newItems.sort(self.compareItems);
      self.setState({
       items: newItems,
       dataSource: self.state.dataSource.cloneWithRows(newItems),
       newItemText: ''
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
    var icon = item.done ? require('image!checked') : require('image!unchecked');
    var byText = item.done ? 'bought by' : 'requested by';
    var bgColor = item.done ? CoreStyle.colors.palePurple : CoreStyle.colors.paleBlue;

    var rowContents = (
      <View style={[styles.listItem, {backgroundColor: bgColor}]}>
        <View>
          <H1 style={{marginBottom: 10}}>{item.name}</H1>
          <H2>
            <H2 style={{fontFamily: 'MetaPro'}}>{byText}</H2> {item.author} -
            <H2 style={{fontFamily: 'MetaPro'}}> {moment(item.updatedAt).fromNow()}</H2>
          </H2>
        </View>
        <Image style={styles.icon} source={icon} resizeMode="contain" />
      </View>);

    var output;

    if (item.done) {
      return rowContents;
    } else {
      return (
        <TouchableOpacity activeOpacity={0.6} onPress={() => this.completeItem(item.id)} key={item.id}>
          {rowContents}
        </TouchableOpacity>)
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
              value={this.state.newItemText}
              onChangeText={(text) => this.setState({newItemText: text})}
              onSubmitEditing={this.addItem}
              placeholder="Add new item and press enter..."
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
    padding: 10
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginBottom: 2
  },
  itemList: {
    flex:1,
    backgroundColor: '#fff',
    paddingTop: 1
  },
  icon: {
    width: 30,
    height: 30
  }
});

module.exports = ShoppingItemsView;
