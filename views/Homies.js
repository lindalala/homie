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

// App views
var Views = {};
Views.Loading = require('./Loading.js');

var HomiesView = React.createClass({
  getInitialState() {
    return {
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      loading: true,
    }
  },

  componentDidMount() {
    var self = this;
    var relation = global.curHouse.relation("homies");
    var query = relation.query();
      query.find({
        success:function(list) {
          // list lists all homies
          var fetchedHm = list.map(self.fetchHm);
          fetchedHm.sort(function(h1,h2) {return (h1.id === global.curUser.id) ? -1: 1;});
          self.setState({
            dataSource: self.state.dataSource.cloneWithRows(fetchedHm),
            loading: false
          });
        }
    });
  },

  fetchHm(hm) {
    return {
      id: hm.id,
      name: hm.get('name'),
      picture: hm.get('picture')
    };
  },

  renderHmCell(hm) {
    var bgColor = (hm.id === global.curUser.id) ? CoreStyle.colors.paleBlue : CoreStyle.colors.palePurple;

    return (
      <View style={[styles.listItem, {backgroundColor: bgColor}]}>
        <Image style={styles.icon} source={{uri: hm.picture}} resizeMode="contain" />
        <View>
          <H1 style={{marginBottom: 10, marginLeft: 10}}>{hm.name}</H1>
        </View>
      </View>);
  },

  render() {
    if (this.state.loading) {
      return <Views.Loading />;
    } else {
      return (
        <View style={styles.contentContainer}>
          <ListView
            style={styles.hmList}
            dataSource={this.state.dataSource}
            renderRow={this.renderHmCell}/>
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
  hmList: {
    flex:1,
    backgroundColor: '#fff',
    paddingTop: 1
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  }
});

module.exports = HomiesView;
