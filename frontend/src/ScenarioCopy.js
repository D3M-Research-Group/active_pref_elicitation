import React from 'react';

class ScenarioCopy extends React.Component {


    render(){
        return(
            <React.Fragment>
                <h2>Help make a difference!</h2>
                <p className="lead">
                    What happens if there isn’t enough medical equipment available to treat every person who gets sick with COVID-19? Who gets an ICU bed? Who receives a ventilator?
                </p>
                <p className="lead">
                    Imagine that you are a healthcare professional working at a hospital during May of 2020 – before the wide-scale availability of vaccines and resources for treating COVID-19. <b style={{"fontWeight":'bold'}}>Your goal is to help determine a set of guidelines at the hospital to decide which patients will receive a bed, ventilator, or other lifesaving treatments in a critical care unit, when there are more patients than available resources.</b>
                </p>
                <p className="lead">
                    We have designed an adaptive questionnaire to learn your preferences for how these resources should be allocated. For each question, you will be shown a pair of policies. Please choose the policy with the outcomes that you prefer. These outcomes, which tell us the behavior of the policy, if implemented, include:
                    <ol type="1">
                        <li>The total life years saved</li>
                        <li>A patient’s overall chance of survival</li>
                        <li>A patient’s chance of receiving critical care by age group</li>
                        <li>A patient’s chance of survival by age group</li>
                    </ol> 
                </p>
                <p className="lead">
                    These outcomes are based on real data from the UK from April to July 2020 that estimate how many COVID-19 patients would require critical care and a patient’s chance of recovering from COVID based on their age. In these policies, on average, 12 out of every 100 patients must go without treatment due to scarce resource availability.
                </p>
                <p className="lead">
                    After you select which policy you prefer, new policies are displayed to you. The questionnaire is tailored to ask questions based on your previous choices.
                </p>
                <p className="lead">
                    You can start the questionnaire by clicking on the button below. Please take the survey <b style={{"fontWeight":'bold'}}>only once</b>. 
                    Once you've started the questionnaire, <b style={{"fontWeight":'bold'}}>please do not refresh or leave the page</b>. 
                    For the questionnaire to be accepted, please take it only once and complete it in one sitting.
                    
                </p>
            </React.Fragment>
        )
    }
}

export default ScenarioCopy;