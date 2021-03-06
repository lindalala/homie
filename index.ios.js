'use strict';

var React = require('react-native');
var CoreStyle = require('./views/CoreStyle.js');
var {
  AppRegistry,
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  StatusBarIOS
} = React;
var {
  H1,
  H2
} = CoreStyle;

var Parse = require('parse').Parse;
Parse.initialize("Tr0epOMYD8xXYa22R3Uc8MhEGMYGLuoA0J05aYv3", "o3ki0HSrtxHj0Dcq4LmJAKrwTLo3BBgpX9awr1p8");

var FacebookLoginManager = require('NativeModules').FacebookLoginManager;

// App views
var Views = {
  AppNavigator: require('./views/AppNavigator.js'),
  Loading: require('./views/Loading.js')
};

// Statuses
var STATUS = {LOADING: 0, NEW: 1, RETURNING: 2};

// Globals
global.curUser;
global.curHouse;

var Homie = React.createClass({
  getInitialState() {
    return {
      result: '',
      status: STATUS.LOADING
    }
  },

  componentDidMount() {
    // Status bar color
    StatusBarIOS.setStyle(StatusBarIOS.Style.lightContent);

    var self = this;
    AsyncStorage.getItem('@Homie:user', (error, value) => {
      if (value !== null) {
        // returning user
        var [username, pass] = value.split(/:(.+)/, 2);
        Parse.User.logIn(username, pass, {
          success: function(user) {
            // log in success
            global.curUser = user;
            self.setState({status: STATUS.RETURNING});
          },
          error: function(user, error) {
            // The login failed. Check error to see why.
            console.error(error);
            self.setState({status: STATUS.NEW});
          }
        });
      } else {
        // new user
        self.setState({status: STATUS.NEW});
      }
    });
  },

  login() {
    FacebookLoginManager.newSession((error, info) => {
      if (error) {
        this.setState({result: error, status: STATUS.NEW});
      } else {
        this.setState({token: info.token, userId: info.userId});
        this.getUser();
      }
    });
  },

  getUser() {
    var url = `https://graph.facebook.com/v2.3/${this.state.userId}?access_token=${this.state.token}` +
              '&fields=name,first_name,last_name,picture&format=json'
    if (this.state.token) {
      fetch(url)
        .then((response) => response.json())
        .then((responseData) => {
          this.setState({user: responseData});
          this.createUser();
        });
    }
  },

  createUser() {
    var user = new Parse.User();
    var pw = Math.random().toString(36).substring(2);
    user.set("username", this.state.user.id);
    user.set("password", pw);
    user.set("picture", this.state.user.picture.data.url);
    user.set("name", this.state.user.name);
    user.set("firstName", this.state.user.first_name);
    user.set("lastName", this.state.user.last_name);

    var self = this;
    user.signUp(null, {
      success: function(user) {
        // Hooray! Store username and password.
        AsyncStorage.setItem("@Homie:user", self.state.user.id + ':' + pw, (error) => {
          if (error) {
            self._appendMessage('AsyncStorage error: ' + error.message);
          } else {
            // sucessfully stored user data to disk
            global.curUser = user;
            self.setState({status: STATUS.RETURNING});
          }
        });
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
    });
  },
  renderLogInView() {
    return (
      <Image
          style={styles.background}
          source={require('image!homiebg')}>
        <View style={styles.container}>
          <Image
            style={styles.logo}
            source={require('image!homieLogo')}
          />
          <TouchableHighlight onPress={this.login}>
            <View style={styles.loginButton}>
              <Text style={styles.buttonText}>
                login with Facebook
              </Text>
            </View>
          </TouchableHighlight>
          <Text style={styles.subheadingText}>
              We will never post anything without permission
          </Text>
        </View>
      </Image>

    );
  },

  render() {
    if (this.state.status === STATUS.LOADING) {
      return <Views.Loading showNavBar={true} />;
    } else if (this.state.status === STATUS.NEW) {
      return this.renderLogInView();
    } else if (this.state.status === STATUS.RETURNING) {
      return <Views.AppNavigator />;
    } else {
      console.error("Error: STATUS unknown");
    }
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loginButton: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 30,
    backgroundColor: '#fff3b4',
    justifyContent: 'center',
  },
  backgroundOverlay: {
    opacity: 0.85,
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundVideo: {
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  buttonText: {
    fontSize: 28,
    fontFamily: 'MetaBold-Roman',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 17,
    marginRight: 20,
    marginLeft: 20,
    color: '#7a73d0',
  },
  subheadingText: {
    fontSize: 12,
    fontFamily: 'MetaPro',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    paddingBottom: 260,
    color: '#d8e1f2',
  },
  logo: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 221.4,
    height: 68.7,
    marginBottom: 100,
  },
  contentContainer: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
  },
  name: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    marginTop: 15,
    alignSelf: 'center',
  },
});

AppRegistry.registerComponent('Homie', () => Homie);
