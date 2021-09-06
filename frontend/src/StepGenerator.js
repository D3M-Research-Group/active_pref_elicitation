import React from 'react';
import PairwiseComparison from './PairwiseComparison';
import {
	Col,
	FormGroup,
	Label,
	Row,
    Container
} from 'reactstrap';


class Step extends React.Component{
    constructor(props) {
        super(props)
        this.stepNum = this.props.stepNum; // which step is this
        this.currentStep = this.props.currentStep; // which step is the app currently on?
        this.data = this.props.data;
        this.loading = this.props.loading;
        this.userChoices = this.props.userChoices;
        this.incrementStep = this.props.incrementStep;
        this.policyData = this.props.policyData;
        this.policy_ids = this.props.policy_ids;
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
                    title={"TEST"}
                    cardContents={this.data['cardData']}
                    loading={this.loading}
                    userChoices = {this.userChoices}
                    incrementStep={this.incrementStep}
                    graphData={this.policyData}
                    policy_ids={this.policy_ids}
                    stepNum={this.stepNum}
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
        this.incrementStep = this.props.incrementStep;
        this.policyData=this.props.policyData;
        this.policy_ids=this.props.policy_ids;
        this.sectionNames=this.props.sectionNames;
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
                            <Step key={elem.toString()} stepNum={elem} currentStep={this.currentStep}
                             data={this.choiceData[elem-1]} 
                             loading={this.loading} userChoices={this.userChoices}
                             incrementStep={this.incrementStep}
                             policyData={this.policyData}
                             policy_ids={this.policy_ids}
                             sectionNames={this.sectionNames}
                             /> 
                             );
                    })
                }
            </Container>
        )    
    }
}

export default StepList;