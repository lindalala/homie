Object.assign = require('object-assign');
var React = require('react-native');
var {
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Navigator
} = React;

var CoreStyle = {};

CoreStyle.colors = {
  background: '#eee',
  paleBlue: '#eef',
  darkPurple:'#3b3e82',
  lightPurple: '#7a73d0'
};

CoreStyle.Text = React.createClass({
  getDefaultProps() {
    return {
      style: {}
    }
  },
  render() {
    return (<Text style={[this.styles.style, this.props.style]}>
      {this.props.children}
    </Text>);
  },
  styles: StyleSheet.create({
    style: {
      fontWeight: 'bold',
      fontFamily: 'Metapro',
      color: CoreStyle.colors.darkPurple
      /* also there's MetaBook-Roman and MetaBold-Roman (this one's boldest)*/
    },
  })
});
CoreStyle.H1 = React.createClass({
  render() {
    return (<CoreStyle.Text style={[this.styles.style, this.props.style]}>
      {this.props.children}
    </CoreStyle.Text>);
  },
  styles: StyleSheet.create({
    style: {
      color: CoreStyle.colors.darkPurple,
      fontSize: 26,
      fontFamily: 'MetaBold-Roman',
      /* also there's MetaBook-Roman and MetaBold-Roman (this one's boldest)*/
    },
  })
});
CoreStyle.H2 = React.createClass({
  render() {
    return (<CoreStyle.Text style={[this.styles.style, this.props.style]}>
      {this.props.children}
    </CoreStyle.Text>);
  },
  styles: StyleSheet.create({
    style: {
      color: CoreStyle.colors.lightPurple,
      fontSize: 16,
      fontFamily: 'MetaBold-Roman',
      /* also there's MetaBook-Roman and MetaBold-Roman (this one's boldest)*/
    },
  })
});

CoreStyle.Button = React.createClass({
  render() {
    return (
      <TouchableOpacity onPress={this._onPressButton}>
        <Image
          style={styles.button}
          source={require('image!myButton')}
        />
      </TouchableOpacity>
    );
  },
  styles: StyleSheet.create({
    button: {
      color: 'red'
    }
  })
});

CoreStyle.CustomPrevButton = React.createClass({
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <Image
          style={this.styles.button}
          source={require('image!noteIcon')}
        />
      </TouchableOpacity>
    );
  },
  styles: StyleSheet.create({
    button: {
      flex: 1,
      width: 38,
      height: 38,
    }
  })
});

CoreStyle.CustomPlusButton = React.createClass({
  render() {
    return (
      <TouchableOpacity onPress={this._onPress}>
        <Image
          style={this.styles.button}
          source={require('image!noteIcon')}
        />
      </TouchableOpacity>
    );
  },
  _onPress() {
    this.props.navigator.push({
      navBar: true,
      title: this.props.title,
      message: 'Swipe down to dismiss',
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      component: this.props.plusView
    });
  },
  styles: StyleSheet.create({
    button: {
      width: 24,
      height: 24,
      right: 10,
      bottom: 5
    }
  })
});


module.exports = CoreStyle;
