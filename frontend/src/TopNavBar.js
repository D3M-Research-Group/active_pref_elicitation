import React, { useState } from 'react';
import {
  Navbar,
  NavbarBrand,
} from 'reactstrap';



const TopNavBar = (props) => {
    return (
        <Navbar color="light" light expand="md" style={{paddingLeft: "1.5rem"}}>
          <NavbarBrand href="/">
            {/* TO-DO: Add alert when clicking on this to prevent people leaving accidentally */}
              Active Preference Elicitation <span role="img" aria-label="crystal ball">🔮</span>
            </NavbarBrand>
        </Navbar>
    );
  }
  
  export default TopNavBar;