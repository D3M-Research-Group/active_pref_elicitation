import { Steps } from "intro.js-react";
import React from "react";

import "intro.js/introjs.css";

export default class Intro extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            screenX: 0,
            screenY: 0,
            stepsEnabled: true,
            initialStep: 0,
            steps: [
              {
                element: "#container-fluid",
                intro: "Throughout the questionnaire, different policies will be displayed under the headings Policy A and Policy B"
              },
              {
                // element: "#section_2",
                intro: "The outcomes of each policy are displayed in the form of bar and pie charts",
                position: "bottom"
              },
              {
                element: "#section_2_policy_A",
                intro: "This plot shows the outcomes from policy A",
                position: "right"
              },
              {
                element: "#section_2_policy_B",
                intro: "This plot shows the outcomes from policy B",
                position: "left"
              },
              {
                element: "#section_1",
                intro: `We use the metric "life years saved," which is based on the life expectancies of those that will recover from COVID-19 under a given policy. Policies with higher life years saved values will, in general, save lives that are younger than those with lower life years saved.`
              },
            //   {
            //     element: "#section_2",
            //     intro: "The outcomes of each policy are displayed in the form of bar and pie charts"
            //   },
              {
                element: "#sections",
                intro: "Clicking here allows you to jump to the different sections",
                position: "right"
              },
              {
                element: "#choices_button_group",
                intro: "Once you have finished comparing the outcomes of the two policies, click one of the buttons which matches your preference"
              },
              {
                element: "#submitButton",
                intro: "Once you have selected a policy, click here to submit your selection and move to the next policy"
              },
              {
                element: ".title",
                intro: "For your response to be counted, please answer all of the questions. Do not close or refresh this page until instructed to do so."
              }
            ]
          };   
    }
    render() {
        const {
          stepsEnabled,
          steps,
          initialStep
        } = this.state;
    
        return (
            <Steps
              enabled={stepsEnabled}
              steps={steps}
              initialStep={initialStep}
              onExit={this.onExit}
              // onChange={this.getScreenLocation}
              // // onPreventChange={this.scrollTop}
              // onAfterChange={this.keepSpot}
              options={{ hideNext: false,
                disableInteraction: true,
                exitOnOverlayClick: false,
                exitOnEsc: false,
                // scrollToElement: true,
                // scrollPadding: "1px"
              }}
            />
        );
      }
    
    onExit = () => {
    this.setState(() => ({ stepsEnabled: false }));
    };

    getScreenLocation = () => {
      // console.log(window.screenY)
      console.log(this.state.screenY)
      this.setState(() => ({
        screenX: window.screenX,
        screenY: window.screenY,
      }));
      // this.setState({
      //   screenX: window.screenX,
      //   screenY: window.screenY,
      // })
    }

    keepSpot = () => {
      window.scrollTo(this.state.screenX, this.state.screenY)
    }
}