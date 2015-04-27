var React = require('react-native');
var moment = require('moment');
var CoreStyle = require('./CoreStyle.js');
var InvertibleScrollView = require('react-native-invertible-scroll-view');
var {
	ActivityIndicatorIOS,
	AsyncStorage,
	StyleSheet,
	View,
	TouchableHighlight,
	TouchableOpacity,
	Image,
	ListView,
	ScrollView
} = React;
var {
	H1,
	H2,
	Text,
	TextInput,
} = CoreStyle;

var Parse = require('parse').Parse;

var Views = {
	Home: require('./Home.js'),
	Loading: require('./Loading.js')
};

var STATUS = {ENTER: 0, SETUP: 1};

var MsgView = React.createClass({
	getInitialState() {
		return {
			messages: [],
			inputText: '',
			dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
			loading: true,
		}
	},

	componentDidMount() {
		this.fetchData();
	},

	fetchMsg(msg) {
		var authorRelation = msg.relation('author');
		var query = authorRelation.query();
		return query.find().then(function(list) {
			var author = list[0];
			return {
				content: msg.get('content'),
				author: author.get('name'),
				picture: msg.get('picture'),
				createdAt: msg.createdAt
			}
		});
	},

	onWillFocus() {
		alert('Will focus on Message');
	},

	fetchData() {
		this.setState({loading: true});

		var self = this;
		var Message = Parse.Object.extend('Message');
		var msgQuery = new Parse.Query(Message);
		msgQuery.equalTo('house', global.curHouse);
		msgQuery.find({
			success: function(msgs) {
				if (msgs.length) {
					var fetchedMsgs = msgs.map(self.fetchMsg);
					Promise.all(fetchedMsgs).then(function(msgs) {
						msgs.sort(self.compareMessages);
						self.setState({
							dataSource: self.state.dataSource.cloneWithRows(msgs),
							loading: false,
							messages: msgs
						});
					});
				} else {
					self.setState({messages: [], loading: false});
				}
			},
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
	},

	compareMessages(msg1, msg2) {
		return (msg1.createdAt - msg2.createdAt);
	},

	addMsg() {
		var Msg = Parse.Object.extend('Message');
		var msg = new Msg();

		msg.set('content', this.state.inputText);

		var self = this;
		msg.save().then(function(msg) {
		}, function(error) {
			alert('Failed to create new object, with error code: ' + error.message);
		}).then(function() {
			var house = msg.relation('house');
			var author = msg.relation('author');
			msg.set('picture', global.curUser.get('picture'));
			house.add(global.curHouse);
			author.add(global.curUser);
			msg.save();
			
			var newMessageInfo = {id: msg.id,
								content: msg.get('content'),
								author: global.curUser.get('name'),
								picture: global.curUser.get('picture'),
								createdAt: msg.createdAt };
			var newMessages = React.addons.update(self.state.messages, {$push: [newMessageInfo]});
			newMessages.sort(self.compareMessages);
			self.setState({
				messages: newMessages,
				dataSource: self.state.dataSource.cloneWithRows(newMessages),
				inputText: ''
			});
		});
	},

	renderMsgCell(msg) {
		return (<MsgCell content={msg.content}
						 author={msg.author}
						 picture={msg.picture}
						 createdAt={msg.createdAt} />);
	},

	render() {
		var content = this.state.loading ? 
				<Views.Loading /> :
				(<ListView
					renderScrollView={
        				(props) => <InvertibleScrollView {...props} inverted />
        			}
					style={styles.msgsList}
					dataSource={this.state.dataSource}
					renderRow={this.renderMsgCell} />);
		return (
			<View style={{flex:1}}>
				<View style={styles.contentContainer}>
					{content}
					<View style={{height: 80, marginTop: 10, borderRadius: 3, paddingVertical: 10}}>
						<TextInput
							value={this.state.inputText}
							onChangeText={(text) => this.setState({inputText: text})}
							onSubmitEditing={this.addMsg}
							placeholder="enter message"
						/>
					</View>
				</View>
			</View>
		);

	}
});


var MsgCell = React.createClass({

	render() {
		return (
			<View style={styles.message}>
				<Image style={styles.profPic} source={{uri: this.props.picture}} resizeMode="contain" />
				<View style={{paddingLeft: 10, flex: 0.75}}>
			        <H2 style={{fontFamily: 'MetaPro', fontSize: 10}}>{this.props.author}</H2>
			        <Text style={{marginTop: 2, marginBottom: 6, fontSize: 16}}>{this.props.content}</Text>
			        <H2 style={{fontFamily: 'MetaPro', fontSize: 8}}>
			          {moment(this.props.createdAt).format('MMMM Do, h:mm a')}
			        </H2>
			    </View>
		     </View>);
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'transparent',
    marginTop: 10
  },
  textInputContainer: {
  	height: 60,
  	paddingHorizontal: 25,
  	backgroundColor: 'transparent',
  },
  msgsList: {
    flex:1,
    backgroundColor: CoreStyle.colors.background,
    paddingTop: 1
  },
  message: {
  	flexDirection: 'row',
  	alignItems: 'center',
  	justifyContent: 'flex-start',
    marginTop: 1,
    marginBottom: 2,
    padding: 10
  },
  profPic: {
  	flex: 0.2,
  	width: 50,
  	height: 50
  }
});

module.exports = MsgView;






