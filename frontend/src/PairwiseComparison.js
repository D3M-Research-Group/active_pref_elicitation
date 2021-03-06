import React from 'react';
import Loader from "./Loader";
import BottomNavBar from './NavBar';
import { Container} from 'reactstrap';
import PolicyComparisonSection from './PolicyComparisonSection';
import './PolicyComparisonSection'
import axios from 'axios';
import Intro from './Intro';
import * as Constants from "./constants";

const SERVER_URL = Constants.SERVER_URL;



class PairwiseComparison extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            showError: false,
            selected: -1,
            loading: false,
            wrapup: false,
        }
        // this.loading = this.props.loading
        this.toggleLoading = this.props.toggleLoading;
        this.graphData = this.props.graphData;
        this.policy_ids = this.props.policy_ids;

        // post data
        this.userChoices = this.props.userChoices;
        this.policiesShown = this.props.policiesShown;
        this.timeOnPage = this.props.timeOnPage;
        this.policyDataSet = this.props.policyDataSet;
        this.userInfo = this.props.userInfo;
        this.uuid = this.props.uuid;

        this.stepNum = this.props.stepNum;
        this.maxSteps = this.props.maxSteps;
        this.updatePolicyIDs=this.props.updatePolicyIDs;
        this.updateStage = this.props.updateStage;
        this.pushBackPolicyShown=this.props.pushBackPolicyShown;
        this.pushBackTimeElapsed=this.props.pushBackTimeElapsed;
        this.updateRecommendedItem=this.props.updateRecommendedItem;
        console.log("recommended policy", this.props.recommended_policy);
        this.pushBackStage=this.props.pushBackStage;

        this.incrementStep = this.props.incrementStep;

        this.onListChanged = this.onListChanged.bind(this);
        this.updateShowError = this.updateShowError.bind(this);
        this.prepareCardData = this.prepareCardData.bind(this);
        this.postFinalData=this.props.postFinalData;
        this.toggleEndPage = this.props.toggleEndPage;


        // lift up state function
        this.pushBackChoice = this.pushBackChoice.bind(this);
        
        // go to next step or end function
        this.next = this.props.next;

        this.sectionInfo = [{
          sectionType : "number",
          columnNums: [7,7],
          sectionName: "Life Years Saved",
          sectionDescription: ""
        },{
          sectionType : "plot",
          plotType : "pie",
          columnNums: [8,8],
          sectionName: "Overall Survival Probability",
          sectionDescription: "Among Those Who Contracted COVID-19 and Needed Critical Care"
        },
        {
            sectionType : "plot",
            plotType : "bar",
            columnNums: [0,5],
            sectionName: "Chance of Receiving Critical Care by Age Group",
            sectionDescription: "Among People Who Need It",
          },
          {
            sectionType : "plot",
            plotType : "bar",
            columnNums: [9,14],
            sectionName: "Survival Probability",
            sectionDescription: "Chance of Surviving by Age Group"
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

    submitChoice = (e) => {
        e.preventDefault();
        if(this.state.selected === ""){
          console.log("somehow got here, but we shouldn't be able to if we have button disabled?")
            // this.setState({
            // showError: true
            // })
            
        } else{
          // timeout after an hour
          var elapsed_time = Math.min((Date.now() - this.state.timeStart)/1000, 3600000);
          console.log("time elapsed: ", elapsed_time);
            // here we check if our next step will be greater than max steps
            // if so, we will toggle loading and wrapup, push back final choice,
            // post survey data and final choices, toggle loading and wrap up, and finally show the EndPage
            if(this.stepNum + 1 > this.maxSteps){
              
              // push back final choice and final policies shown
              this.pushBackChoice(this.state.selected);
              this.pushBackStage();
              this.updatePolicyIDs(this.policy_ids);
              this.pushBackPolicyShown();
              this.pushBackTimeElapsed(elapsed_time);
              this.props.writeStatetoLS();

              this.setState({loading: true, wrapup: true}, () => {
                // const toPostData = JSON.stringify({
                //   uuid: this.uuid,
                //   userChoices : this.userChoices,
                //   userInfo : this.userInfo
                // })

                const sessionInfo = JSON.stringify({
                  session_id : this.uuid,
                  mturker: this.mturker
                })
                // map userChoices so we create array with objects
                // that each contain the necessary info so we don't
                // have to do that on the backend
                console.log(this.policiesShown);
                console.log(this.props.prevStages);
                var choicesInfo;
                // if we randomized the display of choices, then we need to flip the choices and polices
                if(this.props.randomize){
                  var policiesShown = [];
                  var userChoices = [];
                  var predictions = [];

                  for(var i=0; i < this.policiesShown.length; i++){
                    var policy = [...this.policiesShown[i]]
                    const sortedPolicies = [...policy].sort((a,b) => a-b);
                    console.log(policy);
                    console.log(sortedPolicies);
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
                  console.log("policiesShown", policiesShown);
                  console.log("userChoices", userChoices);
                  console.log("predictions", predictions);
                  console.log("timeOnPage", this.timeOnPage);
                  choicesInfo = userChoices.map((choice, idx) =>{
                    // console.log(this.policiesShown[idx][0])
                    console.log(this.props.prevStages[idx]);
                    const choiceInfo = {
                      session_id: this.uuid,
                      question_num: idx+1,
                      policy_a: policiesShown[idx][0],
                      policy_b: policiesShown[idx][1],
                      policy_dataset: this.policyDataSet,
                      user_choice: Constants.USER_CHOICES_MAP[choice],
                      prediction: Constants.PREDICTIONS_MAP[predictions[idx]],
                      recommended_item: idx < this.props.numExploration ? null : this.props.recommended_policy,
                      algorithm_stage: this.props.prevStages[idx],
                      time_on_page: this.timeOnPage[idx]
                    }
                    // return JSON.stringify(choiceInfo);
                    return choiceInfo;
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
                      recommended_item: idx < this.props.numExploration ? null : this.props.recommended_policy,
                      algorithm_stage: this.props.prevStages[idx],
                      time_on_page: this.timeOnPage[idx]
                    }
                    // return JSON.stringify(choiceInfo);
                    return choiceInfo;
                  })
                }
                

                
                console.log("choicesInfo:", choicesInfo);
                // const choicesInfo = JSON.stringify({
                //   session_id: this.uuid,
                //   userChoices : this.userChoices,
                //   policiesShown: this.policiesShown,
                //   policyDataSet: this.policyDataSet
                // })

                // need to unpack user info object or just add session_id key to it
                var userFormInfo = this.userInfo;
                userFormInfo['session_id'] = this.uuid;
                userFormInfo['turker_id']= userFormInfo['turker_id'].length === 0 ? null : userFormInfo['turker_id'];
                userFormInfo = JSON.stringify(userFormInfo);
                
                // Post the choice info
                axios.post(`${SERVER_URL}/choices/`, choicesInfo,
                  {
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  }
                ).then((response) =>{
                  console.log("Choices response", response)
                })

                // Post the session info
                axios.post(`${SERVER_URL}/sessioninfo/`, sessionInfo,
                  {
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  }
                ).then((response) =>{
                  console.log("Session info response", response)
                })
                // Post the form info and then show end page
                axios.post(`${SERVER_URL}/forminfo/`, userFormInfo,
                  {
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  }
                )
                // console.log(response)
                .then((response) =>{
                  console.log("User form info", response)

                  this.setState({loading: false, wrapup: false});
                  this.incrementStep();
                  this.toggleEndPage();
                  this.props.removeStateFromLS();
                })
                  
              })
              
              // this.setState({loading: false, wrapup: false});
              
            } else {
              // Need condition here to check if we are transitioning to validation stage
              // if yes, then we need to update algorithm stage or maybe use algorithm_stage: this.props.prevStages[idx]?
              this.setState({loading: true}, () => {
                // before we send the previous choices to the server, we need to update:
                // selected, current stage, and policy shown
                this.pushBackChoice(this.state.selected);
                this.pushBackStage();
                this.pushBackPolicyShown();
                this.pushBackTimeElapsed(elapsed_time);
                this.props.writeStatetoLS();
                console.log(this.props.prevStages);
                console.log("nextStage", this.props.nextStage);
                // var nextStage = this.props.prevStages.length < this.props.numExploration ? this.props.algorithmStage : "validation";
                // console.log("algorithm", this.props.algorithmStage);
                // console.log("nextStage", nextStage);
                // this request needs to pass data to the endpoint
                // if we are randomizing the display of policies, we need to reorder them before 
                // sending them back to the backend to avoid Gurobi crashing
                var prevChoices = '';
                if(this.props.randomize){
                  var policiesShown = [];
                  var userChoices = [];

                  for(var i=0; i < this.policiesShown.length; i++){
                    var policy = [...this.policiesShown[i]]
                    const sortedPolicies = policy.sort((a,b) => a-b);
                    // use the flipPrediction function now going from 
                    // permuted policies -> sorted policies (original policies)
                    // and flip our userChoice to match
                    // Remember, userChoice is a string and this function needs number, but we want to send string prediction
                    // at the end
                    const flippedChoice = String(this.props.flipPrediction(policy, sortedPolicies, Number(this.userChoices[i])));
                    policiesShown[i] = sortedPolicies;
                    userChoices[i] = flippedChoice;
                  }
                  prevChoices = JSON.stringify({
                    policiesShown: policiesShown,
                    userChoices : userChoices,
                    prevStages: this.props.prevStages,
                    datasetName: this.policyDataSet,
                    nextStage: this.props.nextStage,
                    recommended_item: this.props.recommended_policy
                  })
                } else{
                  prevChoices = JSON.stringify({
                    policiesShown: this.policiesShown,
                    userChoices : this.userChoices,
                    prevStages: this.props.prevStages,
                    datasetName: this.policyDataSet,
                    nextStage: this.props.nextStage,
                    recommended_item: this.props.recommended_policy
                  })
  
                }
                
                // axios.get(`${SERVER_URL}/next_query/${this.stepNum}`,
                axios.post(`${SERVER_URL}/next_query/`,prevChoices,
                  {
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    
                  })
                .then((response) => {
                  console.log(this.props.randomize);
                  if(this.props.randomize){
                    console.log("original policy_id" , response.data.policy_ids);
                    console.log("original prediction" , response.data.prediction);
                    this.props.randomizePolicyids(response.data.policy_ids, response.data.prediction);
                    
                  } else{
                    this.updatePolicyIDs(response.data.policy_ids);
                    this.props.pushBackPrediction(response.data.prediction);
                  }
                  this.updateRecommendedItem(response.data.recommended_item);
                  // move to next step and update stage for the next step
                  this.incrementStep();
                  this.updateStage();
                  // this.pushBackChoice(this.state.selected);
                  this.props.writeStatetoLS();
                  
                  this.setState({loading: false});
                })
                .catch((err) => {
                  console.log("got error: ", err)
                })
              })
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
        return {"dat": dat, "maxYVal": maxVals.reduce(function(a, b) {return Math.max(a, b);}, 0)};
    }


    render() {
        // cardContents contains title, description, and graph data
        // we will use the policy ids to population the graph data element in cardContents
      return (
        // <div className="column">
        <React.Fragment>
          {this.stepNum === 1 ? <Intro/> : null}
          {this.state.loading ? <Loader wrapup={this.state.wrapup} /> : null}

            {this.state.loading ? null : 
            <div>

            <Container id="policy_comparison_container" fluid={false}>

              <h1 className="title">Question {this.stepNum} / {this.maxSteps}</h1>
              {
                this.sectionInfo.map((section, index) => {
                  const prepped_dat = this.prepareCardData(this.graphData, this.policy_ids, section.columnNums);
                  return(
                    <PolicyComparisonSection
                      key={index.toString()}
                      idx_key={index.toString()}
                      plotType={section.plotType}
                      sectionType={section.sectionType}
                      policyData={prepped_dat['dat']}
                      maxYVal={prepped_dat['maxYVal']}
                      sectionNum={index+1}
                      columnNums={section.columnNums}
                      title={section.sectionName}  
                      description={section.sectionDescription}
                    />
                  )
                })
              }
                
            </Container>
            <BottomNavBar 
              sectionNames={this.sectionInfo.map((x)=> x.sectionName)} 
              onSelectChange={this.onListChanged}
              submitChoice={this.submitChoice}
              toggleLoading={this.toggleLoading}
            />
            </div>
            }
            
        </React.Fragment>
        );
    }
  }

  export default PairwiseComparison;