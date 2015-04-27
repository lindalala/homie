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
  Text,
  CustomPlusButton
} = CoreStyle;

var Parse = require('parse').Parse;
var NavigationBar = require('./NavigationBar.js');

// App views
var Views = {
  AddBill: require('./AddBill.js'),
  BillItems: require('./BillItems.js'),
  Loading: require('./Loading.js')
};


var BillsView = React.createClass({
  getInitialState() {
    return {
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      loading: true
    }
  },

  componentDidMount() {
    this.fetchData();
  },

  fetchBill(bill) {
    return {
      id: bill.id,
      title: bill.get('name'),
      amount: bill.get('amount'),
      dueDate: bill.get('dueDate')
    }
  },

  fetchData() {
    // Set loading back to true, in case it is a refresh call
    this.setState({loading: true});

    var self = this;
    // query for bills that are in current house
    var Bill = Parse.Object.extend('Bill');
    var billQuery = new Parse.Query(Bill);
    billQuery.equalTo('house', global.curHouse);
    billQuery.find({
      success: function(bills) {
        // bills is a list of bills in curHouse
        if (bills.length) {
          self.setState({
            dataSource: self.state.dataSource.cloneWithRows(bills.map(self.fetchBill)),
            loading: false
          });
        } else {
          // no notes found
          self.setState({loading: false});
        }
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  },

  enterBill(billId, billTitle) {
    this.props.navigator.push({
      navBar: true,
      title: billTitle,
      component: Views.BillItems,
      data: {billId: billId},
      hidePrev: false,
    });
  },

  renderBillCell(bill) {
    return (<BillCell id={bill.id}
                      title={bill.title}
                      amount={bill.amount}
                      dueDate={bill.dueDate}
                      onPress={() => this.enterBill(bill.id, bill.title)}/>);
  },

  render() {
    var content = this.state.loading ?
                    <Views.Loading /> :
                    (<ListView
                      style={styles.billList}
                      dataSource={this.state.dataSource}
                      renderRow={this.renderBillCell}/>);

    return (
      <View style={styles.contentContainer}>
        <NavigationBar navigator={this.props.navigator}
                                backgroundColor={CoreStyle.colors.lightPurple}
                                customNext={<CustomPlusButton plusView={Views.AddBill} title={'Add New Bill'} callPrevView={this.fetchData} />}
                                title="Bills"
                                titleColor={CoreStyle.colors.mediumBlue} />
        {content}
      </View>);
  }
});

var BillCell = React.createClass({
  render() {
    var dueDate = moment(this.props.dueDate) < moment(new Date()).add('hours', 22) ? 'today' : moment(this.props.dueDate).fromNow();
    return (
      <TouchableOpacity onPress={this.props.onPress}>
          <View style={styles.bill}>
          <H1 style={{marginBottom: 5}}>{this.props.title}</H1>
          <Text style={{color: CoreStyle.colors.lightPurple}}>
            {'$' + this.props.amount} due {dueDate}
          </Text>
        </View>
      </TouchableOpacity>);

  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex:1
  },
  billList: {
    flex:1,
    backgroundColor: CoreStyle.colors.background,
    paddingTop: 1
  },
  bill: {
    backgroundColor: CoreStyle.colors.paleBlue,
    marginTop: 1,
    marginBottom: 1,
    padding: 25
  }
});

module.exports = BillsView;
