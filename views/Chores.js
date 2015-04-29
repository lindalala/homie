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
var KeyboardEvents = require('react-native-keyboardevents');
var KeyboardEventEmitter = KeyboardEvents.Emitter;

// App views
var Views = {};
Views.Home = require('./Home.js');
Views.Loading = require('./Loading.js');

var STATUS = {ENTER: 0, SETUP: 1};

var ChoresView = React.createClass({
  getInitialState() {
    KeyboardEventEmitter.on(KeyboardEvents.KeyboardDidShowEvent, (frames) => {
      this.setState({keyboardSpace: frames.end.height});
    });
    KeyboardEventEmitter.on(KeyboardEvents.KeyboardWillHideEvent, (frames) => {
      this.setState({keyboardSpace: 0});
    });

    return {
      keyboardSpace: 0,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      chores: [],
      loading: true,
      newItemText: ''
    }
  },

  componentDidMount() {
    var self = this;
    // query for items in shopping lists
    var Chore = Parse.Object.extend('Chore');
    var choreQ = new Parse.Query(Chore);
    choreQ.equalTo('house', global.curHouse);
    choreQ.find({
      success: function(chores) {
        // chores is a list of chores in curHouse
        if (chores.length) {
          var fetchedChores = chores.map(self.fetchChore);
          Promise.all(fetchedChores).then(function(fetchedChores) {
            fetchedChores.sort(self.compareChores);
            self.setState({
              chores: fetchedChores,
              dataSource: self.state.dataSource.cloneWithRows(fetchedChores),
              loading: false
            });
          });
        } else {
          // no items found
          self.setState({loading: false});
        }
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  },

  compareChores(chore1, chore2) {
    if (chore1.done) {
      if (chore2.done) {
        return (chore2.updatedAt - chore1.updatedAt);
      } else {
        // chore 1 done, chore 2 not done so chore 2 is earlier
        return 1;
      }
    } else {
      if (chore2.done) {
        return -1;
      } else {
        return (chore2.updatedAt - chore1.updatedAt);
      }
    }
  },

  addChore() {
    var title = this.state.newChoreText;

    var self = this;
    var Chore = Parse.Object.extend('Chore');
    var chore = new Chore();
    chore.set('title', title);
    chore.set('done', false);
    chore.set('author', global.curUser);
    chore.set('house', global.curHouse);
    chore.save().then(function(newChore) {
      var choreInfo = {id: newChore.id,
                       title: title,
                       author: global.curUser.get('name'),
                       done: false,
                       updatedAt: newChore.updatedAt };
      var newChores = React.addons.update(self.state.chores,{$push: [choreInfo]});
      newChores.sort(self.compareChores);
      self.setState({
       chores: newChores,
       dataSource: self.state.dataSource.cloneWithRows(newChores),
       newChoreText: ''
      });
    });
  },

  fetchChore(chore) {
    var author = chore.get('author');
    var completer = chore.get('completer');
    return author.fetch().then(function(author) {
      var choreInfo = {
        id: chore.id,
        title: chore.get('title'),
        done: chore.get('done'),
        author: author.get('name'),
        updatedAt: chore.updatedAt
      };
      if (chore.done) {
        return completer.fetch.then(function(completer) {
          choreInfo.completer = completer.get('name');
          return choreInfo;
        });
      } else {
        return choreInfo;
      }
    });
  },

  completeChore(choreId) {
    for (var i=0; i<this.state.chores.length; i++) {
      if (this.state.chores[i].id === choreId) {
        var newChore = React.addons.update(this.state.chores[i], {
          done: {$set: true},
          completer: {$set: global.curUser.get('name')},
          updatedAt: {$set: new Date()}
        });

        var newChores = React.addons.update(this.state.chores,{$splice: [[i,1,newChore]]});
        newChores.sort(this.compareChores);
        this.setState({
          chores: newChores,
          dataSource: this.state.dataSource.cloneWithRows(newChores)
        });
        break;
      }
    }
    var Chore = Parse.Object.extend('Chore');
    var query = new Parse.Query(Chore);
    query.get(choreId).then(function(chore) {
      chore.set('completer', global.curUser);
      chore.set('done', true);
      chore.save();
    });
  },

  renderChoreCell(chore) {
    var icon = chore.done ? require('image!checked') : require('image!unchecked');
    var byText = chore.done ? 'completed by' : 'requested by';
    var bgColor = chore.done ? CoreStyle.colors.palePurple : CoreStyle.colors.paleBlue;
    var person = chore.done ? chore.completer : chore.author;

    var rowContents = (
      <View style={[styles.listItem, {backgroundColor: bgColor}]}>
        <View>
          <H1 style={{marginBottom: 10}}>{chore.title}</H1>
          <H2>
            <H2 style={{fontFamily: 'MetaPro'}}>{byText}</H2> {person} -
            <H2 style={{fontFamily: 'MetaPro'}}> {moment(chore.updatedAt).fromNow()}</H2>
          </H2>
        </View>
        <Image style={styles.icon} source={icon} resizeMode="contain" />
      </View>);

    var output;

    if (chore.done) {
      return rowContents;
    } else {
      return (
        <TouchableOpacity activeOpacity={0.6} onPress={() => this.completeChore(chore.id)} key={chore.id}>
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
              value={this.state.newChoreText}
              onChangeText={(text) => this.setState({newChoreText: text})}
              onSubmitEditing={this.addChore}
              placeholder="Add new chore and press enter..."
            />
          </View>
          <ListView
            style={styles.choreList}
            dataSource={this.state.dataSource}
            renderRow={this.renderChoreCell}/>
          <View style={{height: this.state.keyboardSpace}}></View>
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
  choreList: {
    flex:1,
    backgroundColor: '#fff',
    paddingTop: 1
  },
  icon: {
    width: 30,
    height: 30
  }
});

module.exports = ChoresView;
