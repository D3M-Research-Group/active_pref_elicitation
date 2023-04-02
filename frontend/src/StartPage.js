import React from 'react';
import {
    Button, Container
} from 'reactstrap';
import ClearStateModal from './ClearStateModal';

class StartPage extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            showModal: false
        }
        this.nextPage = this.nextPage.bind(this);
        this.toggleShowModal = this.toggleShowModal.bind(this);
    }

    toggleShowModal(){
        this.setState({ showModal: !this.state.showModal},
             function(){console.log("fired!", this.state.showModal)
            })
    }

    nextPage(){
        // hide StartPage
        this.props.toggleStartPage();
        // show UserInfoForm
        this.props.toggleUserInfoForm();
        // this.props.toggleMemoryWipeForm();
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
                    What happens if there isn’t enough medical equipment available to treat every person who gets sick with COVID-19? Who gets an ICU bed? Who receives a ventilator? 
                    <br></br>
                    <br></br>
                    Imagine that you are a healthcare professional working at a hospital during May of 2020 – before the wide-scale availability of vaccines and resources for treating COVID-19. <b style={{"fontWeight":'bold'}}>Your goal is to help determine a set of guidelines at the hospital to decide which patients will receive a bed, ventilator, or other lifesaving treatments in a critical care unit, when there are more patients than available resources.</b>
                    <br></br>
                    <br></br>
                    We have designed an adaptive questionnaire to learn your preferences for how these resources should be allocated. For each question, please choose the policy with the outcomes that you prefer, where the outcomes are based on real data from COVID-19 patients in the UK from April to July 2020. New policy outcomes are displayed after each choice you make and the questionnaire is tailored to ask questions based on your previous choices.
                    <br></br>
                    <br></br>
                    You can start the questionnaire by clicking on the button below. Please take the survey <b style={{"fontWeight":'bold'}}>only once</b>. 
                    Once you've started the questionnaire, <b style={{"fontWeight":'bold'}}>please do not refresh or leave the page</b>. 
                    For the questionnaire to be accepted, please take it only once and complete it in one sitting.
                    
                </p>
                <div>
                    <br></br>
                    <br></br>
                    {this.props.showResumeButton ? 
                        <>
                        <Button
                        color='success'
                        size="lg"
                        type="submit"
                        onClick={this.props.readStatefromLS}> 
                            Resume Questionnaire
                        </Button> {' '}
                        <Button
                        color='danger'
                        size="lg"
                        type="submit"
                        // On click show modal and to double-check they want to clear progress
                        onClick={this.toggleShowModal}> 
                            Clear Questionnaire Progress
                        </Button>
                        {/* <Modal 
                            isOpen={this.state.showModal}
                            toggle={this.toggleShowModal}
                            size="lg"
                            aria-labelledby="contained-modal-title-vcenter"
                            centered
                        >
                            <ModalHeader>
                                Test
                            </ModalHeader>
                        </Modal> */}
                        
                        </> : 
                        <Button
                        color='primary'
                        size="lg"
                        type="submit"
                        onClick={this.nextPage}> 
                            Start Questionnaire
                        </Button>
                        
                    }
                    <ClearStateModal
                        isOpen={this.state.showModal}
                        toggle={this.toggleShowModal}
                        removeStateAndRestart={this.props.removeStateAndRestart}
                    />
                    
                </div>
                </Container>
            </React.Fragment>
            
            
        )
    }
}
export default StartPage;