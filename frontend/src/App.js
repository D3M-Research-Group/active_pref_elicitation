import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';


import {Container} from 'reactstrap';

import StartPage from './StartPage';
import UserInfoForm from './UserInfoForm';
import StepList from './StepGenerator';
import getPolicyData from './transformCsvFiles';
import policy_data_path from './COVID_and_LAHSA_datasets/COVID/UK_1360beds-25policies.csv';
import { csv } from 'd3-fetch';
import TopNavBar from './TopNavBar';
import './Card.scss';
import axios from 'axios';
import EndPage from './EndPage';

const SERVER_URL = "http://localhost:3004";

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

      // toggle show End page,
      showEndPage: false,

      // toggle show steps
      showSteps: false,

      // toggle which loading message we show. this is used for when we are submitting final responses
      wrapup: false,

      policy_ids: [],
      policyData: [],

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
    this.maxSteps = 5;
    this.uuid = uuidv4();



    // binding functions
    this.toggleUserInfoForm = this.toggleUserInfoForm.bind(this);
    this.toggleStartPage = this.toggleStartPage.bind(this);
    this.toggleEndPage = this.toggleEndPage.bind(this);
    this.updateUserInfo = this.updateUserInfo.bind(this);
    this.incrementStep = this.incrementStep.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
    this.toggleWrapUp = this.toggleWrapUp.bind(this);
    this.updatePolicyIDs = this.updatePolicyIDs.bind(this);
    this.pushBackChoices = this.pushBackChoices.bind(this);

  }


  incrementStep(){
    this.setState({
      currentStep : this.state.currentStep + 1
    }, function(){ console.log(this.state.currentStep)})
    if(this.state.currentStep === 0){
      this.toggleShowSteps();
    }
  }

  updatePolicyIDs(ids){
    this.setState({
      policy_ids : ids
    })
  }

  pushBackChoices(selected){
    this.state.userChoices.push(selected);
    console.log(this.state.userChoices);
  }

  toggleShowSteps(){
    this.setState({ showSteps: !this.state.showSteps})
  }

  toggleLoading(state){
    this.setState({ loading: state})
  }

  toggleStartPage(){
    this.setState({ showStartPage: !this.state.showStartPage})
  }

  toggleEndPage(){
    this.setState({ showEndPage: !this.state.showEndPage})
  }

  toggleWrapUp(){
    this.setState({ wrapup: !this.state.wrapup})
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
    // const response = await fetch('https://geolocation-db.com/json/');
    // const data = await response.json();
    // this.setState({ ip: data.IPv4 })
    // // parse query string info
    // const urlSearchParams = new URLSearchParams(window.location.search);
    // const params = Object.fromEntries(urlSearchParams.entries());
    // // only want param mturk
    // if(params['mturk']){
    //   this.mturk = true;
    // }

    // for now we will get the first set of policies on mount
    const response = await axios.get(`${SERVER_URL}/next_query/${this.state.currentStep}`);
    this.updatePolicyIDs(response.data.policy_ids);
    console.log(this.state.policy_ids);

    const csvData = await csv(policy_data_path)
    const cleanedData = await getPolicyData(csvData);
    this.setState({
      policyData: cleanedData
    }, function(){console.log(this.state.policyData)})


  }
  render() {
    return(
      <React.Fragment>
        {/* <h1>Active Preference Elicitation <span role="img" aria-label="crystal ball">🔮</span> </h1> */}
        <TopNavBar/>
        <Container fluid={true} style={{marginTop : "1rem", marginBottom: "10rem"}}>
          
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
              policyData={this.state.policyData}
              policy_ids={this.state.policy_ids}
              currentStep={this.state.currentStep}
              loading={this.state.loading}
              wrapup={this.state.wrapup}
              incrementStep={this.incrementStep}
              toggleLoading={this.toggleLoading}
              toggleWrapUp={this.toggleWrapUp}
              updatePolicyIDs={this.updatePolicyIDs}
            /> : 
            null
          }
          <EndPage showEndPage={this.state.showEndPage}/>
        </Container>
        
        {/* <EndPage></EndPage> */}
        {/* <BottomNavBar></BottomNavBar> */}
      </React.Fragment>
    );
  }
}


export default App;
