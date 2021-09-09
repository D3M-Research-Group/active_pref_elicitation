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
        this.incrementStep = this.props.incrementStep;
        this.policyData = this.props.policyData;
        this.policy_ids = this.props.policy_ids;
        this.updatePolicyIDs=this.props.updatePolicyIDs
        this.postFinalData=this.props.postFinalData;
        this.toggleEndPage = this.props.toggleEndPage;

        this.userInfo = this.props.userInfo;
        this.ip = this.props.ip;
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
                    maxSteps={this.maxSteps} 
                    loading={this.loading}
                    toggleLoading={this.toggleLoading}
                    wrapup={this.wrapup}
                    toggleWrapUp={this.toggleWrapUp}
                    toggleEndPage={this.toggleEndPage}
                    userChoices = {this.userChoices}
                    incrementStep={this.incrementStep}
                    graphData={this.policyData}
                    policy_ids={this.policy_ids}
                    stepNum={this.stepNum}
                    updatePolicyIDs={this.updatePolicyIDs}
                    postFinalData={this.postFinalData}
                    
                    userInfo={this.userInfo}
                    ip={this.ip}
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
        this.postFinalData=this.props.postFinalData;

        this.userInfo = this.props.userInfo;
        this.ip = this.props.ip;
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
                                incrementStep={this.incrementStep}
                                policyData={this.policyData}
                                policy_ids={this.policy_ids}
                                sectionNames={this.sectionNames}
                                updatePolicyIDs={this.updatePolicyIDs}
                                postFinalData={this.postFinalData}

                                userInfo={this.userInfo}
                                ip={this.ip}
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