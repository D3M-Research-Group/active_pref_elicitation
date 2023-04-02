import React from 'react';
import {
  Nav, Navbar,
  NavbarBrand
} from 'reactstrap';
import ScenarioReminder from './ScenarioReminder';



const TopNavBar = (props) => {
    return (
        <Navbar color="light" light expand="md" style={{paddingLeft: "1.5rem"}}>
          <NavbarBrand href="/">
            {/* TO-DO: Add alert when clicking on this to prevent people leaving accidentally */}
              Active Preference Elicitation <span role="img" aria-label="crystal ball">🔮</span>
            </NavbarBrand>
            <Nav className="justify-content-end" style={{ width: "100%", paddingRight: "1.5rem" }}>
              <ScenarioReminder/>
            </Nav>
        </Navbar>
    );
  }
  
  export default TopNavBar;