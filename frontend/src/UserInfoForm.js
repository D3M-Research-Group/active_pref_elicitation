import React from 'react';
import { Formik, Field, Form } from 'formik';
// import 'bootstrap/dist/css/bootstrap.min.css';

// const UserInfoForm = () => {
class UserInfoForm extends React.Component {
    constructor(props){
        super(props);
        this.state = props.initialState
        // this.state ={
        //     name: "",
        //     email: "",
        //     gender: ""

        // }
    }

    validateForm = (values) => {
        const errors = {};
        if (!values.name) {
            errors.name = 'Name is required';
        }
        if (!values.email) {
            errors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
            errors.email = 'Invalid email address';
        }
        if (!values.gender){
            errors.gender = "Gender is required";
        } else if (values.gender === "-1"){
            errors.gender = "Please select one of the options";
        }
        console.log(errors);
        return errors;
    };

    handleChange = ({ target }) => {
        // console.log(target);
        const formValues = this.state;
        formValues[target.name] = target.value;
        this.setState({ formValues });
        const name = target.name;
        const value = target.value;
        this.validateForm(target);
        // update the form values and the error object
        this.props.updateUserInfo({
            formObj: formValues,
            errors: this.validateForm(target)
        });
        console.log(this.validateForm(target));
      };

    render(){
        return (
            <Formik
                enableReinitialize
                initialValues={{ name: this.state.name, email: this.state.email, gender: this.state.gender}}
                onSubmit={(values, { setSubmitting }) => {
                    setTimeout(() => {
                        alert(JSON.stringify(values, null, 2));
                        setSubmitting(false);
                    }, 1000);
                }}
                
                validate={this.validateForm}
            >
                {(formik, isSubmitting) => (
                    <Form id='user-info'>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <Field name="name" 
                            className={(formik.touched.name && formik.errors.name) ? 'form-control is-invalid' : 'form-control'} 
                            type="text"
                            onChange={this.handleChange} 
                            />
                            
                            {formik.touched.name && formik.errors.name ? (
                                <div className="invalid-feedback">{formik.errors.name}</div>
                            ) : null}
                        </div>
    
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <Field name="email"
                             className={(formik.touched.email && formik.errors.email) ? 'form-control is-invalid' : 'form-control'} 
                             type="email" 
                             onChange={this.handleChange}
                             />
                            
                            {formik.touched.email && formik.errors.email ? (
                                <div className="invalid-feedback">{formik.errors.email}</div>
                            ) : null}
                        </div>
    
                        <div className="form-group">
                            <label htmlFor="content">Gender</label>
                            <Field name="gender" 
                            as="select" 
                            multiple={false} 
                            className={(formik.touched.gender && formik.errors.gender) ? 'form-control is-invalid' : 'form-control'}
                            onChange={this.handleChange}
                            >
                                <option defaultValue value="-1"></option>
                                <option value="0">Female</option>
                                <option value="1">Male</option>
                                <option value="2">Other</option>
                            </Field>
                            {formik.touched.gender && formik.errors.gender ? (
                                <div className="invalid-feedback">{formik.errors.gender}</div>
                            ) : null}
                        </div>
    
                        {/* <div className="form-group">
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? "Please wait..." : "Submit"}</button>
                        </div> */}
    
                    </Form>
                )
                }
            </Formik >
        );
    }
    
};


export default UserInfoForm;