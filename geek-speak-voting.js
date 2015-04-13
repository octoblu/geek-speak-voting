var VOTE_COUNTER_UUID = "1d943f90-e20b-11e4-bb50-af4820817324";
var VOTE_BUTTONS = {
  Yes: '499d9820-e20b-11e4-a9c3-512b26405d66',
  No: 'b5a9a8b0-e20b-11e4-a9c3-512b26405d66'
};

var localStorage = {};
var defaultVotes = {
  yes: 0,
  no: 0,
  total: 0,
  loading: true
};

var VoteButton = React.createClass({

  handleClick: function() {
    vote = this.props.value;
    this.props.onVote(vote);
  },

  render: function () {
    return (
      <button className="vote-button" value={this.props.value} onClick={this.handleClick}>{this.props.value}</button>
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

var App = React.createClass({
  getInitialState: function() {
    MeshbluConnection = meshblu.createConnection({
      uuid: localStorage.deviceUUID,
      token: localStorage.deviceToken
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

      MeshbluConnection.subscribe({uuid: VOTE_COUNTER_UUID, token: VOTE_COUNTER_TOKEN });

      MeshbluConnection.device({uuid: VOTE_COUNTER_UUID}, function(device){
        console.log('device', device);
        device = device.device;
        self.setState({
          yes: device.data.yes,
          no: device.data.no,
          total: device.data.yes + device.data.no,
          loading: false
        });
      });

    });

  },

  componentDidMount: function() {
    var self = this;
    MeshbluConnection.on('message', function(message) {
      if (message.topic !== 'message') return;

      console.log('got message', message);

      self.setState({
        yes: message.yes,
        no: message.no,
        total: message.yes + message.no
      });
    });

  },

  handleVote: function(vote) {
      MeshbluConnection.message({
        devices: VOTE_COUNTER_UUID,
        topic: 'button',
        payload : {
          from: VOTE_BUTTONS[vote]
        }
      });
  },

  render: function() {
    var results;

    if (this.state.loading) {
      results = <p>Loading....</p>
    } else {
      results = <VoteResults yesCount={this.state.yes} noCount={this.state.no} totalCount={this.state.total} />
    }

    return (
      <div>
        {results}

        <div className="vote-buttons">
          <VoteButton value="Yes" ref="yes" onVote={this.handleVote}/>
          <VoteButton value="No" ref="no" onVote={this.handleVote}/>
        </div>
      </div>
    );
  }
});

React.render(<App />, document.getElementById('app'));
