import React from 'react';
import { Field, FieldError, Form } from 'react-jsonschema-form-validation';
import {
	Col,
	FormGroup,
	Label,
	Row,
    Container
} from 'reactstrap';

import { defaultMessage} from './FormErrorMessages';

import './Field.scss';
import './FieldError.scss';
import MemoryWipeSchema from './MemoryWipeFormSchema';
import Submit from './Submit';
import './MemoryWipeForm';
import './Form.css';
import Loader from './Loader';

import { WAIT_SECS } from './constants';

class MemoryWipeForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            formData: {
                question_1: '',
                question_2: '',
                question_3: '',
                defaultMessage
            },
            loading: false,
			success: false,
        }
        this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
        this.waitSecs = WAIT_SECS;
    };
    handleChange(data) {
		this.setState({
			formData: data,
			success: false,
		});
	}

    setStateAsync(state) {
        return new Promise((resolve) => {
          this.setState(state, resolve)
        });
      }

	handleSubmit() {
        this.setState({ loading: true });
        // this.props.toggleMemoryWipeLoading();
        var timeStart = Date.now();
        // lift up form data to App component 
        this.props.updateMemoryWipeInfo(this.state.formData);
        
		// setTimeout(() => {
		// 	this.setState({ loading: false, success: true }, function(){
        //         console.log(this.state.formData);
        //         this.props.writeStatetoLS();
        //         // this.props.toggleMemoryWipeLoading();
        //         this.props.toggleMemoryWipeForm();
        //         this.props.toggleShowSteps();
        //     });
            
		// }, this.waitSecs);
        
        while(true){
            if ((Date.now() - timeStart)/1000 > this.waitSecs){
              break;
            }
        }
        
        
        // save state here so state is at the beginning of the questionnaire
        // console.log(this.state.formData);
        this.props.writeStatetoLS();
        this.setState({ loading: false, success: true }, function(){
            window.scrollTo(0, 0);
            this.props.toggleMemoryWipeForm();
            this.props.toggleShowSteps();
        });
        // this.props.toggleMemoryWipeLoading();
        
        
        
        
	}

	render() {
        if(!this.props.showMemoryWipe){
            return null;
        }

        const {
			formData,
			loading,
			success,
		} = this.state;  

        return(
            <>
            {this.state.loading ? <Loader loading={this.state.loading}/> : null}
            <div style={{display: this.state.loading ? 'none': ''}}>
                <Container>
                    
                <Form
                    data={formData}
                    onChange={this.handleChange}
                    onSubmit={this.handleSubmit}
                    schema={MemoryWipeSchema}
                >
                    <Row className="mb-4">
                        <h3>
                        Please take a few moments to answer the following questions before continuing with the rest of the survey. Please answer them to the best of your ability.
                        </h3>
                    </Row>
                    
                    <Row className="mb-4">
                        <FormGroup>
                            {/* MAKE TEXT INPUT IN-LINE */}
                            <Label style={{width: "100%"}} >A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?</Label>
                            <Col  style={{width: "100%"}} md="8">
                                <Field
                                    name="question_1"
                                    value={formData.question_1}
                                    type="input"
                                    maxLength={80}
                                />
                                <FieldError 
                                errorMessages={{
                                    required: () => formData.defaultMessage

                                }}
                                name="question_1" />
                            </Col>
                            
                        </FormGroup>
                    </Row>
                    <Row className="mb-4">
                        <FormGroup>
                            {/* MAKE TEXT INPUT IN-LINE */}
                            <Label style={{width: "100%"}} >If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?</Label>
                            <Col  style={{width: "100%"}} md="4">
                                <Field
                                    name="question_2"
                                    value={formData.question_2}
                                    type="input"
                                    maxLength={80}
                                    
                                />
                                <FieldError 
                                errorMessages={{
                                    required: () => formData.defaultMessage

                                }}
                                name="question_2" />
                            </Col>
                            
                        </FormGroup>
                    </Row>
                    <Row className="mb-4">
                        <FormGroup>
                            {/* MAKE TEXT INPUT IN-LINE */}
                            <Label style={{width: "100%"}} >In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days for the patch to cover the entire lake, how long would it take for the patch to cover half of the lake?</Label>
                            <Col  style={{width: "100%"}} md="4">
                                <Field
                                    name="question_3"
                                    value={formData.question_3}
                                    type="input"
                                    maxLength={80}
                                />
                                <FieldError 
                                errorMessages={{
                                    required: () => formData.defaultMessage

                                }}
                                name="question_3" />
                            </Col>
                            
                        </FormGroup>
                    </Row>
                    <Row className="mb-4">
                        <Col md="10" className="">
                            <Submit loading={loading} success={success} />
                        </Col>
                    </Row>
                </Form>
                </Container>
                </div>
            </>
        );
    }
}

export default MemoryWipeForm;