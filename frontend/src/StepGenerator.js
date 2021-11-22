import React from 'react';
import PairwiseComparison from './PairwiseComparison';
import {
    Container
} from 'reactstrap';


class Step extends React.Component{
    constructor(props) {
        super(props)
        this.maxSteps = this.props.maxSteps;
        this.stepNum = this.props.stepNum; // which step is this
        this.currentStep = this.props.currentStep; // which step is the app currently on?
        this.loading = this.props.loading;
        this.toggleLoading = this.props.toggleLoading;
        this.wrapup = this.props.wrapup;
        this.toggleWrapUp = this.props.toggleWrapUp;
        this.userChoices = this.props.userChoices;
        this.policiesShown = this.props.policiesShown;
        this.policyDataSet = this.props.policyDataSet;
        this.incrementStep = this.props.incrementStep;
        this.policyData = this.props.policyData;
        this.policy_ids = this.props.policy_ids;
        this.updatePolicyIDs=this.props.updatePolicyIDs;
        this.updateStage=this.props.updateStage;
        this.pushBackPolicyShown=this.props.pushBackPolicyShown;
        this.pushBackStage=this.props.pushBackStage;
        this.postFinalData=this.props.postFinalData;
        this.toggleEndPage = this.props.toggleEndPage;

        this.userInfo = this.props.userInfo;
        this.uuid = this.props.uuid;
    }

    render() { 
        if(this.currentStep !== this.stepNum ){
            // console.log("I am step "+ this.stepNum+ " and I am hidden." + " the current step is " + this.currentStep);
            return null
        }
        return(
            // <Container fluid={true}>
                <PairwiseComparison
                    // title={this.data['query_title']}
                    key={this.stepNum}
                    maxSteps={this.maxSteps} 
                    loading={this.loading}
                    toggleLoading={this.toggleLoading}
                    wrapup={this.wrapup}
                    toggleWrapUp={this.toggleWrapUp}
                    toggleEndPage={this.toggleEndPage}
                    userChoices = {this.userChoices}
                    policiesShown = {this.policiesShown}
                    policyDataSet = {this.policyDataSet}
                    incrementStep={this.incrementStep}
                    graphData={this.policyData}
                    policy_ids={this.policy_ids}
                    stepNum={this.stepNum}
                    updatePolicyIDs={this.updatePolicyIDs}
                    updateStage = {this.updateStage}
                    prevStages={this.props.prevStages}
                    pushBackPolicyShown={this.pushBackPolicyShown}
                    pushBackStage={this.pushBackStage}
                    postFinalData={this.postFinalData}
                    writeStatetoLS={this.props.writeStatetoLS}
                    removeStateFromLS={this.props.removeStateFromLS}
                    pushBackPrediction={this.props.pushBackPrediction}
                    prevPredictions={this.props.prevPredictions}
                    randomizePolicyids={this.props.randomizePolicyids}
                    flipPrediction={this.props.flipPrediction}
                    randomize={this.props.randomize}
                    
                    userInfo={this.userInfo}
                    uuid={this.uuid}
                    // pass userChoices all the way to PairwiseComparisons and from their lift up state by pushing
                    // choices back to userChoices in App's state

                />
            // </Container>
        );
    }
}

class StepList extends React.Component{
    constructor(props) {
        super(props)
        this.userChoices = this.props.userChoices;
        this.policiesShown = this.props.policiesShown;
        this.policyDataSet = this.props.policyDataSet;
        this.maxSteps = this.props.maxSteps;
        this.choiceData = this.props.choiceData;
        this.currentStep = this.props.currentStep;
        this.loading = this.props.loading;
        this.toggleLoading = this.props.toggleLoading;
        this.wrapup = this.props.wrapup;
        this.toggleWrapUp = this.props.toggleWrapUp;
        this.toggleEndPage = this.props.toggleEndPage;
        this.incrementStep = this.props.incrementStep;
        this.policyData=this.props.policyData;
        this.policy_ids=this.props.policy_ids;
        this.sectionNames=this.props.sectionNames;
        this.updatePolicyIDs=this.props.updatePolicyIDs
        this.updateStage=this.props.updateStage;
        this.pushBackPolicyShown=this.props.pushBackPolicyShown
        this.pushBackStage=this.props.pushBackStage
        this.postFinalData=this.props.postFinalData;

        this.userInfo = this.props.userInfo;
        this.uuid = this.props.uuid;
    }



    render() {
        var numSteps = Array(this.maxSteps).fill().map((element,index) => index+1);
        // var contents = numSteps.map((elem) => {

        //     return (
        //         <Step key={elem.toString()} stepNum={elem} currentStep={this.currentStep}
        //          data={this.choiceData[elem]} loading={this.loading} userChoices={this.userChoices}
        //          incrementStep={this.incrementStep}/>
        //     );
        // });
        return(
            <Container fluid={true}>
                {
                    numSteps.map((elem) => {
                            return (
                            <Step 
                                key={elem.toString()} 
                                maxSteps={this.maxSteps} 
                                stepNum={elem} 
                                currentStep={this.currentStep}
                                loading={this.loading} 
                                toggleLoading={this.toggleLoading} 
                                toggleEndPage={this.toggleEndPage}
                                wrapup={this.wrapup}
                                toggleWrapUp={this.toggleWrapUp}
                                userChoices={this.userChoices}
                                policiesShown = {this.policiesShown}
                                policyDataSet = {this.policyDataSet}
                                incrementStep={this.incrementStep}
                                policyData={this.policyData}
                                policy_ids={this.policy_ids}
                                sectionNames={this.sectionNames}
                                updatePolicyIDs={this.updatePolicyIDs}
                                updateStage={this.updateStage}
                                prevStages={this.props.prevStages}
                                prevPredictions={this.props.prevPredictions}
                                pushBackPolicyShown={this.pushBackPolicyShown}
                                pushBackStage={this.pushBackStage}
                                postFinalData={this.postFinalData}
                                writeStatetoLS={this.props.writeStatetoLS}
                                removeStateFromLS={this.props.removeStateFromLS}
                                pushBackPrediction={this.props.pushBackPrediction}
                                randomizePolicyids={this.props.randomizePolicyids}
                                randomize={this.props.randomize}
                                flipPrediction={this.props.flipPrediction}

                                userInfo={this.userInfo}
                                uuid={this.uuid}
                            /> 
                             );
                    })
                }
            </Container>
        )    
    }
}

export default StepList;