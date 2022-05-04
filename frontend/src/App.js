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
import * as Constants from "./constants";
import MemoryWipeForm from './MemoryWipeForm';
import Loader from './Loader';

const SERVER_URL = Constants.SERVER_URL;
const DATASET_NAME = Constants.DATASET_NAME;

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      // track which step we are on and the choices made so far
      currentStep: 0,
      userChoices : [],
      predictions : [],
      timeOnPage: [],
      recommended_policy: {
        'adaptive' : null,
        'random': null
      },
      policiesShown: [], // store the policy ids we've seen so far as an array of arrays e.g., [[2,3], [3,4],...]

      // handle loading screen toggle
      loading: false,

      // toggle show Userinfo form
      showUserInfoForm: false,

      // toggle show MemoryWipeForm form
      showMemoryWipeForm: false,

      // toggle show Start page
      showStartPage: true,

      // show modal in start page for clearing state
      showModal: false,

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
      // algorithmStage: "adaptive",
      nextStage: '',
      prevStages: [],

      policy_ids: [],
      policyData: {},
      policyDataSet: '',

      // metadata
      problem_type: [],
      u0_type: [],
      gamma: [],

      // Memory wipe info
      memoryWipeInfo: {
        question_1: '',
        question_2: '',
        question_3: ''
      },

      // form info
      userInfo: {
        turker_id: '',
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
    
    this.numFirstStage = 10;
    this.numSecondStage = 10;
    this.numExploration = this.numFirstStage + this.numSecondStage;
    this.numValidation = 1;
    this.maxSteps = this.numExploration+this.numValidation;
    // this.maxSteps = this.numFirstStage + this.numSecondStage + this.numValidation;
    this.state.nextStage=this.state.algorithmStage;
    this.uuid = uuidv4();



    // binding functions
    this.toggleUserInfoForm = this.toggleUserInfoForm.bind(this);
    this.toggleMemoryWipeForm = this.toggleMemoryWipeForm.bind(this);
    this.toggleStartPage = this.toggleStartPage.bind(this);
    this.toggleShowModal = this.toggleShowModal.bind(this);
    this.toggleShowSteps = this.toggleShowSteps.bind(this);
    this.toggleEndPage = this.toggleEndPage.bind(this);
    this.updateUserInfo = this.updateUserInfo.bind(this);
    this.updateMemoryWipeInfo = this.updateMemoryWipeInfo.bind(this);
    this.incrementStep = this.incrementStep.bind(this);
    this.toggleMemoryWipeLoading = this.toggleMemoryWipeLoading.bind(this);
    this.toggleWrapUp = this.toggleWrapUp.bind(this);
    this.updatePolicyIDs = this.updatePolicyIDs.bind(this);
    this.updateStage = this.updateStage.bind(this);
    this.pushBackChoices = this.pushBackChoices.bind(this);
    this.pushBackPrediction = this.pushBackPrediction.bind(this);
    this.pushBackPolicyShown = this.pushBackPolicyShown.bind(this);
    this.pushBackTimeElapsed = this.pushBackTimeElapsed.bind(this);
    this.pushBackProblemType = this.pushBackProblemType.bind(this);
    this.pushBackU0Type = this.pushBackU0Type.bind(this);
    this.pushBackGamma = this.pushBackGamma.bind(this);
    this.updateRecommendedItem = this.updateRecommendedItem.bind(this);
    this.pushBackStage = this.pushBackStage.bind(this);
    this.postFinalData = this.postFinalData.bind(this);
    this.writeStatetoLS = this.writeStatetoLS.bind(this);
    this.readStatefromLS = this.readStatefromLS.bind(this);
    this.removeStateFromLS = this.removeStateFromLS.bind(this);
    this.removeStateAndRestart = this.removeStateAndRestart.bind(this);
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
    console.log("userInfo", this.state.userInfo);
    if((this.state.currentStep === 0 && this.state.userInfo.age.length === 0) || this.state.showEndPage){
    // if(this.state.showEndPage){
      console.log("removing state")
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

  removeStateAndRestart(){
    this.removeStateFromLS();
    window.location.reload(false);
  }

  incrementStep(){
    this.setState({
      currentStep : this.state.currentStep + 1
    }, function(){ console.log("Current step:", this.state.currentStep)})
    if(this.state.currentStep === 0){
      this.toggleShowSteps();
    } else if(this.state.currentStep === this.numFirstStage+1){
      this.toggleShowSteps();
      this.toggleMemoryWipeForm();
    }
  }
  
  updatePolicyIDs(ids){
    this.setState({
      policy_ids : ids
    })
  }

  updateStage(){
    var stage;
    var nextStage;
    if(this.state.currentStep <= this.numFirstStage){
      // if we're in the first stage, don't change the algorithm type
      stage = this.state.nextStage;
      if(this.state.currentStep + 1 > this.numFirstStage){
        nextStage = this.state.algorithmStage === "adaptive" ? "random" : "adaptive";
        
      } else {
        nextStage = this.state.algorithmStage;
      }
    } else if( this.state.currentStep > this.numFirstStage & this.state.currentStep <= this.numExploration){
      stage = this.state.nextStage;
      if(this.state.currentStep + 1 > this.numExploration){
        nextStage = "validation";
      } else {
        nextStage = this.state.nextStage;
      }
    } else {
      stage = "validation";
      nextStage = "validation"
    }
    this.setState({
      algorithmStage : stage,
      nextStage: nextStage
    })
  }

  pushBackProblemType(problem){
    this.state.problem_type.push(problem);
  }

  pushBackU0Type(u_zero){
    this.state.u0_type.push(u_zero);
  }

  pushBackGamma(gamma){
    this.state.gamma.push(gamma);
  }

  pushBackTimeElapsed(time){
    this.state.timeOnPage.push(time);
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

  updateRecommendedItem(item, stream){
    const newPolicy_dict = {...this.state.recommended_policy, [stream] : item}
    this.setState({
      recommended_policy: newPolicy_dict
    }, function(){console.log("recommended policy dict", this.state.recommended_policy)})
  }
  pushBackChoices(selected){
    this.state.userChoices.push(selected);
    console.log(this.state.userChoices);
  }

  toggleShowSteps(){
    this.setState({ showSteps: !this.state.showSteps})
  }

  toggleMemoryWipeLoading(){
    this.setState({ loading: !this.state.loading}, function(){ console.log("toggled loading")})
    
  }

  toggleStartPage(){
    this.setState({ showStartPage: !this.state.showStartPage})
  }

  toggleShowModal(){
    this.setState({ showModal: !this.state.showModal})
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

  toggleAlgorithm(){
    this.setState({ algorithmStage: this.state.algorithmStage === "adaptive" ? "random" : "adaptive"})
  }

  toggleMemoryWipeForm(){
    this.setState({ showMemoryWipeForm: !this.state.showMemoryWipeForm})
  }


  updateMemoryWipeInfo(data){
    // remove form errors messages from the object
    var toUpdate = _.omit(data, ["defaultMessage"])

    toUpdate = Object.keys(toUpdate).reduce((obj,key) => {
          if(_.isObject(toUpdate[key])){
            obj[key] = toUpdate[key]['value']
          } else{
                obj[key] = toUpdate[key];
          }
        return obj;
      }, {})
    this.setState({
      memoryWipeInfo: toUpdate
    }, 
    function(){
      console.log(this.state.memoryWipeInfo);
      this.writeStatetoLS();
    }
    )
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
    function(){
      console.log(this.state.userInfo);
      this.writeStatetoLS();
    }
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


  
  async componentDidMount() {
    // check if state is in local storage
    var loadableState = ls.get('APE_state');
    if(loadableState){
      // check that there is actually any info in the state object
      var state_info = JSON.parse(loadableState);
      console.log("loaded state_info", state_info)
      if(state_info['currentStep'] > 0 && state_info['userInfo']['age'].length > 0){
        this.setState({
          showResumeButton: true
        })
      }
      // if we already have data in local storage, don't make requests
    } 
      
    console.log(this.state.algorithmStage);  
      
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
        prevStages: [this.state.algorithmStage],
        datasetName: DATASET_NAME,
        nextStage: this.state.nextStage,
        numFirstStage: this.numFirstStage
      })
      const response = await axios.post(`${SERVER_URL}/next_query/`, prevChoices,{
        headers: {
          'Content-Type': 'application/json'
        }
      })
      

      this.updatePolicyIDs(response.data.policy_ids);
      this.pushBackPrediction(response.data.prediction);
      this.pushBackProblemType(response.data.problem_type);
      this.pushBackU0Type(response.data.u0_type);
      this.pushBackGamma(response.data.gamma);
      // this.updateRecommendedItem(response.data.recommended_item);
      console.log(response);
      console.log("policy ids shown after async request", this.state.policiesShown);

      // const csvData = await csv(policy_data_path)
      // const cleanedData = await getPolicyData(csvData);
      // const datasetName = "COVID";
      const policyDataResponse = await axios({
        method: "GET",
        url: `${SERVER_URL}/dataset?dataset=${DATASET_NAME}`
      })
      
      this.setState({
        policyData: policyDataResponse.data.data,
        // policyData: cleanedData,
        policyDataSet: DATASET_NAME
      }, function(){
        console.log(this.state.policyData);
        console.log(this.state.policyDataSet);
      })
  }
  render() {
    return(
      <React.Fragment>
        <TopNavBar/>
        <Container fluid={true} style={{marginTop : "1rem", marginBottom: "10rem"}}>
          
          <StartPage showStartPage={this.state.showStartPage}
          toggleStartPage={this.toggleStartPage}
          toggleShowModal={this.toggleShowModal}
          toggleUserInfoForm={this.toggleUserInfoForm}
          readStatefromLS={this.readStatefromLS}
          showResumeButton={this.state.showResumeButton}
          showModal={this.state.showModal}
          removeStateAndRestart={this.removeStateAndRestart}
          />
          <UserInfoForm showForm={this.state.showUserInfoForm}
          toggleUserInfoForm={this.toggleUserInfoForm} 
          updateUserInfo={this.updateUserInfo}
          incrementStep={this.incrementStep} 
          writeStatetoLS={this.writeStatetoLS}
          />
          {this.state.loading ? <Loader loading={this.state.loading} wrapup={false}/> : null}
          
          <MemoryWipeForm
          showMemoryWipe={this.state.showMemoryWipeForm}
          toggleMemoryWipeForm={this.toggleMemoryWipeForm}
          toggleShowSteps={this.toggleShowSteps}
          toggleMemoryWipeLoading={this.toggleMemoryWipeLoading}
          updateMemoryWipeInfo={this.updateMemoryWipeInfo}
          writeStatetoLS={this.writeStatetoLS}
          />

          {this.state.showSteps && this.state.currentStep !== this.state.numFirstStage+1 ? 
            <StepList 
              key={this.state.currentStep.toString()} // key necessary for ensuring re-render on state change
              userChoices={this.state.userChoices}
              policiesShown={this.state.policiesShown}
              timeOnPage={this.state.timeOnPage}
              problem_type={this.state.problem_type}
              u0_type={this.state.u0_type}
              gamma={this.state.gamma}
              numFirstStage={this.numFirstStage}
              maxSteps={this.maxSteps}
              policyData={this.state.policyData}
              policyDataSet={this.state.policyDataSet}
              policy_ids={this.state.policy_ids}
              currentStep={this.state.currentStep}
              loading={this.state.loading}
              wrapup={this.state.wrapup}
              incrementStep={this.incrementStep}
              toggleWrapUp={this.toggleWrapUp}
              toggleMemoryWipeForm={this.toggleMemoryWipeForm}
              updateMemoryWipeInfo={this.updateMemoryWipeInfo}
              showMemoryWipeForm={this.state.showMemoryWipeForm}
              toggleEndPage={this.toggleEndPage}
              updatePolicyIDs={this.updatePolicyIDs}
              updateStage={this.updateStage}
              numExploration={this.numExploration}
              algorithmStage={this.state.algorithmStage}
              nextStage={this.state.nextStage}
              pushBackPolicyShown={this.pushBackPolicyShown}
              pushBackTimeElapsed={this.pushBackTimeElapsed}
              pushBackProblemType={this.pushBackProblemType}
              pushBackU0Type={this.pushBackU0Type}
              pushBackGamma={this.pushBackGamma}
              pushBackStage={this.pushBackStage}
              pushBackPrediction={this.pushBackPrediction}
              recommended_policy={this.state.recommended_policy}
              updateRecommendedItem={this.updateRecommendedItem}
              prevPredictions={this.state.predictions}
              prevStages={this.state.prevStages}
              postFinalData={this.postFinalData}
              writeStatetoLS={this.writeStatetoLS}
              removeStateFromLS={this.removeStateFromLS}
              randomizePolicyids={this.randomizePolicyids}
              flipPrediction={this.flipPrediction}
              randomize={this.randomize}

              userInfo={this.state.userInfo}
              memoryWipeInfo={this.state.memoryWipeInfo}
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
