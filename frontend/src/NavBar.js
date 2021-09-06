import React, { useState } from 'react';
import {
  Navbar,
  Nav,
  NavItem,
  NavLink,
  Button,
  UncontrolledTooltip
} from 'reactstrap';
import ToggleButtons from './ToggleButtons';



function BottomNavBar(props){
    // take as input an array of section names
    const sectionNames = props.sectionNames;
    const [submitDisabled, setSubmitedDisabled] = useState(true);

    const toggleDisabled = () => setSubmitedDisabled(false);

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
                    <Nav className="mr-auto" navbar>
                    {makeNavItem(sectionNames)}
                    </Nav>
                    <Nav className="ms-auto" navbar>
                        <ToggleButtons 
                            toggleDisabled={toggleDisabled}
                            onSelectChange={props.onSelectChange}
                        >

                        </ToggleButtons>
                        <span id="submitWrapper">
                            <Button 
                                className="bottom_navbar_submit"
                                id="submitButton" 
                                disabled={submitDisabled}
                                onClick={props.submitChoice}
                            >
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