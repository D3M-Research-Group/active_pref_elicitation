import axios from 'axios';
import React from 'react';
import * as Constants from "./constants";
import ErrorPage from './ErrorPage';
import Intro from './Intro';
import Loader from "./Loader";
import './PolicyComparisonSection';
import QuestionContainer from './QuestionContainer';

const SERVER_URL = Constants.SERVER_URL;



class PairwiseComparison extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            showError: false,
            selected: -1,
            loading: false,
            wrapup: false,
            showQuestion: true
        }
        // a constant for minimum loading time
        this.waitSecs = Constants.WAIT_SECS;
        // this.loading = this.props.loading
        this.toggleLoading = this.props.toggleLoading;
        this.graphData = this.props.graphData;
        this.policy_ids = this.props.policy_ids;

        // post data
        this.userChoices = this.props.userChoices;
        this.policiesShown = this.props.policiesShown;
        this.timeOnPage = this.props.timeOnPage;
        this.problem_type = this.props.problem_type;
        this.u0_type = this.props.u0_type;
        this.gamma = this.props.gamma;
        this.policyDataSet = this.props.policyDataSet;
        this.userInfo = this.props.userInfo;
        this.uuid = this.props.uuid;

        this.stepNum = this.props.stepNum;
        this.maxSteps = this.props.maxSteps;
        this.updatePolicyIDs=this.props.updatePolicyIDs;
        this.updateStage = this.props.updateStage;
        this.pushBackPolicyShown=this.props.pushBackPolicyShown;
        this.pushBackTimeElapsed=this.props.pushBackTimeElapsed;
        this.pushBackProblemType=this.props.pushBackProblemType;
        this.pushBackU0Type=this.props.pushBackU0Type;
        this.pushBackGamma=this.props.pushBackGamma;
        this.updateRecommendedItem=this.props.updateRecommendedItem;
        console.log("recommended policy", this.props.recommended_policy);
        this.pushBackStage=this.props.pushBackStage;

        this.incrementStep = this.props.incrementStep;

        this.onListChanged = this.onListChanged.bind(this);
        this.updateShowError = this.updateShowError.bind(this);
        this.prepareCardData = this.prepareCardData.bind(this);
        this.createPoliciesShownData = this.createPoliciesShownData.bind(this);
        this.updateQueryInfo = this.updateQueryInfo.bind(this);
        this.postFinalData=this.props.postFinalData;
        this.toggleEndPage = this.props.toggleEndPage;


        // lift up state function
        this.pushBackChoice = this.pushBackChoice.bind(this);
        
        // go to next step or end function
        this.next = this.props.next;

        this.sectionInfo =  [{
          sectionType : "number",
          columnNums: [0,0],
          sectionName: "Life Years Saved",
          sectionDescription: "",
          toolTipText: 'The metric "life years saved" is based on the life expectancies of those that will recover from COVID-19 under a given policy. Policies with higher life years saved values will, in general, save lives that are younger than those with lower life years saved.'
        },{
          sectionType : "plot",
          plotType : "pie",
          columnNums: [1,1],
          sectionName: "Overall Survival Probability",
          sectionDescription: "Among Those Who Contracted COVID-19 and Needed Critical Care",
          toolTipText: ''
        },
        {
            sectionType : "plot",
            plotType : "bar",
            columnNums: [9,14],
            sectionName: "Chance of Receiving Critical Care by Age Group",
            sectionDescription: "Among People Who Need It",
            toolTipText: ''
          },
          {
            sectionType : "plot",
            plotType : "bar",
            columnNums: [2,7],
            sectionName: "Survival Probability",
            sectionDescription: "Chance of Surviving by Age Group",
            toolTipText: ''
          } 
        ]
       

    }

    pushBackChoice(selected){
        this.userChoices.push(selected);
        console.log("userChoices", this.userChoices);
    }

    onListChanged(selected) {
        this.setState({
        selected: selected,
        }, function(){console.log(this.state.selected)});
        this.updateShowError(false);
    }

    updateShowError(show){
        this.setState({
        showError: show
        })
    }

    setStateAsync(state) {
      return new Promise((resolve) => {
        this.setState(state, resolve)
      });
    }

    componentDidMount(){
      this.setState({timeStart: Date.now()}, function(){console.log(this.state.timeStart)})
    }

    async handlePost(){
      await this.setStateAsync({loading: true, wrapup: true});
      this.postFinalData();
      await this.setStateAsync({loading: false, wrapup: false});
      // this.incrementStep();
      // this.toggleEndPage();
    }

    updateQueryInfo(response, timeStart){
      if(this.props.randomize){
        // console.log("original policy_id" , response.data.policy_ids);
        // console.log("original prediction" , response.data.prediction);
        this.props.randomizePolicyids(response.data.policy_ids, response.data.prediction);
        
      } else{
        this.updatePolicyIDs(response.data.policy_ids);
        this.props.pushBackPrediction(response.data.prediction);
      }
      this.pushBackProblemType(response.data.problem_type);
      this.pushBackU0Type(response.data.u0_type);
      this.pushBackGamma(response.data.gamma);
      // this.updateRecommendedItem(response.data.recommended_item);
      // move to next step and update stage for the next step
      this.incrementStep();
      this.updateStage();
      // this.pushBackChoice(this.state.selected);
      this.props.writeStatetoLS();
      while(true){
        if ((Date.now() - timeStart)/1000 > this.waitSecs){
          break;
        }
      }
    }

    createPoliciesShownData(prevChoices=false){
      // map userChoices so we create array with objects
      // that each contain the necessary info so we don't
      // have to do that on the backend
      var choicesInfo;
      // if we randomized the display of choices, then we need to flip the choices and polices
      if(this.props.randomize){
        var policiesShown = [];
        var userChoices = [];
        var predictions = [];

        for(var i=0; i < this.policiesShown.length; i++){
          var policy = [...this.policiesShown[i]]
          const sortedPolicies = [...policy].sort((a,b) => a-b);
          // console.log(policy);
          // console.log(sortedPolicies);
          // use the flipPrediction function now going from 
          // permuted policies -> sorted policies (original policies)
          // and flip our userChoice to match
          // Remember, userChoice is a string and this function needs number, but we want to send string prediction
          // at the end
          const flippedChoice = String(this.props.flipPrediction(policy, sortedPolicies, Number(this.userChoices[i])));
          const flippedPrediction = this.props.flipPrediction(policy, sortedPolicies, this.props.prevPredictions[i]);
          policiesShown[i] = sortedPolicies;
          userChoices[i] = flippedChoice;
          predictions[i] = flippedPrediction;
        }
        if(prevChoices){
          choicesInfo = JSON.stringify({
                  policiesShown: policiesShown,
                  userChoices : userChoices,
                  prevStages: this.props.prevStages,
                  datasetName: this.policyDataSet,
                  nextStage: this.props.nextStage,
                  recommended_item: this.props.recommended_policy,
                  numFirstStage: this.props.numFirstStage
          })
        } else{
          console.log("policiesShown", policiesShown);
          console.log("userChoices", userChoices);
          console.log("predictions", predictions);
          console.log("timeOnPage", this.timeOnPage);
          console.log("problem_type", this.problem_type);
          console.log("u0_type", this.u0_type);
          console.log("gamma", this.gamma);
          choicesInfo = userChoices.map((choice, idx) =>{
            const choiceInfo = {
              session_id: this.uuid,
              question_num: idx+1,
              policy_a: policiesShown[idx][0],
              policy_b: policiesShown[idx][1],
              policy_dataset: this.policyDataSet,
              user_choice: Constants.USER_CHOICES_MAP[choice],
              prediction: Constants.PREDICTIONS_MAP[predictions[idx]],
              // recommended_item: idx === this.props.numFirstStage-1 | idx === this.props.numExploration-1 ? this.props.recommended_policy[this.props.prevStages[idx]] : null,
              recommended_item: this.props.recommended_policy[this.props.prevStages[idx]],
              algorithm_stage: this.props.prevStages[idx],
              time_on_page: this.timeOnPage[idx],
              problem_type: this.problem_type[idx],
              u0_type: this.u0_type[idx],
              gamma: this.gamma[idx],
            }
            return choiceInfo;
          })
        }

        
      } else {
        if(prevChoices){
          choicesInfo = JSON.stringify({
            policiesShown: this.policiesShown,
            userChoices : this.userChoices,
            prevStages: this.props.prevStages,
            datasetName: this.policyDataSet,
            nextStage: this.props.nextStage,
            recommended_item: this.props.recommended_policy,
            numFirstStage: this.props.numFirstStage
          })
        } else {
          choicesInfo = this.userChoices.map((choice, idx) =>{
            // console.log(this.policiesShown[idx][0])
            console.log(this.props.prevStages[idx]);
            const choiceInfo = {
              session_id: this.uuid,
              question_num: idx+1,
              policy_a: this.policiesShown[idx][0],
              policy_b: this.policiesShown[idx][1],
              policy_dataset: this.policyDataSet,
              user_choice: Constants.USER_CHOICES_MAP[choice],
              prediction: Constants.PREDICTIONS_MAP[this.props.prevPredictions[idx]],
              // recommended_item: idx === this.props.numFirstStage-1 | idx === this.props.numExploration-1 ? this.props.recommended_policy[this.props.prevStages[idx]] : null,
              recommended_item: this.props.recommended_policy[this.props.prevStages[idx]],
              algorithm_stage: this.props.prevStages[idx],
              time_on_page: this.timeOnPage[idx],
              problem_type: this.problem_type[idx],
              u0_type: this.u0_type[idx],
              gamma: this.gamma[idx],
            }
            // return JSON.stringify(choiceInfo);
            return choiceInfo;
          })
        }
        
      }
      return choicesInfo;
    }

    submitChoice = async (e) => {
        e.preventDefault();
        if(this.state.selected === ""){
          console.log("somehow got here, but we shouldn't be able to if we have button disabled?")
            // this.setState({
            // showError: true
            // })
            
        } else{
          var timeStart;
          var self = this;
          // time elapsed in seconds. We cap time at 1 hour
          var elapsed_time = Math.min((Date.now() - this.state.timeStart)/1000, 3600000);
          console.log("time elapsed: ", elapsed_time);
            // here we check if our next step will be greater than max steps
            // if so, we will toggle loading and wrapup, push back final choice,
            // post survey data and final choices, toggle loading and wrap up, and finally show the EndPage
            if(this.stepNum + 1 > this.maxSteps){
              
              // push back final query information
              this.pushBackChoice(this.state.selected);
              this.pushBackStage();
              this.updatePolicyIDs(this.policy_ids);
              this.pushBackPolicyShown();
              this.pushBackTimeElapsed(elapsed_time);
              this.pushBackProblemType(this.problem_type[this.problem_type.length -1]); // recycle the last value
              this.pushBackU0Type(this.u0_type[this.u0_type.length-1]); // recycle the last value
              this.pushBackGamma(this.gamma[this.gamma.length-1]); // recycle the last value
              // this.props.writeStatetoLS();

              await this.setStateAsync({loading: true, wrapup: true});
              timeStart= Date.now();
              const sessionInfo = JSON.stringify({
                session_id : this.uuid,
                mturker: this.mturker
              })
              // map userChoices so we create array with objects
              // that each contain the necessary info so we don't
              // have to do that on the backend
              var choicesInfo = this.createPoliciesShownData(false);  
              console.log("choicesInfo:", choicesInfo);

              // need to unpack user info object or just add session_id key to it
              var userFormInfo = this.userInfo;
              userFormInfo['session_id'] = this.uuid;
              userFormInfo['turker_id']= userFormInfo['turker_id'].length === 0 ? null : userFormInfo['turker_id'];
              userFormInfo = JSON.stringify(userFormInfo);
              
              // First try posting the choice info and catch any error
              // Post the choice info
              axios.post(`${SERVER_URL}/choices/`, choicesInfo,
                {
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              ).catch(function(error){
                if(error.response){
                  console.log(error.response.data);
                  console.log(error.response.status);
                  console.log(error.response.headers);
                } else if (error.request) {
                  // The request was made but no response was received
                  console.log(error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  console.log('Error', error.message);
                }
                self.setState({loading: false, wrapup: false, showError: true})
              })
              .then((response) =>{
                // console.log("Choices response", response)
              })
              // If we're able to post the choice info without catching an error and flipping the showError flag
              // then continue with the session info. The same logic follows for user info
              if(!this.state.showError){
                // Post the session info
                axios.post(`${SERVER_URL}/sessioninfo/`, sessionInfo,
                  {
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  }
                ).catch(function(error){
                  if(error.response){
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                  } else if (error.request) {
                    // The request was made but no response was received
                    console.log(error.request);
                  } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                  }
                  self.setState({loading: false, wrapup: false, showError: true})
                })
                .then((response) =>{
                  // console.log("Session info response", response)
                })
              }
              if(!this.state.showError){
                // Post the form info and then show end page
                axios.post(`${SERVER_URL}/forminfo/`, userFormInfo,
                  {
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  }
                ).catch(function(error){
                  if(error.response){
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                  } else if (error.request) {
                    // The request was made but no response was received
                    console.log(error.request);
                  } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                  }
                  self.setState({loading: false, wrapup: false, showError: true})
                })
                .then((response) =>{
                  // console.log("User form info", response)
                  // if we've gotten through everything ok, then let's move on to the End Page
                  while(true){
                    if ((Date.now() - timeStart)/1000 > this.waitSecs){
                      break;
                    }
                  }
                })
              }
              if(!this.state.showError){
                // Post the form info and then show end page
                var memoryWipeFormInfo = this.props.memoryWipeInfo
                memoryWipeFormInfo['session_id'] = this.uuid;
                console.log("memory wipe form info to be posted", memoryWipeFormInfo)
                axios.post(`${SERVER_URL}/memorywipeinfo/`, memoryWipeFormInfo,
                  {
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  }
                ).catch(function(error){
                  if(error.response){
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                  } else if (error.request) {
                    // The request was made but no response was received
                    console.log(error.request);
                  } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                  }
                  self.setState({loading: false, wrapup: false, showError: true})
                })
                .then((response) =>{
                  // console.log("Memory wipe form info", response)
                  // if we've gotten through everything ok, then let's move on to the End Page
                  while(true){
                    if ((Date.now() - timeStart)/1000 > this.waitSecs){
                      break;
                    }
                  }
                  this.setState({loading: false, wrapup: false});
                  this.incrementStep();
                  this.toggleEndPage();
                  this.props.removeStateFromLS();
                })
              }
              
            } else {
              // This is the case where we are still have queries remaining
              // Switch to loading screen
              await this.setStateAsync({loading: true, showQuestion: false});

              // start timing the process
              timeStart = Date.now();

              // add choice variables to top level state
              this.pushBackChoice(this.state.selected);
              this.pushBackStage();
              this.pushBackPolicyShown();
              this.pushBackTimeElapsed(elapsed_time);
              // Don't write state until we've successfully heard back from the server to avoid overcounting responses
              // this.props.writeStatetoLS();
              // this request needs to pass data to the endpoint
              // if we are randomizing the display of policies, we need to reorder them before 
              // sending them back to the backend to avoid Gurobi crashing
              var prevChoices = this.createPoliciesShownData(true);
              

              // we need to check if we are at the end of a stage and make a request for the recommended policy
              // 
              if(this.stepNum === this.props.numFirstStage | this.stepNum === this.props.numExploration){
                axios.post(`${SERVER_URL}/rec_policy/`, prevChoices,
                {
                  headers: {
                    'Content-Type': 'application/json'
                  },
                }
                )
                .then((response) => {
                  console.log("rec_policy_response", response.data)
                  var recommended_policy = response.data.recommended_item;
                  var current_stage = response.data.current_stage;
                  this.updateRecommendedItem(recommended_policy, current_stage);
                  // need to update previous choices with the new recommended item
                  prevChoices = this.createPoliciesShownData(true);
                })
                .then(() => {
                    axios.post(`${SERVER_URL}/next_query/`,prevChoices,
                    {
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      
                    })
                  .then((response) => {
                    console.log(this.props.randomize);
                    this.updateQueryInfo(response, timeStart);
                  })
                  .catch(function(error){
                    if(error.response){
                      console.log(error.response.data);
                      console.log(error.response.status);
                      console.log(error.response.headers);
                    } else if (error.request) {
                      // The request was made but no response was received
                      console.log(error.request);
                    } else {
                      // Something happened in setting up the request that triggered an Error
                      console.log('Error', error.message);
                    }
                    // No matter the reason for the error, we want to show error message here
                    self.setState({loading: false, showError: true})
                  })
                })
              } else {
                
                axios.post(`${SERVER_URL}/next_query/`,prevChoices,
                {
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  
                })
                .then((response) => {
                  console.log(this.props.randomize);
                  this.updateQueryInfo(response, timeStart);
                })
                .catch(function(error){
                  if(error.response){
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                  } else if (error.request) {
                    // The request was made but no response was received
                    // console.log(error.request);
                  } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                  }
                  // No matter the reason for the error, we want to show error message here
                  self.setState({loading: false, showError: true})
                })
              }
              
              
              
              // await this.setStateAsync({loading: false, showQuestion: false})
            }   
        }
    }

    

    prepareCardData(graphData,policy_ids, columnNums){
        var maxVals = []
        var dat = []
        for(var i=0; i < policy_ids.length; i++){
            dat.push(
              {graphData: graphData[policy_ids[i]]}
            );
            // dat[i]['graphData'] = graphData[policy_ids[i]];
            // for each policy take the max of the column values
            maxVals.push(graphData[policy_ids[i]]['values'].slice(columnNums[0], columnNums[1]+1).reduce(
              function(a, b) {return Math.max(a, b);}, 0));
        }
        return {"dat": dat, 
        // "maxYVal": maxVals.reduce(function(a, b) {return Math.max(a, b);}, 0)
        "maxYVal": 1
      };
    }


    render() {
        // cardContents contains title, description, and graph data
        // we will use the policy ids to population the graph data element in cardContents
      return (
        // <div className="column">
        <React.Fragment>
          {this.stepNum === 1 ? <Intro/> : null}
          {/* {this.state.loading ? <Loader loading={this.state.loading} wrapup={this.state.wrapup} /> : null} */}

          {this.state.showError ? <ErrorPage/> : null}
          <Loader loading={this.state.loading} wrapup={this.state.wrapup} />
          {this.state.loading | this.state.showError ? null :
              <QuestionContainer
              stepNum={this.stepNum}
              maxSteps={this.maxSteps}
              sectionInfo={this.sectionInfo}
              // for MemoryWipeForm
              showMemoryWipeForm={this.props.showMemoryWipeForm}
              toggleMemoryWipeForm={this.props.toggleMemoryWipeForm}
              updateMemoryWipeInfo={this.props.updateMemoryWipeInfo}
              writeStatetoLS={this.props.writeStatetoLS}
    
              // For policy comparison section
              graphData={this.graphData}
              policy_ids={this.policy_ids}
              prepareCardData={this.prepareCardData}
              // For navbar
              submitChoice={this.submitChoice}
              onListChanged={this.onListChanged}
              
              />
          }            
        </React.Fragment>
        );
    }
  }

  export default PairwiseComparison;