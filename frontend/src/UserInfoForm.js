import React from 'react';
import { Field, FieldError, Form } from 'react-jsonschema-form-validation';
import {
	Col,
	FormGroup,
	Label,
	Row,
    Container
} from 'reactstrap';

import { defaultMessage, 
    selectFieldMessage,
    usernameFieldMessage,
    healthcareroleFieldMessage } from './FormErrorMessages';

import './Field.scss';
import './FieldError.scss';
import UserInfoSchema from './UserInfoFormSchema';
import Submit from './Submit';
import Select from './Select';
import './UserInfoForm';


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
                political: '',
                positive_family: '',
                positive_anyone: '',
                healthcare_yn: '',
                healthcare_role: '',
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
                                    name: "18-39",
                                    label: "18-39",
                                    value: "18-39",
                                },{
                                    name: "40-49",
                                    label: "40-49",
                                    value: "40-49",
                                },{
                                    name: "50-59",
                                    label: "50-59",
                                    value: "50-59",
                                },{
                                    name: "60-69",
                                    label: "60-69",
                                    value: "60-69",
                                },{
                                    name: "70-79",
                                    label: "70-79",
                                    value: "70-79",
                                },{
                                    name: "80+",
                                    label: "80+",
                                    value: "80+",
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
					<Label style={{width: "100%"}}>What is your political party affiliation? *</Label>
					<Col style={{width: "100%"}} md="4">
                        <Field
                            className=""
                            component={Select}
                            name="political"
                            isClearable
                            onChange={(newVal, handleFieldChange) => handleFieldChange('political', newVal)}
                            options={[
                                {
                                    name: "Constitution",
                                    label: "Constitution",
                                    value: "Constitution",
                                },{
                                    name: "Democratic",
                                    label: "Democratic",
                                    value: "Democratic",
                                },{
                                    name: "Green",
                                    label: "Green",
                                    value: "Green",
                                },{
                                    name: "Independent",
                                    label: "Independent",
                                    value: "Independent",
                                },{
                                    name: "Libertarian",
                                    label: "Libertarian",
                                    value: "Libertarian",
                                },{
                                    name: "Republican",
                                    label: "Republican",
                                    value: "Republican",
                                },{
                                    name: "Other",
                                    label: "Other",
                                    value: "Other",
                                },{
                                    name: "Prefer not to Answer",
                                    label: "Prefer not to Answer",
                                    value: "Prefer not to Answer",
                                }
                            ]}
                            value={formData.political}
                        />
                        <FieldError
                        errorMessages={{
                            required: () => formData.selectFieldMessage
                        }}
                        name="political" />
                    </Col>
				</FormGroup>

                <FormGroup>
					<Label style={{width: "100%"}}>Do you have family members who tested positive for COVID-19? *</Label>
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
					<Label style={{width: "100%"}} >Do you know anyone (other than family members) who tested positive for COVID-19? *</Label>
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

                <FormGroup>
					<Label style={{width: "100%"}}>Do you work in health care? *</Label>
                    <Col  style={{width: "100%"}} md="4">
                        <Field
                            className=""
                            component={Select}
                            name="healthcare_yn"
                            isClearable
                            onChange={(newVal, handleFieldChange) => handleFieldChange('healthcare_yn', newVal)}
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
                                    name: "Prefer not to Answer",
                                    label: "Prefer not to Answer",
                                    value: "Prefer not to Answer",
                                }
                            ]}
                            value={formData.healthcare_yn}
                        />
                        <FieldError
                        errorMessages={{
                            required: () => formData.selectFieldMessage
                        }}
                        name="healthcare_yn" />
                    </Col>
					
				</FormGroup>

                <FormGroup>
                    <Label style={{width: "100%"}}>If you answered yes to the above question, what is your role? Otherwise enter "N/A".</Label>
                    <Col style={{width: "100%"}} md="4" >
                        <Field className=""
                            name="healthcare_role"
                            value={formData.healthcare_role}
                            type="input"
                            placeholder=""
                        />
                        <FieldError 
                        errorMessages={{
                            required: () => formData.healthcareroleFieldMessage
                        }}
                        name="healthcare_role" />
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