var React = require('react-native');
var {
  StyleSheet,
  View,
  Navigator
} = React;

var CoreStyle = require('./CoreStyle.js');
var NavigationBar = require('react-native-navbar');

// App views
var Views = {};
Views.Homes = require('./Homes.js');

var AppNavigatorView = React.createClass({

  renderScene(route, navigator) {
    var Component = route.component;
    var navBar = route.navBar;
    var title = route.title;

    if (navBar) {
      navBar = <NavigationBar navigator={navigator}
                              title={title}
                              backgroundColor="#fa3" />;
    }

    return (
      <View style={styles.container}>
        {navBar}
        <Component navigator={navigator} route={route} />
      </View>
    );
  },

  render() {
    return (
      <Navigator
        renderScene={this.renderScene}
        debugOverlay={false}
        style={styles.navigator}
        initialRoute={{
          component: Views.Homes,
          navBar: true,
          title: 'Homes'
        }}
      />
    );
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
