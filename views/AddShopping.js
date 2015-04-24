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
Views.Home = require('./Home.js');

var STATUS = {ENTER: 0, SETUP: 1};

var AddShoppingView = React.createClass({
  getInitialState() {
    return {
      inputTitle: null,
      inputText: null,
      inputItems: [],
      noteAdded: null,
      items: []
    }
  },

  addList() {
    var ShopList = Parse.Object.extend('ShoppingList');
    var shopList = new ShopList();

    shopList.set('title', this.state.inputTitle);

    var self = this;
    shopList.save().then(function(list) {
      var items = list.relation('items');
      var house = list.relation('house');
      items.add(self.state.items);
      house.add(global.curHouse);
      shopList.save();
    }).then(function() {
      self.props.navigator.pop();
    });
  },

  addItem() {
    var self = this;
    var ShopItem = Parse.Object.extend('ShoppingItem');
    var shopItem = new ShopItem();
    shopItem.set('name', this.state.inputText);
    shopItem.save().then(function(item) {
      var author = item.relation('author')
      author.add(global.curUser);
      item.save();
      var inputItemsCopy = self.state.inputItems;
      inputItemsCopy.push(self.state.inputText);
      self.state.items.push(item);
      alert(inputItemsCopy);
      self.setState({
        inputItems: inputItemsCopy,
        inputText: null
      });
    });
  },

  renderView() {
    return (
      <View style={styles.background}>
        <View style={styles.backgroundOverlay} />
        <View style={styles.contentContainer}>
          <View style={styles.fieldContents}>
            <View style={styles.titleTextInput}>
              <TextInput
                style={styles.textInput}
                onChange={(text) => this.setState({inputTitle: text.nativeEvent.text})}
                placeholder="title"
              />
            </View>

            <View style={styles.itemTextInput}>
              <TextInput
                style={styles.textInput}
                onChange={(text) => this.setState({inputText: text.nativeEvent.text})}
                placeholder="enter Item"
              />
            <TouchableOpacity onPress={this.addItem}>
                  <View style={styles.loginButton}>
                    <Text style={styles.buttonText}>
                      Add Item
                    </Text>
                  </View>
                </TouchableOpacity>
            </View>
          </View>
          <Text> HELLO {this.state.inputItems} </Text>
          <TouchableOpacity onPress={this.addList}>
            <View style={styles.loginButton}>
              <Text style={styles.buttonText}>
                Post Note
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>);
  },

  render() {
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
  fieldContents: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 50,
    marginVertical: 100,
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 3,
    paddingVertical: 0,
  },
  background: {
    flex: 1
  },
  backgroundOverlay: {
    opacity: 0.85,
    backgroundColor: '#ffffff'
  },
  titleTextInput: {
    flex: 1,
  },
  itemTextInput: {
    flex: 1,
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
    height: 100,
    width: 100,
    padding: 4,
    flex: 1
  }
});

module.exports = AddShoppingView;
