var React = require('react-native');
var CoreStyle = require('./CoreStyle.js');
var {
  AppRegistry,
  AsyncStorage,
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  ScrollView
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

var STATUS = {ENTER: 0, SETUP: 1};

var AddNoteView = React.createClass({
  getInitialState() {
    return {
      inputTitle: null,
      inputText: null,
      noteAdded: null
    }
  },

  addNote() {
    var Note = Parse.Object.extend('Note');
    var note = new Note();

    note.set('title', this.state.inputTitle);
    note.set('content', this.state.inputText);

    var self = this;
    note.save().then(function(note) {
      // house saved successfully.
      var house = note.relation('house');
      var author = note.relation('author');
      house.add(global.curHouse);
      author.add(global.curUser);
      return note.save();
    }, function(error) {
      // the save failed.
      alert('Failed to create new object, with error code: ' + error.message);
    }).then(function() {
      self.props.route.callPrevView();
      self.props.navigator.pop();
    });
  },

  renderView() {
    return (
      <View style={{flex:1}}>
        <Image source={require('image!housesBg')} style={styles.bgImage} />
        <ScrollView style={styles.contentContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              onChange={(text) => this.setState({inputTitle: text.nativeEvent.text})}
              placeholder="note title"
            />
            <TextInput
              style={styles.noteInput}
              onChange={(text) => this.setState({inputText: text.nativeEvent.text})}
              placeholder="type note here"
              multiline={true}
            />
          </View>
          <Button onPress={this.addNote} text="post note" />
        </ScrollView>
      </View>
    );
  },

  render() {
    return this.renderView();
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex:1,
    paddingHorizontal: 25,
    backgroundColor: 'transparent'
  },
  textInputContainer: {
    flexDirection: 'column',
    flex: 1,
    marginTop: 30,
    paddingVertical: 10,
    backgroundColor: 'transparent'
  },
  noteInput: {
    marginTop: 10,
    height: 150
  },
  bgImage: {
    position: 'absolute',
    bottom: 0,
    left:0,
    right:0,
    height: 200
  }
});

module.exports = AddNoteView;
