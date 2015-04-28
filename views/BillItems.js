var React = require('react-native');
var moment = require('moment');
var CoreStyle = require('./CoreStyle.js');
var {
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
  TextInput,
  H1,
  H2,
  Text
} = CoreStyle;

var Parse = require('parse').Parse;

// App views
var Views = {};
Views.Home = require('./Home.js');
Views.Loading = require('./Loading.js');

var STATUS = {ENTER: 0, SETUP: 1};

var BillItemsView = React.createClass({
  getInitialState() {
    return {
      items: [],
      bill: null,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      amountCompleted: null,
      totalAmount: null,
      loading: true
    }
  },

  componentDidMount() {
    var self = this;
    var Bill = Parse.Object.extend("Bill");
    var query = new Parse.Query(Bill);
    query.get(this.props.navigator.route.data.billId, {
      success: function(bill) {
        var relation = bill.relation('items');
        var query = relation.query();
        query.find().then(function(itemsList) {
          if (itemsList.length) {
            var fetchedItems = itemsList.map(self.fetchItem);
            Promise.all(fetchedItems).then(function(items) {
              items.sort(self.compareItems);
              var amtCompleted = 0;
              for (var i=0; i<items.length; i++) {
                if (items[i].done) {
                  amtCompleted += items[i].amount;
                }
              }
              self.setState({
                items: items,
                bill: bill,
                dataSource: self.state.dataSource.cloneWithRows(items),
                amountCompleted: Number(parseFloat(amtCompleted).toFixed(2)),
                totalAmount: bill.get('amount'),
                loading: false
              });
            });
          } else {
            // no items found
            self.setState({bill: bill, loading: false});
          }
        });
      },
      error: function(object, error) {
        // The object was not retrieved successfully.
        // error is a Parse.Error with an error code and message.
        alert('Invalid Bill: ' + error.message);
      }
    });
  },

  compareItems(item1, item2) {
    if (item1.done) {
      if (item2.done) {
        return (item2.dueDate - item1.dueDate);
      } else {
        // item 1 done, item 2 not done so item 2 is earlier
        return 1;
      }
    } else {
      if (item2.done) {
        return -1;
      } else {
        return (item2.dueDate - item1.dueDate);
      }
    }
  },

  fetchItem(item) {
    var ower = item.get('ower');
    return ower.fetch().then(function(ower) {
      return {
        id: item.id,
        amount: item.get('amount'),
        ower: ower.get('name'),
        updatedAt: item.updatedAt,
        done: item.get('done')
      };
    });
  },

  completeItem(item) {
    for (var i=0; i<this.state.items.length; i++) {
      if (this.state.items[i].id === item.id) {
        var newItem = React.addons.update(this.state.items[i], {
          done: {$set: true},
        });

        var newItems = React.addons.update(this.state.items,{$splice: [[i,1,newItem]]});
        newItems.sort(this.compareItems);
        this.setState({
          items: newItems,
          dataSource: this.state.dataSource.cloneWithRows(newItems),
          amountCompleted: this.state.amountCompleted + item.amount
        });
        break;
      }
    }
    var BillItem = Parse.Object.extend('BillItem');
    var query = new Parse.Query(BillItem);
    query.get(item.id).then(function(billItem) {
      billItem.set('done', true);
      billItem.save();
    }, function(error) {
      alert('ERROR: ' + error.message);
    });
  },

  renderItemCell(item) {
    var icon = item.done ? require('image!checked') : require('image!unchecked');
    var byText = item.done ? 'paid' : 'due';
    var bgColor = item.done ? CoreStyle.colors.palePurple : CoreStyle.colors.paleBlue;
    var itemTime = item.done ? item.updatedAt : item.dueDate;

    var rowContents = (
      <View style={[styles.listItem, {backgroundColor: bgColor}]}>
        <View>
          <H1 style={{marginBottom: 10}}>{item.ower}</H1>
          <H2>
            ${item.amount} <H2 style={{fontFamily: 'MetaPro'}}>{byText}</H2>
            <H2 style={{fontFamily: 'MetaPro'}}> {moment(itemTime).fromNow()}</H2>
          </H2>
        </View>
        <Image style={styles.icon} source={icon} resizeMode="contain" />
      </View>);

    var output;

    if (item.done) {
      return rowContents;
    } else {
      return (
        <TouchableOpacity activeOpacity={0.6} onPress={() => this.completeItem(item)} key={item.id}>
          {rowContents}
        </TouchableOpacity>)
    }
  },

  render() {
    if (this.state.loading) {
      return <Views.Loading />;
    } else {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.textInputContainer}>
            <Text>
              ${this.state.amountCompleted} out of ${this.state.totalAmount} paid
            </Text>
          </View>
          <ListView
            style={styles.itemList}
            dataSource={this.state.dataSource}
            renderRow={this.renderItemCell}/>
        </View>);
    }
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex:1
  },
  buttonText: {
    fontSize: 20,
    alignSelf: 'center'
  },
  list: {
    padding: 10
  },
  name: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    marginTop: 15,
    alignSelf: 'center',
  },
  textInputContainer: {
    padding: 10
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginBottom: 2
  },
  itemList: {
    flex:1,
    backgroundColor: '#fff',
    paddingTop: 1
  },
  icon: {
    width: 30,
    height: 30
  }
});

module.exports = BillItemsView;
