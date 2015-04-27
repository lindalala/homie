var React = require('react-native');
var moment = require('moment');
var CoreStyle = require('./CoreStyle.js');
var {
	ActivityIndicatorIOS,
	AsyncStorage,
	StyleSheet,
	View,
	TouchableHighlight,
	TouchableOpacity,
	Image,
	ListView
} = React;
var {
	H1,
	H2,
	Text
} = CoreStyle;

var Parse = require('parse').Parse;

// App views
var Views = {
	Home: require('./Home.js'),
	Loading: require('./Loading.js')
};

var STATUS = {ENTER: 0, SETUP: 1};

var MsgView = React.createClass({
	getInitialState() {
		return {
			dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
			loading: true
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
						self.setState({
							dataSource: self.state.dataSource.cloneWithRows(msgs),
							loading: false
						});
					});
				} else {
					// no messages
					self.setState({msgs: [], loading: false});
				}
			},
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
	},

	renderMsgCell(msg) {
		return (<MsgCell content={msg.content}
						 author={msg.author}
						 createdAt={msg.createdAt} />);
	},

	render() {
		var content = this.state.loading ? 
				<Views.Loading /> :
				(<ListView
					style={styles.msgsList}
					dataSource={this.state.dataSource}
					renderRow={this.renderMsgCell}/>);
		return (
			<View style={styles.contentContainer}>
				{content}
			</View>);

	}
});


var MsgCell = React.createClass({
	render() {
		return (
			<View style={styles.note}>
		        //<H1 style={{marginBottom: 5}}>{this.props.title}</H1>
		        <H2><H2 style={{fontFamily: 'MetaPro'}}>by</H2> {this.props.author}</H2>
		        <Text style={{marginTop: 15, marginBottom: 15}}>{this.props.content}</Text>
		        <Text style={{color: CoreStyle.colors.lightPurple}}>
		          {moment(this.props.createdAt).fromNow()}
		        </Text>
		      </View>);
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex:1
  },
  notesList: {
    flex:1,
    backgroundColor: CoreStyle.colors.background,
    paddingTop: 1
  },
  note: {
    backgroundColor: CoreStyle.colors.paleBlue,
    marginTop: 1,
    marginBottom: 1,
    padding: 25
  }
});

module.exports = MsgView;






