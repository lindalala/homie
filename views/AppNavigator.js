var React = require('react-native');
var CoreStyle = require('./CoreStyle.js');
var {
  StyleSheet,
  View,
  Navigator
} = React;
var {
  Text
} = CoreStyle;
var NavigationBar = require('react-native-navbar');

// App views
var Views = {};
Views.Home = require('./Home.js');
Views.Setup = require('./Setup.js');

var AppNavigatorView = React.createClass({
  getInitialState() {
    return {
      defaultHouseId: null,
      loading: true,
    }
  },

  componentDidMount() {
    var defaultHouseRelation = global.curUser.relation('defaultHouse');
    var query = defaultHouseRelation.query();
    var self = this;
    query.find({
      success:function(list) {
        if (list.length) {
          self.setState({defaultHouseId: list[0].id, loading: false});
        }
      }
    });
  },

  renderLoadingView() {
    return (
      <View style={styles.container}>
        <View style={styles.loginButton}>
          <Text style={styles.buttonText}>
            LOADING
          </Text>
        </View>
      </View>
    );
  },

  renderScene(route, navigator) {
    var Component = route.component;
    var navBar = route.navBar;

    if (navBar) {
      navBar = <NavigationBar navigator={navigator}
                              title={route.title}
                              backgroundColor="#fa3"
                              hidePrev={route.hidePrev} />;
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
      return this.renderLoadingView();
    } else {
      var initRoute;
      if (this.state.defaultHouseId) {
        // route to default home
        initRoute = {
          component: Views.Home,
          navBar: true,
          title: 'Home',
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
          debugOverlay={false}
          style={styles.navigator}
          initialRoute={initRoute}
        />
      );
    }
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CoreStyle.colors.background
  },

  navigator: {
    alignSelf : 'stretch',
    overflow : 'hidden',
    flex : 1,
  }
});

module.exports = AppNavigatorView;
