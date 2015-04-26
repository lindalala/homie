var React = require('react-native');
var CoreStyle = require('./CoreStyle.js');
var {
  StyleSheet,
  View,
  Navigator,
  AsyncStorage
} = React;
var {
  Text
} = CoreStyle;
var NavigationBar = require('./NavigationBar.js');

// App views
var Views = {
  Home: require('./Home.js'),
  Setup: require('./Setup.js'),
  Notes: require('./Notes.js'),
  Shopping: require('./Shopping.js'),
  Loading: require('./Loading.js')
};

var AppNavigatorView = React.createClass({
  getInitialState() {
    return {
      defaultHouseId: null,
      loading: true,
    }
  },

  componentDidMount() {
    var self = this;
    AsyncStorage.getItem('@Homie:defaultHouse', (error, value) => {
      if (value !== null) {
        // value is default id
        self.setState({defaultHouseId: value, loading: true});
        var House = Parse.Object.extend('House');
        var query = new Parse.Query(House);
        query.get(value, {
          success: function(defHouse) {
            // The object was retrieved successfully.
            global.curHouse = defHouse;
            self.setState({loading: false});
          },
          error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
            console.error(error);
            self.setState({loading: false});
          }
        });
      } else {
        // no default yet
        self.setState({loading: false});
      }
    });
  },

  configureScene(route, navigator) {
    if (route.sceneConfig) {
      return route.sceneConfig;
    }
    return Navigator.SceneConfigs.FloatFromRight;
  },

  renderScene(route, navigator) {
    var Component = route.component;
    var navBar = route.navBar;

    if (navBar) {
      navBar = <NavigationBar navigator={navigator}
                              route={route}
                              backgroundColor={CoreStyle.colors.lightPurple}
                              hidePrev={route.hidePrev}
                              customPrev={route.customPrev}
                              customNext={route.customNext}
                              onNext={route.onNext}
                              title={route.title}
                              titleColor={CoreStyle.colors.mediumBlue} />;
    }

    return (
      <View style={styles.container}>
        {navBar}
        <Component navigator={navigator} route={route} />
      </View>
    );
  },
  render() {
    if (this.state.loading) {
      return <Views.Loading  showNavBar={true} />;
    } else {
      var initRoute;
      if (global.curHouse) {
        // route to default home
        initRoute = {
          component: Views.Home,
          navBar: true,
          title: global.curHouse.get('name'),
          hidePrev: true,
          data: {houseId: this.state.defaultHouseId},
        }
      } else {
        // route to create/join house
        initRoute = {
          component: Views.Setup,
          navBar: false,
        }
      }

      return (
        <Navigator
          renderScene={this.renderScene}
          configureScene={this.configureScene}
          debugOverlay={false}
          style={styles.navigator}
          initialRoute={initRoute}
          onWillFocus={this.onWillFocus}
        />
      );
    }
  }
});

var NavbarTitle = React.createClass({
  render() {
    return (<Text style={styles.titleStyle}>
      {this.props.route.title}
    </Text>);
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CoreStyle.colors.background
  },

  navigator: {
    flex : 1,
    backgroundColor: '#545454'
  }
});



module.exports = AppNavigatorView;
