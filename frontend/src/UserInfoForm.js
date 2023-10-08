import React from 'react';
import { Field, FieldError, Form } from 'react-jsonschema-form-validation';
import {
    Col, Container, FormGroup,
    Label,
    Row
} from 'reactstrap';

import {
    defaultMessage, healthcareroleFieldMessage, selectFieldMessage,
    usernameFieldMessage
} from './FormErrorMessages';

import './Field.scss';
import './FieldError.scss';
import './Form.css';
import Select from './Select';
import Submit from './Submit';
import './UserInfoForm';
import UserInfoSchema from './UserInfoFormSchema';


class UserInfoForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            formData: {
                turker_id: '',
                age: '',
                race_ethnicity: '',
                gender: '',
                marital_status: '',
                education: '',
                positive_family: '',
                positive_anyone: '',
                defaultMessage, selectFieldMessage, usernameFieldMessage, healthcareroleFieldMessage
            },
            loading: false,
			success: false,
        }
        this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
    };
    handleChange(data) {
		this.setState({
			formData: data,
			success: false,
		});
	}

    

	handleSubmit() {
		this.setState({ loading: true });
        // lift up form data to App component 
        this.props.updateUserInfo(this.state.formData);
        
		setTimeout(() => {
			this.setState({ loading: false, success: true });
            
		}, 1000);
        this.props.toggleUserInfoForm();
        this.props.incrementStep();
        // save state here so state is at the beginning of the questionnaire
        console.log(this.state.formData);
        this.props.writeStatetoLS();
        
	}

	render() {

        if(!this.props.showForm){
            return null;
        }

        const {
			formData,
			loading,
			success,
		} = this.state;  

        return(
            <Container>
                
            <Form
				data={formData}
				onChange={this.handleChange}
				onSubmit={this.handleSubmit}
				schema={UserInfoSchema}
			>
                <Row className="mb-4">
                <FormGroup>
                    {/* MAKE TEXT INPUT IN-LINE */}
                    <Label style={{width: "100%"}} >Worker ID (Please use the MTurk Worker ID that we use to verify payment)</Label>
                    <Col  style={{width: "100%"}} md="4">
                        <Field
                            name="turker_id"
                            value={formData.turker_id}
                            type="input"
                        />
                        <FieldError 
                        errorMessages={{
                            required: () => formData.usernameFieldMessage
                        }}
                        name="turker_id" />
                    </Col>
                    
                </FormGroup>
                <FormGroup>
                <Label style={{width: "100%"}}>What is your age group? *</Label>
                    <Col style={{width: "100%"}} md="4">
                        <Field
                            className=""
                            component={Select}
                            name="age"
                            isClearable
                            onChange={(newVal, handleFieldChange) => handleFieldChange('age', newVal)}
                            options={[
                                {
                                    name: "18-41",
                                    label: "18-41",
                                    value: "18-41",
                                },{
                                    name: "42-48",
                                    label: "42-48",
                                    value: "42-48",
                                },{
                                    name: "49-54",
                                    label: "49-54",
                                    value: "49-54",
                                },{
                                    name: "55+",
                                    label: "55+",
                                    value: "55+",
                                },{
                                    name: "Prefer not to Answer",
                                    label: "Prefer not to Answer",
                                    value: "Prefer not to Answer",
                                }
                            ]}
                            value={formData.age}
                        />
                        <FieldError 
                        errorMessages={{
                            required: () => formData.selectFieldMessage
                        }}
                        name="age" />
				</Col>	
					
				</FormGroup>

                <FormGroup>
					<Label style={{width: "100%"}}>What is your race/ethnicity? *</Label>
                    <Col style={{width: "100%"}} md="4">
                    <Field
						className=""
						component={Select}
						name="race_ethnicity"
						isClearable
						onChange={(newVal, handleFieldChange) => handleFieldChange('race_ethnicity', newVal)}
						options={[
							{
								name: "American Indian or Alaska Native",
								label: "American Indian or Alaska Native",
								value: "American Indian or Alaska Native",
							},{
								name: "Asian",
								label: "Asian",
								value: "Asian",
							},{
								name: "Black or African American",
								label: "Black or African American",
								value: "Black or African American",
							},{
								name: "Hispanic or Latino",
								label: "Hispanic or Latino",
								value: "Hispanic or Latino",
							},{
								name: "Multiracial",
								label: "Multiracial",
								value: "Multiracial",
							},{
								name: "Native Hawaiian or Other Pacific Islander",
								label: "Native Hawaiian or Other Pacific Islander",
								value: "Native Hawaiian or Other Pacific Islander",
							},{
								name: "White",
								label: "White",
								value: "White",
							},{
								name: "Prefer not to Answer",
								label: "Prefer not to Answer",
								value: "Prefer not to Answer",
							}
                            
						]}
						value={formData.race_ethnicity}
					/>
					<FieldError 
                    errorMessages={{
                        required: () => formData.selectFieldMessage
                    }}
                    name="race_ethnicity" />
                    </Col>
					
				</FormGroup>

                <FormGroup>
					<Label style={{width: "100%"}}>What is your gender? *</Label>
                    < Col style={{width: "100%"}} md="4"> 
                        <Field
                            className=""
                            component={Select}
                            name="gender"
                            isClearable
                            onChange={(newVal, handleFieldChange) => handleFieldChange('gender', newVal)}
                            options={[
                                {
                                    name: "Female",
                                    label: "Female",
                                    value: "Female",
                                },{
                                    name: "Male",
                                    label: "Male",
                                    value: "Male",
                                },{
                                    name: "Other",
                                    label: "Other",
                                    value: "Other",
                                },{
                                    name: "Prefer not to answer",
                                    label: "Prefer not to answer",
                                    value: "Prefer not to answer",
                                }
                            ]}
                            value={formData.gender}
                        />
                        <FieldError
                        errorMessages={{
                            required: () => formData.selectFieldMessage
                        }}
                        name="gender" />   
                    </Col>
					
				</FormGroup>

                <FormGroup>
					<Label style={{width: "100%"}}>What is your marital status? *</Label>
                    <Col style={{width: "100%"}} md="4">
                        <Field
                            className=""
                            component={Select}
                            name="marital_status"
                            isClearable
                            onChange={(newVal, handleFieldChange) => handleFieldChange('marital_status', newVal)}
                            options={[
                                {
                                    name: "Single (Never Married)",
                                    label: "Single (Never Married)",
                                    value: "Single (Never Married)",
                                },{
                                    name: "Married",
                                    label: "Married",
                                    value: "Married",
                                },{
                                    name: "Divorced",
                                    label: "Divorced",
                                    value: "Divorced",
                                },{
                                    name: "Widowed",
                                    label: "Widowed",
                                    value: "Widowed",
                                },{
                                    name: "Other",
                                    label: "Other",
                                    value: "Other",
                                },{
                                    name: "Prefer not to answer",
                                    label: "Prefer not to answer",
                                    value: "Prefer not to answer",
                                }
                            ]}
                            value={formData.marital_status}
                        />
                        <FieldError
                        errorMessages={{
                            required: () => formData.selectFieldMessage
                        }}
                        name="marital_status" />
                    </Col>
					
				</FormGroup>

                <FormGroup>
					<Label style={{width: "100%"}}>What is the highest degree or level of school you have completed? *</Label>
                    <Col style={{width: "100%"}} md="4">
                        <Field
                            className=""
                            component={Select}
                            name="education"
                            isClearable
                            onChange={(newVal, handleFieldChange) => handleFieldChange('education', newVal)}
                            options={[
                                {
                                    name: "No schooling completed",
                                    label: "No schooling completed",
                                    value: "No schooling completed",
                                },{
                                    name: "Nursery school to 8th grade",
                                    label: "Nursery school to 8th grade",
                                    value: "Nursery school to 8th grade",
                                },{
                                    name: "Some high school, no diploma",
                                    label: "Some high school, no diploma",
                                    value: "Some high school, no diploma",
                                },{
                                    name: "High school graduate, diploma or the equivalent (for example: GED)",
                                    label: "High school graduate, diploma or the equivalent (for example: GED)",
                                    value: "High school graduate, diploma or the equivalent (for example: GED)",
                                },{
                                    name: "Some college credit, no degree",
                                    label: "Some college credit, no degree",
                                    value: "Some college credit, no degree",
                                },{
                                    name: "Trade/technical/vocational training",
                                    label: "Trade/technical/vocational training",
                                    value: "Trade/technical/vocational training",
                                },{
                                    name: "Associate degree",
                                    label: "Associate degree",
                                    value: "Associate degree",
                                },{
                                    name: "Bachelor’s degree",
                                    label: "Bachelor’s degree",
                                    value: "Bachelor’s degree",
                                },{
                                    name: "Master's degree",
                                    label: "Master's degree",
                                    value: "Master's degree",
                                },{
                                    name: "Professional degree",
                                    label: "Professional degree",
                                    value: "Professional degree",
                                },{
                                    name: "Doctorate degree",
                                    label: "Doctorate degree",
                                    value: "Doctorate degree",
                                },{
                                    name: "Prefer not to Answer",
                                    label: "Prefer not to Answer",
                                    value: "Prefer not to Answer",
                                }
                            ]}
                            value={formData.education}
                        />
                        <FieldError
                        errorMessages={{
                            required: () => formData.selectFieldMessage
                        }}
                        name="education" />
                    </Col>
					
				</FormGroup>

                <FormGroup>
					<Label style={{width: "100%"}}>Have you or a family member ever experienced homelessness? *</Label>
					<Col  style={{width: "100%"}} md="4">
                        <Field
                            className=""
                            component={Select}
                            name="positive_family"
                            isClearable
                            onChange={(newVal, handleFieldChange) => handleFieldChange('positive_family', newVal)}
                            options={[
                                {
                                    name: "Yes",
                                    label: "Yes",
                                    value: "Yes",
                                },{
                                    name: "No",
                                    label: "No",
                                    value: "No",
                                },{
                                    name: "Unsure",
                                    label: "Unsure",
                                    value: "Unsure",
                                },{
                                    name: "Prefer not to Answer",
                                    label: "Prefer not to Answer",
                                    value: "Prefer not to Answer",
                                }
                            ]}
                            value={formData.positive_family}
                        />
                        <FieldError
                        errorMessages={{
                            required: () => formData.selectFieldMessage
                        }}
                        name="positive_family" />
                    </Col>
				</FormGroup>

                <FormGroup>
					<Label style={{width: "100%"}} >Do you know anyone (other than yourself or family members) who has experienced homelessness? *</Label>
                    <Col style={{width: "100%"}} md="4">
                        <Field
                            className=""
                            component={Select}
                            name="positive_anyone"
                            isClearable
                            onChange={(newVal, handleFieldChange) => handleFieldChange('positive_anyone', newVal)}
                            options={[
                                {
                                    name: "Yes",
                                    label: "Yes",
                                    value: "Yes",
                                },{
                                    name: "No",
                                    label: "No",
                                    value: "No",
                                },{
                                    name: "Unsure",
                                    label: "Unsure",
                                    value: "Unsure",
                                },{
                                    name: "Prefer not to Answer",
                                    label: "Prefer not to Answer",
                                    value: "Prefer not to Answer",
                                }
                            ]}
                            value={formData.positive_anyone}
                        />
                        <FieldError
                        errorMessages={{
                            required: () => formData.selectFieldMessage
                        }}
                        name="positive_anyone" />
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
        );
    }
}

export default UserInfoForm;