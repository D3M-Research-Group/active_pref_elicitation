import React from 'react';
import Loader from "./Loader";
import BottomNavBar from './NavBar';
import { Container} from 'reactstrap';
import PolicyComparisonSection from './PolicyComparisonSection';
import './PolicyComparisonSection'
import axios from 'axios';
import Intro from './Intro';


const SERVER_URL = "http://localhost:8000";

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
        this.policyDataSet = this.props.policyDataSet;
        this.userInfo = this.props.userInfo;
        this.ip = this.props.ip;
        this.uuid = this.props.uuid;

        this.stepNum = this.props.stepNum;
        this.maxSteps = this.props.maxSteps
        this.updatePolicyIDs=this.props.updatePolicyIDs
        this.pushBackPolicyShown=this.props.pushBackPolicyShown

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
            // get next query
            // this.getNextQuery(this.stepNum, this.state.selected);
            // this.incrementStep();
            // record the choice made
            // console.log(this.state.selected);
            // this.pushBackChoice(this.state.selected);
            
            // here we check if our next step will be greater than max steps
            // if so, we will toggle loading and wrapup, push back final choice,
            // post survey data and final choices, toggle loading and wrap up, and finally show the EndPage
            if(this.stepNum + 1 > this.maxSteps){
              
              // push back final choice and final policies shown
              this.pushBackChoice(this.state.selected);
              this.updatePolicyIDs(this.policy_ids);
              this.pushBackPolicyShown(this.policy_ids);
              this.props.writeStatetoLS();

              this.setState({loading: true, wrapup: true}, () => {
                // const toPostData = JSON.stringify({
                //   uuid: this.uuid,
                //   ip: this.ip,
                //   userChoices : this.userChoices,
                //   userInfo : this.userInfo
                // })

                const sessionInfo = JSON.stringify({
                  session_id : this.uuid,
                  ip_address: this.ip,
                  mturker: this.mturker
                })
                // map userChoices so we create array with objects
                // that each contain the necessary info so we don't
                // have to do that on the backend
                console.log(this.policiesShown);
                const choicesInfo = this.userChoices.map((choice, idx) =>{
                  console.log(this.policiesShown[idx][0])
                  const choiceInfo = {
                    session_id: this.uuid,
                    question_num: idx+1,
                    policy_a: this.policiesShown[idx][0],
                    policy_b: this.policiesShown[idx][1],
                    policy_dataset: this.policyDataSet,
                    user_choice: choice
                  }
                  // return JSON.stringify(choiceInfo);
                  return choiceInfo;
                })
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
                  console.log("Session info resonse", response)
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
              this.setState({loading: true}, () => {
                this.pushBackChoice(this.state.selected);
                this.pushBackPolicyShown(this.policy_ids);
                this.props.writeStatetoLS();
                // this get request needs to pass data to the endpoint
                const prevChoices = JSON.stringify({
                  policiesShown: this.policiesShown,
                  userChoices : this.userChoices
                })

                // axios.get(`${SERVER_URL}/next_query/${this.stepNum}`,
                axios.post(`http://127.0.0.1:8000/next_query/`,prevChoices,
                  {
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    
                  })
                .then((response) => {
                  this.updatePolicyIDs(response.data.policy_ids);
                  this.incrementStep();
                  // this.pushBackChoice(this.state.selected);
                  this.props.writeStatetoLS();
                  
                  this.setState({loading: false});
                })
                .catch((err) => {
                  console.log("got error: ", err.data)
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
            maxVals.push(graphData[policy_ids[i]]['values'].slice(columnNums[0], columnNums[1]).reduce(
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
                      key={index}
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