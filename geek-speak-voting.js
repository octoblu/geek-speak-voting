var MeshbluConnection = {};
var localStorage = {};
var defaultVotes = {
  yes: 0,
  no: 0,
  total: 0
};

var App = {};

var VoteButton = React.createClass({

  handleClick: function() {
    vote = this.props.value;

    var votes = App.state;
    console.log('Votes', votes);

    
    if (vote === 'Yes') {
      votes.yes++;
    } else {
      votes.no++;
    }
    votes.total = votes.yes + votes.no;
    this.emitVoteMessage(votes);
  },

  emitVoteMessage: function(votes)  {
    console.log('Emit:', votes);
    App.setState(votes);
    MeshbluConnection.message({
      devices: localStorage.deviceUUID,

      payload: {
        votes: votes
      }
    });
  },

  render: function () {
    return (
      <button className="vote-button" value={this.props.value} onClick={this.handleClick}>{this.props.value}</button>
    );
  }
});

var VoteButtons = React.createClass({
  recordVote: function(event) {
    console.log(event);
    console.log(this.refs);
  },

  render: function() {
    return (
      <div className="vote-buttons">
        <VoteButton value="Yes" />
        <VoteButton value="No"/>
      </div>
    );
  }
});

var VoteResults = React.createClass({

  render: function() {
    return (
      <div className="voting-results">
        <div className="total-votes">{this.props.totalCount}</div>
        <div className="yes-votes">{this.props.yesCount}</div>
        <div className="no-votes">{this.props.noCount}</div>
      </div>
    );
  }
});

App = React.createClass({
  getInitialState: function() {
    MeshbluConnection = meshblu.createConnection({
      uuid: localStorage.deviceUUID,
      token: localStorage.deviceToken,
      server: 'wss://meshblu.octoblu.com',
      port: 443
    });

    return defaultVotes;
  },

  componentWillMount: function() {
    var self = this;

    MeshbluConnection.on('ready', function(device) {
      localStorage.deviceUUID  = device.uuid;
      localStorage.deviceToken = device.token;

      console.log('ready', device);

      MeshbluConnection.update({type: 'device:synergy-vote'});

      MeshbluConnection.whoami({}, function(myDevice) {
        console.log('The device is ', myDevice, self.state);
        if (myDevice.votes) {
          self.setState(myDevice.votes);
        }
      });

    });
  },

  componentDidMount: function() {
    var self = this;
    MeshbluConnection.on('message', function(message) {

      if (message.payload.votes) {
        MeshbluConnection.whoami({}, function(myDevice) {
          console.log('The device is ', myDevice, self.state);
          myDevice.votes = message.payload.votes;
          MeshbluConnection.update(myDevice);
        });
      }
    });

  },

  render: function() {
    return (
      <div>
        <VoteResults yesCount={this.state.yes} noCount={this.state.no} totalCount={this.state.total}/>
        <VoteButtons />
      </div>
    );
  }
});



React.render(<App />, document.getElementById('app'));
