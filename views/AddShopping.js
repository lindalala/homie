var React = require('react-native');
var CoreStyle = require('./CoreStyle.js');
var {
  AppRegistry,
  StyleSheet,
  View,
  Image
} = React;
var {
  Button,
  TextInput,
  Text
} = CoreStyle;

var Parse = require('parse').Parse;

// App views
var Views = {};
Views.Home = require('./Home.js');

var AddShoppingView = React.createClass({
  getInitialState() {
    return {
      inputTitle: null
    }
  },

  addList() {
    var ShopList = Parse.Object.extend('ShoppingList');
    var shopList = new ShopList();

    shopList.set('title', this.state.inputTitle);

    var self = this;
    shopList.save().then(function(list) {
      var house = list.relation('house');
      house.add(global.curHouse);
      shopList.save();
    }).then(function() {
      self.props.navigator.pop();
    });
  },

  renderView() {
    return (
      <View style={{flex:1}}>
        <Image source={require('image!housesBg')} style={styles.bgImage} />
        <View style={styles.fieldContents}>
          <TextInput
            style={styles.textInput}
            onChange={(text) => this.setState({inputTitle: text.nativeEvent.text})}
            placeholder="title"
          />
          <Button onPress={this.addList} text="create list" />
        </View>
      </View>);
  },

  render() {
    return this.renderView();
  }
});

var styles = StyleSheet.create({
  fieldContents: {
    flexDirection: 'column',
    marginTop: 50,
    padding: 20,
    backgroundColor: 'transparent',
    borderRadius: 3,
    paddingVertical: 0,
  },
  textInput: {
    marginBottom: 20
  },
  bgImage: {
    position: 'absolute',
    bottom: 0,
    left:0,
    right:0,
    height: 200
  }
});

module.exports = AddShoppingView;
