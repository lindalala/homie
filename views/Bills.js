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

var BillsView = React.createClass({
  getInitialState() {
    return {
      notes: null,
      loading: true
    }
  },

  renderNote(note) {
    console.log(Date.parse(note.createdAt));
    var authorRelation = note.relation('author');
    var query = authorRelation.query();
    return authorRelation.query().find().then(function(list) {
      var author = list[0];
      return (
        <View style={styles.note}>
          <Text>
            {note.get('content')}{'\n'}
            By: {author.get('name')} {'\n'}
            {moment(note.createdAt).fromNow()}
          </Text>
        </View>
      )
    });
  },

  componentDidMount() {
    var self = this;
    // query for notes that are in current house
    var Note = Parse.Object.extend('Note');
    var noteQuery = new Parse.Query(Note);
    noteQuery.equalTo('house', global.curHouse);
    noteQuery.find({
      success: function(notes) {
        // notes is a list of notes in curHouse
        if (notes.length) {
          var notesAndAuthor = notes.map(self.renderNote);
          Promise.all(notesAndAuthor).then(function(notes) {
            self.setState({notes:notes, loading: false});
          });
        } else {
          // no notes found
          self.setState({notes: [], loading: false});
        }
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
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
              {this.state.notes}
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
  note: {
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

module.exports = BillsView;
