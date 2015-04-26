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
var Views = {};
Views.Notes = require('./Notes.js');
Views.AddNote = require('./AddNote.js');
Views.Bills = require('./Bills.js');
Views.AddBill = require('./AddBill.js');
Views.Shopping = require('./Shopping.js');
Views.AddShopping = require('./AddShopping.js');

var HomeView = React.createClass({
  getInitialState() {
    return {

    }
  },

  notesPressed() {
    this.props.navigator.push({
      navBar: true,
      title: 'Notes',
      component: Views.Notes,
      hidePrev: false,
      customNext: <CustomPlusButton plusView={Views.AddNote} title={'Add Note'}/>,
    });
  },

  billsPressed() {
    this.props.navigator.push({
      navBar: true,
      title: 'Bills',
      component: Views.Bills,
      hidePrev: false,
      customNext: <CustomPlusButton plusView={Views.AddBill} title={'Add Bill'}/>,
    });
  },

  shoppingPressed() {
    this.props.navigator.push({
      navBar: true,
      title: 'Shopping Lists',
      component: Views.Shopping,
      hidePrev: false,
      customNext: <CustomPlusButton plusView={Views.AddShopping} title={'Add Shopping List'}/>,
    });
  },

  render() {
    return (<View style={styles.contentContainer}>
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
              source={require('image!notes')}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.shoppingPressed}>
            <Image
              style={styles.button}
              resizeMode={Image.resizeMode.contain}
              source={require('image!shopping')}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.choresPressed}>
            <Image
              style={styles.button}
              resizeMode={Image.resizeMode.contain}
              source={require('image!chores')}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.notesPressed}>
            <Image
              style={styles.button}
              resizeMode={Image.resizeMode.contain}
              source={require('image!settings')}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.notesPressed}>
            <Image
              style={styles.button}
              resizeMode={Image.resizeMode.contain}
              source={require('image!photos')}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.notesPressed}>
            <Image
              style={styles.button}
              resizeMode={Image.resizeMode.contain}
              source={require('image!messages')}
            />
          </TouchableOpacity>
        </View>)
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    flex: 1,
    width: 40,
    height: 40,
  }
});

module.exports = HomeView;
