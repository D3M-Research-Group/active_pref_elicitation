import React from 'react';
import {
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
                <p className="lead">
                    The questionnaires are designed to learn your preferences by displaying outcomes
                    of different policies and learning your choices. New policy outcomes are displayed
                    after each choice you make. The questionnaire is tailored to ask
                    questions based on your previous choices.
                    You can start the questionnaire by clicking on the button below. Please take the survey <b style={{"fontWeight":'bold'}}>only once</b>. 
                    Once you've started the questionnaire, <b style={{"fontWeight":'bold'}}>please do not refresh or leave the page</b>. For the survey to be accepted please take it only once and complete it in one sitting.
                    <br></br>
                    <br></br>
                    <br></br>
                    What happens if there isn’t enough medical equipment available to treat every person who gets sick with COVID-19?
                    Who gets an ICU bed? Who gets a ventilator? Our goal is meant to find a set of guidelines to help healthcare providers
                    decide which patients would get a bed, ventilator, or receive other lifesaving treatments in a critical care unit in an
                    <b style={{"fontWeight":'bold'}}> event where there are more patients than necessary resources. </b>
                </p>
                <div>
                    <br></br>
                    <br></br>
                    {this.props.showResumeButton ? 
                        <Button
                        color='success'
                        size="lg"
                        type="submit"
                        onClick={this.props.readStatefromLS}> 
                            Resume Questionnaire
                        </Button> : 
                        <Button
                        color='primary'
                        size="lg"
                        type="submit"
                        onClick={this.nextPage}> 
                            Start Questionnaire
                        </Button>
                    }
                    
                </div>
                </Container>
            </React.Fragment>
            
            
        )
    }
}
export default StartPage;