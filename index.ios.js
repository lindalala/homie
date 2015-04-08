'use strict';

var React = require('react-native');
var {
  AppRegistry,
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image
} = React;
var Parse = require('parse').Parse;
Parse.initialize("Tr0epOMYD8xXYa22R3Uc8MhEGMYGLuoA0J05aYv3", "o3ki0HSrtxHj0Dcq4LmJAKrwTLo3BBgpX9awr1p8");

var FacebookLoginManager = require('NativeModules').FacebookLoginManager;
var Video = require('react-native-video');
var LinearGradient = require('react-native-linear-gradient');

// App views
var Views = {};
Views.Homes = require('./views/Homes.js');
Views.AppNavigator = require('./views/AppNavigator.js');

// Statuses
var STATUS = {LOADING: 0, NEW: 1, RETURNING: 2};

// Global Current User
global.curUser;

var Homie = React.createClass({
  getInitialState() {
    return {
      result: '',
      status: STATUS.LOADING
    }
  },

  componentDidMount() {
    var self = this;
    AsyncStorage.getItem('@Homie:user', (error, value) => {
      if (value !== null) {
        // returning user
        var [username, pass] = value.split(/:(.+)/, 2);
        Parse.User.logIn(username, pass, {
          success: function(user) {
            // log in success
            self.setState({status: STATUS.RETURNING});
            global.curUser = user;
          },
          error: function(user, error) {
            // The login failed. Check error to see why.
            console.error('Error: ' + error);
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
        this.setState({result: error});
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
        })
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

    user.signUp(null, {
      success: function(user) {
        // Hooray! Store username and password.
        AsyncStorage.setItem("@Homie:user", this.state.user.id + ':' + pw, (error) => {
          if (error) {
            this._appendMessage('AsyncStorage error: ' + error.message);
          } else {
            // sucessfully stored user data to disk
            this.setState({status: STATUS.RETURNING});
            global.curUser = user;
          }
        });
      }.bind(this),
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
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

  renderLogInView() {
    return (
      <View style={styles.container}>
        <Video source={"background"} style={styles.backgroundVideo} repeat={true} />

        <TouchableHighlight onPress={this.login}>
          <View style={styles.loginButton}>
            <Text style={styles.buttonText}>
              Sign in with Facebook
            </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight>
          <Text style={styles.result}>
            {this.state.result}
          </Text>
        </TouchableHighlight>
      </View>
    );
  },

  renderLoggedInView() {
    return (
      <View style={styles.background}>
        <Video source={"background"} style={styles.backgroundVideo} repeat={true} />
        <View style={styles.backgroundOverlay} />

        <View style={styles.contentContainer}>
          <View>
            <Image source={{uri: this.state.user.picture.data.url}}
                   style={styles.profilePicture} />
            <Text style={styles.name}>
              Welcome {'\n'} {this.state.user.name}!
            </Text>
          </View>
        </View>
      </View>
    )
  },

  render() {
    if (this.state.status === STATUS.LOADING) {
      return this.renderLoadingView();
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
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
    borderRadius: 5,
    backgroundColor: '#3b5998'
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
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
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
