import React from 'react';
import {
	Col,
	Row,
    Container,
    Button
} from 'reactstrap';

class StartPage extends React.Component {
    constructor(props){
        super(props)
        this.nextPage = this.nextPage.bind(this);
    }

    nextPage(){
        // hide StartPage
        this.props.toggleStartPage();
        // show UserInfoForm
        this.props.toggleUserInfoForm();
    }

    render(){
        if(!this.props.showStartPage){
            return null;
        }

        return(
            
            <React.Fragment>
                <Container>
                <h2>Help make a difference!</h2>
                    <p className="lead">The questionnaires are designed to learn your preferences by displaying outcomes
                    of different policies and learning your choices. New policy outcomes are displayed
                    after each choice you make. The <b>adaptive questionnaire</b> is tailored to ask
                    questions based on your previous choices.
                    You can start  the <b>Adaptive</b> questionnaire by clicking on the button below. Please take the survey <b>only once</b>. Once logged in, <b>please do not log out and log back in again</b>. For the survey to be accepted please take it only once and complete it without logging out and back in.
                    <br></br>
                    <br></br>
                    <br></br>
                    What happens if there isn’t enough medical equipment available to treat every person who gets sick with COVID-19?
                    Who gets an ICU bed? Who gets a ventilator? Our goal is meant to find a set of guidelines to help healthcare providers
                    decide which patients would get a bed, ventilator, or receive other lifesaving treatments in a critical care unit in an
                    <b> event where there are more patients than necessary resources. </b>
                </p>
                {/* Center this */}
                <div>
                    <br></br>
                    <br></br>
                    <Button
                        color='primary'
                        size="lg"
                        type="submit"
                        onClick={this.nextPage}
                    > Start Adaptive Questionnaire
                    </Button>
                </div>
                </Container>
            </React.Fragment>
            
            
        )
    }
}
export default StartPage;