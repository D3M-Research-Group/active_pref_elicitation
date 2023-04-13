import React from 'react';
import { Col, Row } from 'reactstrap';
import PolicyDataPlot from './PolicyDataPlots';


class ScenarioCopy extends React.Component {
    constructor(props){
        super(props);
        this.key = 1;
        this.plotType="bar";
        this.maxYVal=1;
        this.columnNums = [0,6]
        this.data={
                "labels" : [
                    "Proportion of population diagnosed with COVID-19 by group_16-39",
                    "Proportion of population diagnosed with COVID-19 by group_40-49",
                    "Proportion of population diagnosed with COVID-19 by group_50-59",
                    "Proportion of population diagnosed with COVID-19 by group_60-69",
                    "Proportion of population diagnosed with COVID-19 by group_70-79",
                    "Proportion of population diagnosed with COVID-19 by group_80+"
                ],
                "values" : [
                    0.080027698,
                    0.135819567,
                    0.277178752,
                    0.294885745,
                    0.181818182,
                    0.030270056
                ]
        }

    }


    render(){
        return(
            <React.Fragment>
                <h2>Help make a difference!</h2>
                <p className="lead">
                    What happens if there isn't enough medical equipment available to treat every person who gets sick with COVID-19? Who gets an ICU bed? Who receives a ventilator? 
                </p>
                <p className="lead">
                Imagine that you are a healthcare professional working at a hospital during May of 2020 - before the wide-scale availability of vaccines and resources for treating COVID-19. <b style={{"fontWeight":'bold'}}>Your goal is to help determine a set of guidelines at the hospital to decide which patients will receive a bed, ventilator, or other lifesaving treatments in a critical care unit, when there are more patients than available resources.</b>
                </p>
                <p className="lead">
                    We have designed an adaptive questionnaire to learn your preferences for how these resources should be allocated. For each question, you will be shown a pair of policies. Please choose the policy with the outcomes that you prefer. These outcomes, which tell us the behavior of the policy, if implemented, include:
                    <ol type="1">
                        <li>The total life years saved</li>
                        <li>The proportion of patients that survive</li>
                        <li>The proportion of patients that receive critical care by age group</li>
                        <li>The proportion of patients that survive by age group</li>
                    </ol> 
                </p>
                <p className="lead">
                    These outcomes are based on real data from the UK from April to July 2020 that estimate how many COVID-19 patients would require critical care and a patient's chance of recovering from COVID based on their age. In these policies, an average of 12 out of every 100 patients must go without treatment due to scarce resource availability. In the graph below, you can additionally see the proportions of the population of COVID-19 patients by their age.  Please keep this information in mind as you take the questionnaire.
                </p>

                <br></br>
                <br></br>
                {   
                    <Row className="justify-content-center" key={this.key}>
                        <Col lg={"6"} id={1} className="text-center">
                            <h4> Proportion of population diagnosed<br/>with COVID-19 by age group</h4>
                            <PolicyDataPlot key={this.key} plotType={this.plotType} data={this.data} columnNums={this.columnNums}/>
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
                
                
            </React.Fragment>
        )
    }
}

export default ScenarioCopy;