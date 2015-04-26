/*
  Forked from react-native-nav-bar by Kureev
*/

'use strict';

var React = require('react-native');
var CoreStyle = require('./CoreStyle.js');
var {
  PixelRatio,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} = React;

var NavigatorNavigationBarStyles = require('NavigatorNavigationBarStyles');
var StaticContainer = require('StaticContainer.react');
var cssVar = require('cssVar');

var styles = StyleSheet.create({
  navBarContainer: {
    height: NavigatorNavigationBarStyles.General.TotalNavHeight,
    width: NavigatorNavigationBarStyles.General.ScreenWidth,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 5,
    borderBottomColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1 / PixelRatio.get(),
    justifyContent: 'space-between',
  },
  customTitle: {
    position: 'absolute',
    width: NavigatorNavigationBarStyles.General.ScreenWidth,
    alignItems: 'center',
    bottom: 5,
  },
  navBarText: {
    fontSize: 16,
    marginVertical: 10,
    flex: 2,
    textAlign: 'center',
  },
  navBarTitleText: {
    position: 'absolute',
    width: NavigatorNavigationBarStyles.General.ScreenWidth,
    fontSize: 24,
    fontFamily: 'Metabold-Roman',
    bottom: 10
  },
  navBarLeftButton: {
    paddingLeft: 10,
  },
  navBarRightButton: {
    paddingRight: 10,
  },
  navBarButtonText: {
    color: cssVar('fbui-accent-blue'),
  },
  navBarBack: {
    width: 12,
    height: 23,
    bottom: 6
  }
});

var NavigationBar = React.createClass({
  /*
   * If there are no routes in the stack, `hidePrev` isn't provided or false,
   * and we haven't received `onPrev` click handler, return true
   */
  prevButtonShouldBeHidden: function() {
    var {
      onPrev,
      hidePrev,
      navigator
    } = this.props;

    var getCurrentRoutes = navigator.getCurrentRoutes;

    return (
      hidePrev ||
      (getCurrentRoutes && getCurrentRoutes().length <= 1 && !onPrev)
    );
  },

  /**
   * Describes how we get a left button in the navbar
   */
  getLeftButtonElement: function() {
    var {
      onPrev,
      prevTitle,
      navigator,
      route,
      buttonsColor,
      customPrev,
      backgroundColor
    } = this.props;

    /*
     * If we have a `customPrev` component, then return
     * it's clone with additional attributes
     */
    if (customPrev) {
      return React.addons.cloneWithProps(customPrev, { navigator, route });
    }

    /*
     * Check if we need to hide `prev` button
     */
    if (this.prevButtonShouldBeHidden()) {
      return <View style={styles.navBarLeftButton}></View>;
    }

    /*
     * Apply custom background styles to button
     */

    return (
      <TouchableOpacity onPress={onPrev || navigator.pop}>
        <View style={styles.navBarLeftButton}>
          <Image style={styles.navBarBack} source={require('image!back')} />
        </View>
      </TouchableOpacity>
    );
  },

  /*
   * Describe how we get a title for the navbar
   */
  getTitleElement: function() {
    var {
      title,
      titleColor,
      customTitle,
      navigator,
      route,
    } = this.props;

    /*
     * Return `customTitle` component if we have it
     */
    if (customTitle) {
      return (
        <View style={styles.customTitle}>
          {React.addons.cloneWithProps(customTitle, { navigator, route })}
        </View>
      );
    }

    if (title && !title.length) {
      return true;
    }

    var titleStyle = [
      styles.navBarText,
      styles.navBarTitleText,
      { color: titleColor }
    ];

    return (
      <Text style={titleStyle}>
        {title}
      </Text>
    );
  },

  getRightButtonElement: function() {
    var {
      onNext,
      nextTitle,
      navigator,
      route,
      buttonsColor,
      backgroundColor,
      customNext
    } = this.props;

    /*
     * If we have a `customNext` component, then return
     * it's clone with additional attributes
     */
    if (customNext) {
      return React.addons.cloneWithProps(customNext, { navigator, route });
    }

    /*
     * If we haven't received `onNext` handler, then just return
     * a placeholder for button to keep markup consistant and
     * title aligned to the center
     */
    if (!onNext) {
      return <Text style={styles.navBarRightButton}></Text>;
    }

    /*
     * Apply custom background styles to button
     */
    var customStyle = backgroundColor ? { color: buttonsColor } : {};

    return (
      <TouchableOpacity onPress={onNext}>
        <View style={styles.navBarRightButton}>
          <Text style={[styles.navBarText, styles.navBarButtonText, customStyle]}>
            {nextTitle || 'Next'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },

  render: function() {
    var customStyle = this.props.backgroundColor ?
      { backgroundColor: this.props.backgroundColor } : {};

    return (
      <StaticContainer shouldUpdate={false}>
        <View style={[styles.navBarContainer, customStyle]}>
          {this.getTitleElement()}
          {this.getLeftButtonElement()}
          {this.getRightButtonElement()}
        </View>
      </StaticContainer>
    );
  },
});

module.exports = NavigationBar;
