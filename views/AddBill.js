var React = require('react-native');
var moment = require('moment');
var CoreStyle = require('./CoreStyle.js');
var {
  AppRegistry,
  AsyncStorage,
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  DatePickerIOS,
  PickerIOS,
  ScrollView
} = React;
PickerItemIOS = PickerIOS.Item;
var {
  H1,
  Text,
  TextInput
} = CoreStyle;
var Overlay = require('react-native-overlay');
var Parse = require('parse').Parse;

// App views
var Views = {};
Views.Loading = require('./Loading.js');

var STATUS = {ENTER: 0, SETUP: 1};

var AddBillView = React.createClass({
  getInitialState() {
    return {
      isDateModalOpen: false,
      isHousemateModalOpen: false,
      inputTitle: null,
      inputHousemate: null,
      availableHousemates: [],
      noteAdded: null,
      dueDate: new Date(),
      loading: true,
      hmCharges: [],
      selectedIdx: 0
    }
  },

  componentDidMount() {
    var self = this;
    var homieRelation = global.curHouse.relation('homies');
    var homieQuery = homieRelation.query();
    return homieQuery.find().then(function(list) {
      // list is a list of homies
      var housemates = [];
      for (var i=0; i<list.length; i++) {
        if (list[i].id !== global.curUser.id) {
          housemates.push({
            id: list[i].id,
            target: list[i].get('name')
          });
        }
      }
      var initHm = housemates[0];
      self.setState({availableHousemates: housemates,
                     hmCharges: [{'amount': 0,
                                  'target': initHm.target,
                                  'id': initHm.id}],
                     loading: false});
    });
  },

  openDateModal() {
    this.setState({isDateModalOpen: true});
  },

  openHousemateModal(idx) {
    this.setState({isHousemateModalOpen: true});
  },

  closeModal() {
    this.setState({isDateModalOpen: false, isHousemateModalOpen: false});
  },

  dueDateChanged(date) {
    this.setState({
      dueDate: date
    })
  },

  addBill() {
    var Bill = Parse.Object.extend('Bill');
    var newBill = new Bill();

    newBill.set('name', this.state.inputTitle);
    newBill.set('dueDate', this.state.dueDate);

    var self = this;
    newBill.save().then(function(bill) {
      // sucess
      var house = bill.relation('house');
      var items = bill.relation('items');
      house.add(global.curHouse);
      var totalAmount = 0;
      for(var i=0; i< self.state.hmCharges.length; i++) {
        var charge = self.state.hmCharges[i];
        // create BillItem
        var BillItem = Parse.Object.extend('BillItem');
        var billItem = new BillItem();
        totalAmount += charge.amount;
        billItem.set('amount', charge.amount); // add amount
        billItem.set('done', false); // bill not yet paid

        (function(charge) {
          billItem.save().then(function(billItem){
            // get ower relation
            // add item to items relation
            items.add(billItem);
            bill.save();
            var ower = billItem.relation('ower');
            var query = new Parse.Query(Parse.User);
            // query for user with matching ID
            query.equalTo("objectId", charge.id);
            query.find({
              success: function(matchedList) {
                ower.add(matchedList[0]); // add user to relation
                billItem.save();
              }
            });
          });
        })(charge);
      }
      bill.set('amount', Number(parseFloat(totalAmount).toFixed(2)));
      bill.save();
    }, function(error) {
      alert('Failed to create new object, with error code: ' + error.message);
    }).then(function() {
      self.props.navigator.pop();
    });
  },

  addNewCharge() {
    var newTarget = this.state.availableHousemates[this.state.selectedIdx];
    newTarget.amount = 0.00;
    this.setState({hmCharges: React.addons.update(this.state.hmCharges,{$push: [newTarget]})});
    this.closeModal();
  },

  updateAmount(amt, idx) {
    var newHmCharge = this.state.hmCharges[idx];
    newHmCharge.amount = Number(parseFloat(amt).toFixed(2));
    this.setState({hmCharges: React.addons.update(this.state.hmCharges,{$splice: [[idx,1,newHmCharge]]})});
  },

  updateTarget(targetIdx) {
    var idx = this.state.selectedIdx;
    var newHmCharge = this.state.hmCharges[idx];
    newHmCharge.target = this.state.availableHousemates[targetIdx].target;
    newHmCharge.id = this.state.availableHousemates[targetIdx].id;
    this.setState({hmCharges: React.addons.update(this.state.hmCharges,{$splice: [[idx,1,newHmCharge]]})});
  },

  renderDateModal() {
    return (
      <Overlay isVisible={this.state.isDateModalOpen}>
        <View style={styles.overlay} pointerEvents="box-none">
          <View style={styles.modal}>
            <H1>Due date</H1>
            <DatePickerIOS
              date={this.state.dueDate}
              mode="date"
              onDateChange={this.dueDateChanged}
            />
          <TouchableOpacity onPress={this.closeModal}>
              <View>
                <Text style={styles.buttonText}>
                  Choose
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Overlay>);
  },

  renderHousemateModal() {
    return (
      <Overlay isVisible={this.state.isHousemateModalOpen}>
        <View style={styles.overlay} pointerEvents="box-none">
          <View style={styles.modal}>
            <H1>Add housemate</H1>
            <PickerIOS
              style={styles.hmPicker}
              selectedValue={this.state.selectedIdx}
              onValueChange={(tIdx) => this.setState({selectedIdx: tIdx})}>
              {this.state.availableHousemates.map((hm, idx) => (
                <PickerItemIOS
                  key={idx}
                  value={idx}
                  label={hm.target}
                  />
                )
              )}
            </PickerIOS>
            <TouchableOpacity onPress={this.addNewCharge}>
              <View>
                <Text style={styles.buttonText}>
                  Add
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Overlay>
    );
  },

  renderView() {
    if (this.state.loading) {
      return (<View style={styles.contentContainer}>
                <Views.Loading />
              </View>)
    }
    var self = this;
    var dateModal = this.renderDateModal();
    var hmModal = this.renderHousemateModal();
    var hmCharges = this.state.hmCharges.map(function(charge, idx) {
      return (
        <View style={styles.chargeAmt}>
          <TextInput
            style={styles.textInput}
            keyboardType={'decimal-pad'}
            onEndEditing={(event) => self.updateAmount(event.nativeEvent.text, idx)}
            placeholder={'$' + charge.amount}
          />
          <View style={styles.chargeName}>
            <Text style={styles.buttonText}>
              {charge.target}
            </Text>
          </View>
        </View>
      )
    });
    return (
      <ScrollView>
        <View style={styles.contentContainer}>
          {dateModal}
          <View style={styles.buttonContents}>
            <TextInput
              style={styles.textInput}
              onChange={(text) => this.setState({inputTitle: text.nativeEvent.text})}
              placeholder="bill name"
            />
          <TouchableOpacity onPress={this.openDateModal}>
            <View>
              <Text>{moment(this.state.dueDate).format('D MMMM YYYY')}</Text>
            </View>
          </TouchableOpacity>
          <Text>Charge Housemates</Text>
          {hmCharges}
          {hmModal}
          <TouchableOpacity onPress={this.openHousemateModal}>
              <View>
                <Text style={styles.buttonText}>
                  + add another housemate
                </Text>
              </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.addBill}>
              <View>
                <Text style={styles.buttonText}>
                  add bill
                </Text>
              </View>
          </TouchableOpacity>
          </View>
        </View>
      </ScrollView>);
  },

  render() {
    return this.renderView();
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex:1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  buttonContents: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
    marginVertical: 40,
    padding: 5,
    backgroundColor: '#EAEAEA',
    borderRadius: 3,
    paddingVertical: 10,
  },
  background: {
    flex: 1
  },
  backgroundOverlay: {
    opacity: 0.85,
    backgroundColor: '#ffffff'
  },
  buttonText: {
    fontSize: 20,
    alignSelf: 'center'
  },
  houseList: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  name: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    marginTop: 15,
    alignSelf: 'center',
  },
  textInput: {
    height: 5,
    borderWidth: 0.5,
    borderColor: '#0f0f0f',
    padding: 4,
    flex: 1,
    fontSize: 13,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,20,20,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5
  },
  modal: {
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center'
  },
  hmPicker: {
    flex: 1,
    width: 300
  },
  chargeAmt: {
    width: 50,
    height: 50
  },
  chargeName: {
    width: 150,
    height: 40
  }
});

module.exports = AddBillView;
