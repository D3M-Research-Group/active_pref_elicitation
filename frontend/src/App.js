import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import axios from 'axios';
import ls from 'local-storage';
import {Container} from 'reactstrap';

import StartPage from './StartPage';
import UserInfoForm from './UserInfoForm';
import StepList from './StepGenerator';
import TopNavBar from './TopNavBar';
import EndPage from './EndPage';
import './Card.scss';



// const SERVER_URL = "http://localhost:8000";
const SERVER_URL = "https://api.cais-preference-elicitation.com";

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      // track which step we are on and the choices made so far
      currentStep: 0,
      userChoices : [],
      predictions : [],
      policiesShown: [], // store the policy ids we've seen so far as an array of arrays e.g., [[2,3], [3,4],...]

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

      showResumeButton: false,

      // toggle which loading message we show. this is used for when we are submitting final responses
      wrapup: false,

      // Initially we randomly assign to one of two streams
      // 0: adaptive, 1: fixed
      // Then, once we've gotten our policy of interest, we switch to "evaluation"
      // this info needs to be passed along when we make requests to get next query
      algorithmStage: Math.floor(Math.random()*2) === 0 ? "adaptive" : "random",
      prevStages: [],

      policy_ids: [],
      policyData: [],
      policyDataSet: '',

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
    this.randomize = true;
    this.numExploration = 10;
    this.numValidation = 5;
    this.maxSteps = this.numExploration+this.numValidation;
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
    this.updateStage = this.updateStage.bind(this);
    this.pushBackChoices = this.pushBackChoices.bind(this);
    this.pushBackPrediction = this.pushBackPrediction.bind(this);
    this.pushBackPolicyShown = this.pushBackPolicyShown.bind(this);
    this.pushBackStage = this.pushBackStage.bind(this);
    this.postFinalData = this.postFinalData.bind(this);
    this.writeStatetoLS = this.writeStatetoLS.bind(this);
    this.readStatefromLS = this.readStatefromLS.bind(this);
    this.removeStateFromLS = this.removeStateFromLS.bind(this);
    this.handleUnload = this.handleUnload.bind(this);
    this.randomizePolicyids = this.randomizePolicyids.bind(this);
    this.flipPrediction = this.flipPrediction.bind(this);

  }

  // helper functions for randomizing plots
  arrayEquals(a, b) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }

  flipPrediction(orig_id, permuted_id, prediction){
    if(orig_id[0] === permuted_id[0]){
      return(prediction);
    } else {
      // if the two arrays are not equal, then our values were fliped and we need to
      // flip the prediction
      if(prediction === 1){
        return(-1);
      }
      else if(prediction === -1){
        return(1);
      } else{
        // this handles the validation case where our prediction is "garbage_validation"
        return(prediction)
      }
    }
  }

  shuffle(array){
    var new_array = [...array];;
    let currentIndex = new_array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [new_array[currentIndex], new_array[randomIndex]] = [
        new_array[randomIndex], new_array[currentIndex]];
    }
  
    return new_array;
  }
  // function for randomizing the display of policy ids. Passed down to PairwiseComparison Component
  randomizePolicyids(policy_ids, prediction){
    const shuffled_ids = this.shuffle(policy_ids);
    console.log("randomized policy_id" , shuffled_ids);
    const updatedPrediction = this.flipPrediction(policy_ids, shuffled_ids, prediction);
    
    console.log("flipped prediction" , updatedPrediction);
    this.pushBackPrediction(updatedPrediction);
    this.updatePolicyIDs(shuffled_ids);
  }


  handleUnload(e){
    // if they haven't gotten past the info form, don't save state when they navigate away
    console.log("showEndPage", this.state.showEndPage);
    console.log("userInfo.age", this.state.userInfo.age.length);
    if((this.state.currentStep === 0 && this.state.userInfo.age.length === 0) || this.state.showEndPage){
      this.removeStateFromLS();
    } else {
      this.writeStatetoLS();
    }
    
  }

  writeStatetoLS(){
    ls.set('APE_state', JSON.stringify(this.state))
  }

  readStatefromLS(){
    var loadedState = ls.get('APE_state');
    if (!(loadedState === null)){
      this.setState(JSON.parse(loadedState));
    } 
    
  }

  removeStateFromLS(){
    // console.log(this.state.userInfo.age.length);
    // console.log("removing state")
    ls.remove('APE_state');
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

  updateStage(){
    var stage = this.state.currentStep <= this.numExploration ? this.state.algorithmStage : "validation"
    this.setState({
      algorithmStage : stage
    })
  }

  pushBackPolicyShown(){
    this.state.policiesShown.push(this.state.policy_ids);
  }

  pushBackStage(){
    this.state.prevStages.push(this.state.algorithmStage);
  }

  pushBackPrediction(prediction){
    this.state.predictions.push(prediction);
    console.log(this.state.predictions);
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

    toUpdate = Object.keys(toUpdate).reduce((obj,key) => {
          if(_.isObject(toUpdate[key])){
            obj[key] = toUpdate[key]['value']
          } else{
                obj[key] = toUpdate[key];
          }
        return obj;
      }, {})
    this.setState({
      userInfo: toUpdate
    }, 
    function(){console.log(this.state.userInfo)}
    )
  }

  postFinalData(){
    // TO-DO: add time start and time end?
    const toPostData = JSON.stringify({
      uuid: this.uuid,
      ip: this.state.ip,
      userChoices : this.state.userChoices,
      userInfo : this.state.userInfo
    })
  axios.post(`${SERVER_URL}/user_data`, toPostData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    // console.log(response)
    .then((response) =>{
      console.log(response)
    })
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleUnload);
  }
  
  async componentDidMount() {
    // add listener for when user leaves the page
    window.addEventListener('beforeunload', this.handleUnload);
    // check if state is in local storage
    var loadableState = ls.get('APE_state');
    if(loadableState){
      // check that there is actually any info in the state object
      var state_info = JSON.parse(loadableState);
      console.log(state_info)
      if(state_info['currentStep'] > 0 && state_info['userInfo']['age'].length > 0){
        this.setState({
          showResumeButton: true
        })
      }
      // if we already have data in local storage, don't make requests
    } else {
      
      
      
      // parse query string info
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      // only want param mturk
      if(params['mturk']){
        this.mturk = true;
      }

      // TO-DO: pass which stream a user is in
      const prevChoices = JSON.stringify({
        policiesShown: [],
        userChoices : [],
        prevStages: [this.state.algorithmStage]
      })
      const response = await axios.post(`${SERVER_URL}/next_query/`, prevChoices,{
        headers: {
          'Content-Type': 'application/json'
        }
      })
      // const response = await axios({
      //   method: "POST",
      //   url: `${SERVER_URL}/next_query/`,
      //   data: prevChoices,
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      // })
      

      this.updatePolicyIDs(response.data.policy_ids);
      this.pushBackPrediction(response.data.prediction);
      console.log(response);
      console.log("policy ids shown after async request", this.state.policiesShown);

      // const csvData = await csv(policy_data_path)
      // const cleanedData = await getPolicyData(csvData);
      const datasetName = "COVID";
      const policyDataResponse = await axios({
        method: "GET",
        url: `${SERVER_URL}/dataset?dataset=${datasetName}`
      })
      
      this.setState({
        policyData: policyDataResponse.data.data,
        // policyData: cleanedData,
        policyDataSet: datasetName
      }, function(){
        console.log(this.state.policyData);
        console.log(this.state.policyDataSet);
      })
    }
    
    

    
    

  }
  render() {
    return(
      <React.Fragment>
        <TopNavBar/>
        <Container fluid={true} style={{marginTop : "1rem", marginBottom: "10rem"}}>
          
          <StartPage showStartPage={this.state.showStartPage}
          toggleStartPage={this.toggleStartPage}
          toggleUserInfoForm={this.toggleUserInfoForm}
          readStatefromLS={this.readStatefromLS}
          showResumeButton={this.state.showResumeButton}
          />
          <UserInfoForm showForm={this.state.showUserInfoForm}
          toggleUserInfoForm={this.toggleUserInfoForm} 
          updateUserInfo={this.updateUserInfo}
          incrementStep={this.incrementStep} 
          writeStatetoLS={this.writeStatetoLS}
          />
          {this.state.showSteps ? 
            <StepList 
              key={this.state.currentStep.toString()} // key necessary for ensuring re-render on state change
              userChoices={this.state.userChoices}
              policiesShown={this.state.policiesShown}
              maxSteps={this.maxSteps}
              policyData={this.state.policyData}
              policyDataSet={this.state.policyDataSet}
              policy_ids={this.state.policy_ids}
              currentStep={this.state.currentStep}
              loading={this.state.loading}
              wrapup={this.state.wrapup}
              incrementStep={this.incrementStep}
              toggleLoading={this.toggleLoading}
              toggleWrapUp={this.toggleWrapUp}
              toggleEndPage={this.toggleEndPage}
              updatePolicyIDs={this.updatePolicyIDs}
              updateStage={this.updateStage}
              pushBackPolicyShown={this.pushBackPolicyShown}
              pushBackStage={this.pushBackStage}
              pushBackPrediction={this.pushBackPrediction}
              prevPredictions={this.state.predictions}
              prevStages={this.state.prevStages}
              postFinalData={this.postFinalData}
              writeStatetoLS={this.writeStatetoLS}
              removeStateFromLS={this.removeStateFromLS}
              randomizePolicyids={this.randomizePolicyids}
              flipPrediction={this.flipPrediction}
              randomize={this.randomize}

              userInfo={this.state.userInfo}
              ip={this.state.ip}
              uuid={this.uuid}

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
