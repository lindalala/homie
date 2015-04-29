Object.assign = require('object-assign');
var React = require('react-native');
var {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
  TextInput,
  Navigator
} = React;

var CoreStyle = {};

CoreStyle.colors = {
  background: '#fff',
  paleBlue: '#ecf3fb',
  palePurple: '#d8e1f2',
  mediumBlue: '#cce3ff',
  lightPurple: '#7a73d0',
  darkPurple:'#3b3e82',
  paleYellow: '#fff3b4'
};

CoreStyle.Text = React.createClass({
  getDefaultProps() {
    return {
      style: {}
    }
  },
  setNativeProps: function(props) {
    this.refs.textNode.setNativeProps(props);
    // Do nothing.
    // This method is required in order to use this view as a Touchable* child.
    // See ensureComponentIsNative.js for more info
  },
  render() {
    return (<Text ref="textNode" style={[this.styles.style, this.props.style]}>
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
CoreStyle.H3 = React.createClass({
  render() {
    return (<CoreStyle.Text style={[this.styles.style, this.props.style]}>
      {this.props.children}
    </CoreStyle.Text>);
  },
  styles: StyleSheet.create({
    style: {
      color: CoreStyle.colors.mediumBlue,
      fontSize: 18,
      /* also there's MetaBook-Roman and MetaBold-Roman (this one's boldest)*/
    },
  })
});

CoreStyle.TextInput = React.createClass({
  render() {
    return (<TextInput
      style={[this.styles.textInput, this.props.style]}
      onChange={this.props.onChange}
      placeholder={this.props.placeholder}
      onSubmitEditing={this.props.onSubmitEditing}
      onChangeText={this.props.onChangeText}
      value={this.props.value}
    />);
  },
  styles: StyleSheet.create({
    textInput: {
      fontFamily: 'MetaPro',
      fontWeight: 'bold',
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: CoreStyle.colors.mediumBlue,
      flex: 1,
      paddingHorizontal: 20,
      fontSize: 20,
      backgroundColor: 'white'
    }
  })
});

CoreStyle.Button = React.createClass({
  getDefaultProps() {
    return {
      text: 'Button'
    }
  },
  render() {
    return (
      <TouchableOpacity activeOpacity={0.6} onPress={this.props.onPress}>
        <View style={this.styles.button}>
          <Text style={this.styles.text}>{this.props.text}</Text>
        </View>
      </TouchableOpacity>
    );
  },
  styles: StyleSheet.create({
    button: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: CoreStyle.colors.mediumBlue,
      height: 60,
      borderRadius: 30,
    },
    text: {
      fontFamily: 'MetaBold-Roman',
      fontWeight: 'bold',
      fontSize: 30,
      color: CoreStyle.colors.lightPurple
    }
  })
});

CoreStyle.CustomPlusButton = React.createClass({
  getDefaultProps() {
    return {
      navBar: true
    };
  },
  render() {
    return (
      <TouchableOpacity onPress={this._onPress}>
        <Image
          style={this.styles.button}
          source={require('image!add')}
        />
      </TouchableOpacity>
    );
  },
  _onPress() {
    this.props.navigator.push({
      navBar: this.props.navBar,
      title: this.props.title,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      component: this.props.plusView,
      callPrevView: this.props.callPrevView
    });
  },
  styles: StyleSheet.create({
    button: {
      width: 20,
      height: 20,
      right: 10,
      bottom: 8
    }
  })
});


module.exports = CoreStyle;
