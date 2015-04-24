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
    }, function(error) {
      // the save failed.
      alert('Failed to create new object, with error code: ' + error.message);
    }).then(function() {
      var house = note.relation('house');
      var author = note.relation('author');
      house.add(global.curHouse);
      author.add(global.curUser);
      note.save();
    }).then(function() {
      self.props.navigator.pop();
    });
  },

  renderView() {
    return (
      <View style={styles.background}>
        <View style={styles.backgroundOverlay} />
        <View style={styles.contentContainer}>
          <Text>
            {this.state.noteAdded}
          </Text>
          <View style={styles.buttonContents}>
            <TextInput
              style={styles.textInput}
              onChange={(text) => this.setState({inputTitle: text.nativeEvent.text})}
              placeholder="title"
            />
            <TextInput
              style={styles.textInput}
              onChange={(text) => this.setState({inputText: text.nativeEvent.text})}
              placeholder="type note here"
            />
          <TouchableOpacity onPress={this.addNote}>
              <View style={styles.loginButton}>
                <Text style={styles.buttonText}>
                  Post Note
                </Text>
              </View>
            </TouchableOpacity>
          </View>
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
    height: 5,
    borderWidth: 0.5,
    borderColor: '#0f0f0f',
    padding: 4,
    flex: 1,
    fontSize: 13,
  }
});

module.exports = AddNoteView;
