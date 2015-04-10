Object.assign = require('object-assign');
var React = require('react-native');
var {
  StyleSheet,
  Text
} = React;

var CoreStyle = {};

CoreStyle.Text = React.createClass({
  render() {
    return <Text style={[this.styles.style, this.props.style]}>{this.props.children}</Text>
  },
  styles: StyleSheet.create({
    style: {
      color: 'red'
    }
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



CoreStyle.colors = {
  background: '#eee'
};


module.exports = CoreStyle;
