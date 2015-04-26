var React = require('react-native');
var CoreStyle = require('./CoreStyle.js');
var NavigationBar = require('./NavigationBar.js');
var {
  StyleSheet,
  View,
  ActivityIndicatorIOS
} = React;
var {
  Text
} = CoreStyle;


var LoadingView = React.createClass({
  getDefaultProps() {
    return {
      showNavBar: false
    }
  },
  render() {
    var navbar;
    if (this.props.showNavBar) {
      navbar = (<NavigationBar navigator={navigator}
                                backgroundColor={CoreStyle.colors.lightPurple}
                                hidePrev={true}
                                hideNext={true} />);
    }

    return (
      <View style={styles.container}>
        {navbar}
        <View style={styles.center}>
          <ActivityIndicatorIOS />
        </View>
      </View>);
  }
});

var styles = StyleSheet.create({
  container: {
    flex:1,
    flexDirection: 'column',
    backgroundColor: CoreStyle.colors.background
  },
  center: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center'
  }
});

module.exports = LoadingView;
