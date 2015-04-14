var FLOW_UUID = "1d943f90-e20b-11e4-bb50-af4820817324";
var VOTE_BUTTONS = {
  Yes: '499d9820-e20b-11e4-a9c3-512b26405d66',
  No: 'b5a9a8b0-e20b-11e4-a9c3-512b26405d66'
};

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
    var label = (this.props.value === 'Yes') ? 'Awesome' : 'Sucks';

    return (
      <button className="vote-button" value={this.props.value} onClick={this.handleClick}>
        {label}
      </button>
    );
  }
});

var VoteResults = React.createClass({
  countInPercent: function(count) {
    var percentValue = Math.ceil((count/this.props.totalCount) * 100) || 0;
    return percentValue.toString() + "%";
  },

  render: function() {
    var yesHeight = {height: this.countInPercent(this.props.yesCount)};
    var noHeight = {height: this.countInPercent(this.props.noCount)};

    return (
      <div className="results">
        <div className="result__container">
          <div className="result__votes result__votes--yes" style={yesHeight}></div>
        </div>
        <div className="result__container">
          <div className="result__votes result__votes--no" style={noHeight}></div>
        </div>
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


      MeshbluConnection.update({type: 'device:synergy-vote'});

      MeshbluConnection.subscribe({uuid: FLOW_UUID});

      MeshbluConnection.device({uuid: FLOW_UUID}, function(device){
        device = device.device;
        yes = parseInt(device.data.yes, 10);
        no = parseInt(device.data.no, 10);

        self.setState({
          yes: yes,
          no: no,
          total: yes + no,
          loading: false
        });
      });
    });
  },

  componentDidMount: function() {
    var self = this;
    MeshbluConnection.on('message', function(message) {
      if (message.topic !== 'message') return;

      yes = parseInt(message.yes, 10);
      no = parseInt(message.no, 10);

      self.setState({
        yes: yes,
        no: no,
        total: yes + no
      });
    });

  },

  handleVote: function(vote) {
    MeshbluConnection.message({
      devices: FLOW_UUID,
      topic: 'button',
      payload : {
        from: VOTE_BUTTONS[vote]
      }
    });
  },

  render: function() {
    return (
      <div>
        <h1 className="title">What do you think of the current talk?</h1>
        <VoteResults yesCount={this.state.yes} noCount={this.state.no} totalCount={this.state.total} />
        <div className="vote-buttons">
          <VoteButton value="Yes" ref="yes" onVote={this.handleVote}/>
          <VoteButton value="No" ref="no" onVote={this.handleVote}/>
        </div>
      </div>
    );
  }
});

React.render(<App />, document.getElementById('app'));
