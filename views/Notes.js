var React = require('react-native');
var moment = require('moment');
var CoreStyle = require('./CoreStyle.js');
var NavigationBar = require('./NavigationBar.js');
var {
  ActivityIndicatorIOS,
  AsyncStorage,
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  ListView
} = React;
var {
  H1,
  H2,
  Text,
  CustomPlusButton
} = CoreStyle;

var Parse = require('parse').Parse;

// App views
var Views = {
  AddNote: require('./AddNote.js'),
  Loading: require('./Loading.js')
};

var NotesView = React.createClass({
  getInitialState() {
    return {
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      loading: true
    }
  },

  componentDidMount() {
    this.fetchData();
  },

  fetchNote(note) {
    var author = note.get('author');
    return author.fetch().then(function(author) {
      return {
        title: note.get('title'),
        content: note.get('content'),
        author: author.get('name'),
        createdAt: note.createdAt
      };
    });
  },

  fetchData() {
    // Set loading back to true, in case it is a refresh call
    this.setState({loading: true});

    var self = this;
    // query for notes that are in current house
    var Note = Parse.Object.extend('Note');
    var noteQuery = new Parse.Query(Note);
    noteQuery.equalTo('house', global.curHouse);
    noteQuery.find({
      success: function(notes) {
        // notes is a list of notes in curHouse
        if (notes.length) {
          var fetchedNotes = notes.map(self.fetchNote);
          Promise.all(fetchedNotes).then(function(notes) {
            notes.sort(self.compareNotes);
            self.setState({
              dataSource: self.state.dataSource.cloneWithRows(notes),
              loading: false
            });
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

  compareNotes(note1, note2) {
    return (note2.createdAt - note1.createdAt);
  },

  renderNoteCell(note) {
    return (<NoteCell title={note.title}
                      content={note.content}
                      author={note.author}
                      createdAt={note.createdAt} />);
  },

  render() {
    var content = this.state.loading ?
                    <Views.Loading /> :
                    (<ListView
                      style={styles.notesList}
                      dataSource={this.state.dataSource}
                      renderRow={this.renderNoteCell}/>);

    return (
      <View style={styles.contentContainer}>
        <NavigationBar navigator={this.props.navigator}
                                backgroundColor={CoreStyle.colors.lightPurple}
                                customNext={<CustomPlusButton plusView={Views.AddNote} title={'Add Note'} callPrevView={this.fetchData} />}
                                title="Notes"
                                titleColor={CoreStyle.colors.mediumBlue} />
        {content}
      </View>);
  }
});

var NoteCell = React.createClass({
  render() {
    return (
      <View style={styles.note}>
        <H1 style={{marginBottom: 5}}>{this.props.title}</H1>
        <H2><H2 style={{fontFamily: 'MetaPro'}}>by</H2> {this.props.author}</H2>
        <Text style={{marginTop: 15, marginBottom: 15}}>{this.props.content}</Text>
        <View style={styles.bottomRow}>
          <Image style={styles.icon} source={require('image!time')} resizeMode="contain" />
          <Text style={{color: CoreStyle.colors.lightPurple, marginLeft: 10}}>
            {moment(this.props.createdAt).fromNow()}
          </Text>
        </View>
      </View>);
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex:1
  },
  notesList: {
    flex:1,
    backgroundColor: CoreStyle.colors.background,
    paddingTop: 1
  },
  note: {
    backgroundColor: CoreStyle.colors.paleBlue,
    marginTop: 1,
    marginBottom: 1,
    padding: 25
  },
  bottomRow: {
    flexDirection: 'row',
  },
  icon: {
    height: 15,
    width: 15
  }
});

module.exports = NotesView;
