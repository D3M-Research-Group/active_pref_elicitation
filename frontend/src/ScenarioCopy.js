import React from 'react';
import { Col, Row } from 'reactstrap';
import PolicyDataPlot from './PolicyDataPlots';


class ScenarioCopy extends React.Component {
    constructor(props){
        super(props);
        this.key = 1;
        this.plotType="bar";
        this.maxYVal=1;
        this.columnNums = [0,4]
        this.data={
                "labels" : [
                    "Proportion of unhoused population by age group_25-41",
                    "Proportion of  unhoused population by age group_42-48",
                    "Proportion of  unhoused population by age group_49-54",
                    "Proportion of  unhoused population by group_55-84"
                ],
                "values" : [
                    0.28229190164674034,
                    0.2477329122490413,
                    0.23464922174599595,
                    0.23532596435822242
                ]
        }

        this.key2 = 1;
        this.plotType="bar";
        this.maxYVal=1;
        this.columnNums2 = [0,3]
        this.data2={
                "labels" : [
                    "Proportion of unhoused population by gender_Female",
                    "Proportion of  unhoused population by gender_Male",
                    "Proportion of  unhoused population by gender_Transgender",
                ],
                "values" : [
                    0.1939995488382585,
                    0.8015339499210467,
                    0.01
                ]
        }

        this.key3 = 1;
        this.plotType="bar";
        this.maxYVal=1;
        this.columnNums3 = [0,3]
        this.data3={
                "labels" : [
                    "Proportion of unhoused population by race_White",
                    "Proportion of  unhoused population by race_Black",
                    "Proportion of  unhoused population by race_Other",
                ],
                "values" : [
                    0.5697721633205504,
                    0.371080532370855,
                    0.059147304308594634
                ]
        }

    }


    render(){
        return(
            <React.Fragment>
                <h2>Help make a difference!</h2>
                <p className="lead">
                    What happens if there aren't enough housing resources available to support each person that experiences homelessness? Who should receive these scarce resources, including permanent housing?
                </p>
                <p className="lead">
                    In 2022, approximately 580,000 individuals were experiencing homelessness in the United States (The U.S. Department of Housing and Urban Development 2022). Specifically in Los Angeles, California, there were over 69,144 persons experiencing homelessness on any given night in 2022 and only 28,600 housing units for such individuals, the majority of which were already occupied. This resource shortage necessitates a way to prioritize individuals for resources as they become available. However, it is difficult to design such a policy as moral trade-offs must be made between efficiency (e.g., having the most number of individuals exit homelessness) and equity (e.g., giving people resources according to their needs).
                </p>
                <p className="lead">
                    These challenges are further complicated by preexisting disparities. For example, in LA, Black people are four times more represented among those experiencing homelessness than in the general population (LAHSA 2018). Policymakers may prefer to design allocation rules that do not exacerbate inequalities, while others may prefer giving people equal chances. Allocation policies could use an individual’s <b style={{"fontWeight":'bold'}}>protected characteristics</b>, such as <b style={{"fontWeight":'bold'}}>race or ethnicity; gender; or age,</b> in the name of equity, or may not use these characteristics at all, in the name of fairness.
                </p>
                <p className="lead"> Imagine that you are a policymaker deciding how to design policies that allocate scarce resources to those experiencing homelessness. <b style={{"fontWeight":'bold'}}>Your goal is to help determine a set of guidelines to decide who will receive housing resources, when there are more individuals in need than available resources.</b>
                </p>
                <p className="lead">
                    We have designed an adaptive questionnaire to learn your preferences for how these resources should be allocated. For each question, you will be shown a pair of policies. Please choose the policy with the design and performance metrics that you prefer. This information includes:
                    <ol type="1">

                        <li>Number of individuals' characteristics used in the policy (for example, how long since they last lived in permanent stable housing or how many times they have been to the emergency room in the past 6 months)</li>
                        <li>Number of individuals' protected characteristics used in the policy</li>
                        <li>Proportion of people exiting homelessness (overall)</li>
                        <li>Proportion of people exiting homelessness (by race or ethnicity)</li>
                        <li>Proportion of people exiting homelessness (by gender)</li>
                        <li>Proportion of people exiting homelessness (by age)</li>
                    </ol> 
                </p>
                <p className="lead">
                    1. and 2. are related to a policy’s level of  <b style={{"fontWeight":'bold'}}> simplicity</b>. In general, policies that use fewer characteristics may be easier for policymakers to implement and easier for individuals in the system to understand. Specifically, an individual could understand why they did or did not receive a resource. However, simplicity may deteriorate the other performance metrics.               </p>
                <p className="lead">
                3. - 6. are related to a policy’s <b style={{"fontWeight":'bold'}}> efficiency</b> (3.) and <b style={{"fontWeight":'bold'}}> fairness or equity</b> (4. - 6.), estimated using historical data for 22,165 unhoused single adults from 16 communities across the US who exited homelessness between February 2015 and April 2018. The data includes the protected information (race or ethnicity, gender, and age) of the individual and whether they received a housing resource.
                </p>
                <p className="lead">

                 In the graphs below, you can additionally see the proportions of the unhoused population by their age; gender; and race or ethnicity. Please keep this information in mind as you take the questionnaire.

                </p>
                <br></br>
                <br></br>
                {   
                    <Row className="justify-content-center" key={this.key}>
                        <Col lg={"6"} id={1} className="text-center">
                            <h4> Proportion of unhoused population by age group</h4>
                            <PolicyDataPlot key={this.key} plotType={this.plotType} data={this.data} columnNums={this.columnNums}/>
                        </Col>
                        <Col lg={"6"} id={1} className="text-center">
                            <h4> Proportion of unhoused population by gender</h4>
                            <PolicyDataPlot key={this.key2} plotType={this.plotType} data={this.data2} columnNums={this.columnNums2}/>
                        </Col>
                    </Row>

                }
                {
                    <Row className="justify-content-center" key={this.key}>
                        <Col lg={"6"} id={1} className="text-center">
                            <h4> Proportion of unhoused population by race or ethnicity</h4>
                            <PolicyDataPlot key={this.key3} plotType={this.plotType} data={this.data3} columnNums={this.columnNums3}/>
                        </Col>
                    </Row>

                }
                <br></br>
                <br></br>

                <p className="lead">
                    After you select which policy you prefer, new policies are displayed to you. The questionnaire is tailored to ask questions based on your previous choices.
                </p>
                <p className="lead">
                    You can start the questionnaire by clicking on the button below. Please take the survey <b style={{"fontWeight":'bold'}}>only once</b>. 
                    Once you've started the questionnaire, <b style={{"fontWeight":'bold'}}>please do not refresh or leave the page</b>. 
                    For the questionnaire to be accepted, please take it only once and complete it in one sitting.
                    
                </p>
                <br></br>
                Sources: <br></br>
                The U.S. Department of Housing and Urban Development (2022). The 2022 Annual Homelessness Assessment Report (AHAR) to Congress. <br></br>
                LAHSA (2018) Report and Recommendations of the Ad Hoc Committee on Black People Experiencing Homelessness.

                
                
            </React.Fragment>
        )
    }
}

export default ScenarioCopy;