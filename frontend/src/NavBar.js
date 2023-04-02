import React, { useState } from 'react';
import {
    Button, Nav, Navbar, NavItem,
    NavLink, UncontrolledTooltip
} from 'reactstrap';
import ButtonGroupReactStrap from './ToggleButtonsReactStrap';



function BottomNavBar(props){
    // take as input an array of section names
    const sectionNames = props.sectionNames;
    const [submitDisabled, setSubmitedDisabled] = useState(true);

    const toggleDisabled = (choice) => setSubmitedDisabled(choice);

    const makeNavItem = (sectionNames) =>{
        return(
        sectionNames.map((name, idx) => {
            return(
            <NavItem key={idx + 1}>
                <NavLink key={idx + 1} href={"#section_"+(idx + 1).toString()}>{name}</NavLink>    
            </NavItem>
            )
        }))
    }
  
    return (
        <React.Fragment>
            <Navbar color="light" light expand="md" fixed='bottom' style={{paddingLeft: "1.5rem",paddingRight: "1.5rem"}}>
                {/* <NavbarBrand href="/">reactstrap</NavbarBrand> */}
                    <Nav className="mr-auto" id="sections" navbar>
                    {makeNavItem(sectionNames)}
                    </Nav>
                    <Nav className="ms-auto" navbar>
                        {/* <ToggleButtons 
                            toggleDisabled={toggleDisabled}
                            onSelectChange={props.onSelectChange}
                        >

                        </ToggleButtons> */}
                        <ButtonGroupReactStrap onSelectChange={props.onSelectChange} toggleDisabled={toggleDisabled}/>
                        <span id="submitWrapper">
                            <Button 
                                color="primary"
                                id="submitButton" 
                                disabled={submitDisabled}
                                onClick={props.submitChoice}>
                                Submit Selection
                            </Button>
                        </span>
                        <UncontrolledTooltip placement="top" target="submitWrapper" hidden={!submitDisabled}>
                            Please select an option.
                        </UncontrolledTooltip>
                        
                        
                        
                        
                    
                    </Nav>
            </Navbar>
            
        </React.Fragment>
    );
  }
  
  export default BottomNavBar;