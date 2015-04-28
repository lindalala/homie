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
  ScrollView,
  TextInput
} = React;
PickerItemIOS = PickerIOS.Item;
var {
  H1,
  H3,
  Button,
  Text
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
                     hmCharges: [],
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
      return bill.save();
    }, function(error) {
      alert('Failed to create new object, with error code: ' + error.message);
    }).then(function() {
      self.props.route.callPrevView();
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
              style={styles.datePicker}
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

  render() {
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
        <View style={[styles.pillbox, styles.hmChargeContainer]}>
          <View style={{justifyContent: 'center'}}>
            <TextInput
              style={styles.dollarInput}
              keyboardType={'decimal-pad'}
              onEndEditing={(event) => self.updateAmount(event.nativeEvent.text, idx)}
              placeholder={'$' + charge.amount}
            />
          </View>
          <View style={styles.chargeName}>
            <Text style={styles.buttonText}>
              {charge.target}
            </Text>
          </View>
        </View>
      )
    });

    if (this.state.hmCharges.length === 0) {
      hmCharges = <Text style={styles.noneText}> No housemates added </Text>;
    }

    return (
      <ScrollView style={styles.contentContainer}>
        <View style={styles.buttonContents}>
          <CoreStyle.TextInput
            style={styles.textInput}
            onChange={(text) => this.setState({inputTitle: text.nativeEvent.text})}
            placeholder="Bill Name"
          />
          <TouchableOpacity onPress={this.openDateModal}>
            <View style={styles.pillbox}>
              <H1 style={styles.fieldTitle}>Due Date</H1>
              <React.Text>{moment(this.state.dueDate).format('D MMMM YYYY')}</React.Text>
            </View>
          </TouchableOpacity>
          <H3 style={styles.chargeTitle}>Charge Housemates</H3>
          {hmCharges}
          <TouchableOpacity onPress={this.openHousemateModal}>
              <View>
                <Text style={styles.addHmButton}>
                  + Add a housemate
                </Text>
              </View>
          </TouchableOpacity>
        </View>
        <Button onPress={this.addBill} text="create bill" />
        {dateModal}
        {hmModal}
      </ScrollView>);
  }
});

var styles = StyleSheet.create({
  contentContainer: {
    flex:1,
    paddingHorizontal: 25,
    paddingTop: 25
  },
  buttonContents: {
    flexDirection: 'column',
    flex: 1,
    paddingVertical: 10,
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
  chargeTitle: {
    alignSelf: 'center',
    marginTop: 40,
    marginBottom: 15
  },
  dollarInput: {
    height: 40,
    width: 100
  },
  chargeName: {
    borderLeftWidth: 2,
    borderLeftColor: CoreStyle.colors.mediumBlue,
    width: 150,
    justifyContent: 'center',
    paddingLeft: 20
  },
  hmChargeContainer: {
    alignItems: 'stretch'
  },
  addHmButton: {
    alignSelf: 'center',
    marginTop: 15
  },
  pillbox: {
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: CoreStyle.colors.mediumBlue,
    paddingHorizontal: 20,
    fontSize: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },
  fieldTitle: {
    fontSize: 18,
    marginRight: 10
  },
  datePicker: {
    flex: 1
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,20,20,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modal: {
    margin: 20,
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
  noneText: {
    justifyContent: 'center'
  }
});

module.exports = AddBillView;
