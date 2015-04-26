var React = require('react-native');
var moment = require('moment');
var CoreStyle = require('./CoreStyle.js');
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
  Text
} = CoreStyle;

var Parse = require('parse').Parse;

// App views
var Views = {
  Home: require('./Home.js'),
  Loading: require('./Loading.js')
};


var BillsView = React.createClass({
  getInitialState() {
    return {
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      loading: true
    }
  },

  componentDidMount() {
    this.fetchData();
  },

  fetchBill(bill) {
    return {
      title: bill.get('name'),
      content: bill.get('amount'),
      author: bill.get('dueDate'),
      createdAt: bill.createdAt
    }
  },

  fetchData() {
    var self = this;
    // query for bills that are in current house
    var Bill = Parse.Object.extend('Bill');
    var billQuery = new Parse.Query(Bill);
    billQuery.equalTo('house', global.curHouse);
    billQuery.find({
      success: function(bills) {
        // bills is a list of bills in curHouse
        if (bills.length) {
          var fetchedBills = bills.map(self.fetchBill);
          Promise.all(fetchedBills).then(function(bills) {
            self.setState({
              dataSource: self.state.dataSource.cloneWithRows(bills),
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
        <Text style={{color: CoreStyle.colors.lightPurple}}>
          {moment(this.props.createdAt).fromNow()}
        </Text>
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
  }
});

module.exports = BillsView;
