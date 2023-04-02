import React from 'react';
import {
    Button, Container
} from 'reactstrap';
import ClearStateModal from './ClearStateModal';
import ScenarioCopy from './ScenarioCopy';

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
                <ScenarioCopy/>
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