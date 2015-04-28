var React = require('react-native');
var moment = require('moment');
var CoreStyle = require('./CoreStyle.js');
var NavigationBar = require('./NavigationBar.js');
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

// App views
var Views = {
  Loading: require('./Loading.js'),
  AddPhoto: require('./AddPhoto.js')
};

var PhotosView = React.createClass({
  getInitialState() {
    return {
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      loading: true
    }
  },

  componentDidMount() {
    this.fetchData();
  },

  fetchPhoto(photo) {
    var author = photo.get('author');
    return author.fetch().then(function(author) {
      return {
        url: photo.get('file')._url,
        author: author.get('name'),
        createdAt: photo.createdAt
      };
    });
  },

  fetchData() {
    // Set loading back to true, in case it is a refresh call
    this.setState({loading: true});

    var self = this;
    // query for notes that are in current house
    var Photo = Parse.Object.extend('Photo');
    var photoQuery = new Parse.Query(Photo);
    photoQuery.equalTo('house', global.curHouse);
    photoQuery.find({
      success: function(photos) {
        // notes is a list of notes in curHouse
        if (photos.length) {
          var fetchedPhotos = photos.map(self.fetchPhoto);
          Promise.all(fetchedPhotos).then(function(photos) {
            photos.sort(self.comparePhotos);
            self.setState({
              dataSource: self.state.dataSource.cloneWithRows(photos),
              loading: false
            });
          });
        } else {
          // no notes found
          self.setState({photos: [], loading: false});
        }
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  },

  comparePhotos(photo1, photo2) {
    return (photo2.createdAt - photo1.createdAt);
  },

  renderPhotoCell(photo) {
    return (<PhotoCell url={photo.url}
                      author={photo.author}
                      createdAt={photo.createdAt} />);
  },

  render() {
    var content = this.state.loading ?
                    <Views.Loading /> :
                    (<ListView
                      style={styles.notesList}
                      dataSource={this.state.dataSource}
                      renderRow={this.renderPhotoCell}/>);

    return (
      <View style={styles.contentContainer}>
        <NavigationBar navigator={this.props.navigator}
                       customNext={<CustomPlusButton plusView={Views.AddPhoto} title={'Select Photo'} callPrevView={this.fetchData} />}
                       backgroundColor={CoreStyle.colors.lightPurple}
                       title="Photos"
                       titleColor={CoreStyle.colors.mediumBlue} />
        {content}
      </View>);
  }
});

var PhotoCell = React.createClass({
  render() {
    return (
      <View style={styles.photoCell}>
        <Image style={styles.image} source={{uri: this.props.url}}>
          <View style={styles.bottomRow}>
            <H2>{this.props.author}</H2>
            <Image style={styles.icon} source={require('image!time')} resizeMode="contain" />
            <Text style={{color: CoreStyle.colors.lightPurple, marginLeft: 10}}>
              {moment(this.props.createdAt).fromNow()}
            </Text>
          </View>
        </Image>
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
  photoCell: {
    marginTop: 1,
    marginBottom: 1,
    height: 180
  },
  image: {
    flex: 1,
  },
  bottomRow: {
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
  },
  icon: {
    height: 15,
    width: 15
  }
});

module.exports = PhotosView;
