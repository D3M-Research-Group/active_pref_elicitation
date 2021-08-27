import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

import {
	Col,
	FormGroup,
	Label,
	Row,
    Container
} from 'reactstrap';

import StartPage from './StartPage';
import UserInfoForm from './UserInfoForm';
import Loader from "./Loader";
import graphData from "./mockGraphData";
import choiceData from "./mockChoiceData";
import StepList from './StepGenerator';


class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      // track which step we are on and the choices made so far
      currentStep: 0,
      userChoices : [],

      // handle loading screen toggle
      loading: false,

      // toggle show Userinfo form
      showUserInfoForm: false,

      // toggle show Start page
      showStartPage: true,

      // toggle show steps
      showSteps: false,

      // form info
      userInfo: {
        username: '',
        age: '',
        race_ethnicity: '',
        gender: '',
        marital_status: '',
        education: '',
        political: '',
        positive_family: '',
        positive_anyone: '',
        healthcare_yn: '',
        healthcare_role: ''
      }
    }
    this.maxSteps = 7;
    this.uuid = uuidv4();
    this.graphData = graphData;
    this.choiceData = choiceData;

    // binding functions
    this.toggleUserInfoForm = this.toggleUserInfoForm.bind(this);
    this.toggleStartPage = this.toggleStartPage.bind(this);
    this.updateUserInfo = this.updateUserInfo.bind(this);
    this.incrementStep = this.incrementStep.bind(this);

  }

  incrementStep(){
    this.setState({
      currentStep : this.state.currentStep + 1
    }, function(){ console.log(this.state.currentStep)})
    if(this.state.currentStep === 0){
      this.toggleShowSteps();
    }
  }

  toggleShowSteps(){
    this.setState({ showSteps: !this.state.showSteps})
  }

  toggleStartPage(){
    this.setState({ showStartPage: !this.state.showStartPage})
  }

  toggleUserInfoForm(){
    this.setState({ showUserInfoForm: !this.state.showUserInfoForm})
  }

  updateUserInfo(data){
    // remove form errors messages from the object
    var toUpdate = _.omit(data, ["defaultMessage", "selectFieldMessage",
     "usernameFieldMessage", "healthcareroleFieldMessage"])
    this.setState({
      userInfo: toUpdate
    }, 
    function(){console.log(this.state.userInfo)}
    )
  }
  
  async componentDidMount() {
    
    // get IP info
    const response = await fetch('https://geolocation-db.com/json/');
    const data = await response.json();
    this.setState({ ip: data.IPv4 })
    // parse query string info
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    // only want param mturk
    if(params['mturk']){
      this.mturk = true;
    }

  }
  render() {
    return(
      <React.Fragment>
        <h1>Active Preference Elicitation <span role="img" aria-label="crystal ball">🔮</span> </h1>

        <StartPage showStartPage={this.state.showStartPage}
        toggleStartPage={this.toggleStartPage}
        toggleUserInfoForm={this.toggleUserInfoForm}
        />
        <UserInfoForm showForm={this.state.showUserInfoForm}
         toggleUserInfoForm={this.toggleUserInfoForm} updateUserInfo={this.updateUserInfo}
         incrementStep={this.incrementStep} />
        {this.state.showSteps ? 
          <StepList 
            key={this.state.currentStep.toString()} // key necessary for ensuring re-render on state change
            userChoices={this.state.userChoices}
            maxSteps={this.maxSteps}
            choiceData={this.choiceData}
            currentStep={this.state.currentStep}
            loading={this.state.loading}
            incrementStep={this.incrementStep}
          /> : 
          null
        }
        {/* <EndPage></EndPage> */}

      </React.Fragment>
    );
  }
}


export default App;
