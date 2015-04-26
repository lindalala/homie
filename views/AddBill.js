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
  TextInput,
  Image,
  DatePickerIOS,
  PickerIOS
} = React;
var {
  H1,
  Text
} = CoreStyle;
var Overlay = require('react-native-overlay');
var Parse = require('parse').Parse;

// App views
var Views = {};
Views.Home = require('./Home.js');

var STATUS = {ENTER: 0, SETUP: 1};

var AddBillView = React.createClass({
  getInitialState() {
    return {
      isDateModalOpen: false,
      isHousemateModalOpen: false,
      inputTitle: null,
      inputText: null,
      noteAdded: null,
      dueDate: new Date()
    }
  },

  openDateModal() {
    this.setState({isDateModalOpen: true});
  },

  openHousemateModal() {
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
    var bill = new Bill();

    bill.set('name', this.state.inputName);
    bill.set('amount', this.state.inputAmount);
    bill.set('dueDate', this.state.inputDate);

    var self = this;
    bill.save().then(function(bill) {
      // bill saved successfully.
    }, function(error) {
      // the save failed.
      alert('Failed to create new object, with error code: ' + error.message);
    }).then(function() {
      var house = bill.relation('house');
      var items = bill.relation('items');
      house.add(global.curHouse);
      author.add(global.curUser);
      bill.save();
    }).then(function() {
      self.props.navigator.pop();
    });
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
              
            />
            <TouchableOpacity onPress={this.closeModal}>
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
    var dateModal = this.renderDateModal();
    var housemateModal = this.renderHousemateModal();
    return (
      <View style={styles.background}>
        <View style={styles.backgroundOverlay} />
        <View style={styles.contentContainer}>
          {dateModal}
          {housemateModal}
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

          <TextInput
            style={styles.textInput}
            keyboardType={'decimal-pad'}
            onChange={(text) => this.setState({inputAmount: text.nativeEvent.text})}
            placeholder="$0.00"
          />
          <TextInput
            style={styles.textInput}
            onChange={(text) => this.setState({inputAmount: text.nativeEvent.text})}
            placeholder="housemate's name"
          />

          <TouchableOpacity onPress={this.openHousemateModal}>
              <View>
                <Text style={styles.buttonText}>
                  + add another housemate
                </Text>
              </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.addNote}>
              <View>
                <Text style={styles.buttonText}>
                  add bill
                </Text>
              </View>
          </TouchableOpacity>
          </View>
        </View>
      </View>);
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
});

module.exports = AddBillView;
