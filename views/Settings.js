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
  Text,
  CustomPlusButton
} = CoreStyle;

var Parse = require('parse').Parse;

// App views
var Views = {
  Loading: require('./Loading.js'),
  Setup: require('./Setup.js'),
  Homies: require('./Homies.js'),
  Homes: require('./Homes.js'),
  Profile: require('./Profile.js')
};


var SettingsView = React.createClass({
  getInitialState() {
    return {
      settings: [],
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      loading: true
    }
  },

  componentDidMount() {
    var settings = [
      {
        id: 0,
        title: 'Switch House',
        clickView: Views.Homes,
        customNext: <CustomPlusButton plusView={Views.Setup} title={'Add House'} />
      },
      {
        id: 1,
        title: 'Homies',
        clickView: Views.Homies
      },
      {
        id: 2,
        title: 'Profile',
        clickView: Views.Profile
      }
    ];

    this.setState({
      settings: settings,
      dataSource: this.state.dataSource.cloneWithRows(settings),
      loading: false
    });
  },

  settingClicked(sIdx) {
    this.props.navigator.push({
      navBar: true,
      title: this.state.settings[sIdx].title,
      component: this.state.settings[sIdx].clickView,
      customNext: this.state.settings[sIdx].customNext,
      hidePrev: false,
    });
  },

  renderSettingCell(setting) {
    return (<TouchableOpacity onPress={() => this.settingClicked(setting.id)}>
                <View style={styles.setting}>
                <H1 style={{marginBottom: 5}}>{setting.title}</H1>
              </View>
            </TouchableOpacity>);
  },

  render() {
    if (this.state.loading) {
      return (<View style={styles.contentContainer}>
                <Views.Loading />
              </View>);
    }
    return (
      <View style={styles.contentContainer}>
        <View>
          <Text>
            Current House ID: {global.curHouse.id}
          </Text>
        </View>
        <ListView
          style={styles.settingList}
          dataSource={this.state.dataSource}
          renderRow={this.renderSettingCell}/>
      </View>);
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex:1
  },
  settingList: {
    flex:1,
    backgroundColor: CoreStyle.colors.background,
    paddingTop: 1
  },
  setting: {
    backgroundColor: CoreStyle.colors.paleBlue,
    marginTop: 1,
    marginBottom: 1,
    padding: 25
  }
});

module.exports = SettingsView;
