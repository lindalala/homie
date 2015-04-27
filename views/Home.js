var React = require('react-native');
var CoreStyle = require('./CoreStyle.js');
var {
  AppRegistry,
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Navigator
} = React;
var {
  CustomPrevButton,
  CustomPlusButton
} = CoreStyle;

var Parse = require('parse').Parse;

// App views
var Views = {
  Notes: require('./Notes.js'),
  Bills: require('./Bills.js'),
  AddBill: require('./AddBill.js'),
  Shopping: require('./Shopping.js'),
  AddShopping: require('./AddShopping.js'),
  Chores: require('./Chores.js'),
  Messages: require('./Messages.js'),
  Settings: require('./Settings.js'),
  Photos: require('./Photos.js')
};

var HomeView = React.createClass({
  notesPressed() {
    this.props.navigator.push({component: Views.Notes});
  },

  billsPressed() {
    this.props.navigator.push({component: Views.Bills});
  },

  shoppingPressed() {
    this.props.navigator.push({component: Views.Shopping});
  },

  choresPressed() {
    this.props.navigator.push({
      navBar: true,
      title: 'Chores',
      component: Views.Chores,
      hidePrev: false
    });
  },

  msgsPressed() {
    this.props.navigator.push({
      navBar: true,
      title: 'Messages',
      component: Views.Messages,
      hidePrev: false
    });
  },

  settingsPressed() {
    this.props.navigator.push({
      navBar: true,
      title: 'Settings',
      component: Views.Settings,
      hidePrev: false
    });
  },

  photosPressed() {
    this.props.navigator.push({component: Views.Photos});
  },

  render() {
    return (
      <View style={styles.contentContainer}>
        <Image style={styles.fridgebg} source={require('image!fridgebg')} />

        <View style={[styles.fridgeSections, styles.fridgeTop]}>
          <TouchableOpacity onPress={this.notesPressed}>
            <Image
              style={styles.button}
              resizeMode={Image.resizeMode.contain}
              source={require('image!notes')}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.billsPressed}>
            <Image
              style={styles.button}
              resizeMode={Image.resizeMode.contain}
              source={require('image!money')}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.shoppingPressed}>
            <Image
              style={[styles.button, {margin: 0}]}
              resizeMode={Image.resizeMode.contain}
              source={require('image!shopping')}
            />
          </TouchableOpacity>

        </View>
        <View style={[styles.fridgeSections, styles.fridgeBottom]}>
          <TouchableOpacity onPress={this.choresPressed}>
            <Image
              style={styles.button}
              resizeMode={Image.resizeMode.contain}
              source={require('image!chores')}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.settingsPressed}>
            <Image
              style={styles.button}
              resizeMode={Image.resizeMode.contain}
              source={require('image!settings')}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.photosPressed}>
            <Image
              style={styles.button}
              resizeMode={Image.resizeMode.contain}
              source={require('image!photos')}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.msgsPressed}>
            <Image
              style={styles.button}
              resizeMode={Image.resizeMode.contain}
              source={require('image!messages')}
            />
          </TouchableOpacity>
        </View>
      </View>)
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch'
  },
  button: {
    width: 75,
    height: 75,
    margin: 15
  },
  fridgebg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  fridgeSections: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 50,
    backgroundColor: 'transparent'
  },
  fridgeTop: {
    paddingTop: 15,
    flex: 2
  },
  fridgeBottom: {
    flex: 3
  }
});

module.exports = HomeView;
