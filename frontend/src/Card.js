import React from 'react';
import BarChart from './BarChart';
import PolicyDataBarChart from './PolicyDataBarChart';
import './Card.scss'

import {
	Col,
	FormGroup,
	Label,
	Row,
    Container
} from 'reactstrap';

class Card extends React.Component {
    
    render() {
      return (<div className="card">{this.props.children}</div>)
    }
  }
  
  class SelectableCard extends React.Component {
  
    render() {
      var isSelected = this.props.selected ? "selected" : "";
      var className = "selectable " + isSelected;
      return (
        <Card>
          <div className={className} onClick={this.props.onClick}>
            {this.props.children}
            <div className="check"><span className="checkmark">✔</span></div>
          </div>
        </Card>
      );
    }
  }
  
  class SelectableTitleCard extends React.Component {
  
    render() {
      var {
        title,
        description,
        selected,
        data
      } = this.props;
      // console.log("card data", data);
      // console.log("policy_id", policy_id);
      if(data.length === 0){
        return (
            <div className="col-sm-4 align-self-center">
              <SelectableCard onClick={this.props.onClick}
                selected={selected}>
                <div className="content">
                  <h1 className="title">{title}</h1>
                  <p className="description">{description}</p>
                  {/* <BarChart data={data}/> */}
                </div>
              </SelectableCard>
            </div>
          
        );
      }
      return (
          <Col lg={{ size: '6'}}>
            <SelectableCard onClick={this.props.onClick}
              selected={selected}>
              <div className="content">
                <h1 className="title">{title}</h1>
                <p className="description">{description}</p>
                <Container fluid={true}>
                  <PolicyDataBarChart data={data}/>
                  <PolicyDataBarChart data={data}/>
                  <PolicyDataBarChart data={data}/>
                  <PolicyDataBarChart data={data}/>
                  <PolicyDataBarChart data={data}/>
                      {/* <div className="col-lg-6" id="chartArea"> */}
                        {/* <BarChart data={data}/> */}
                        {/* <PolicyDataBarChart data={data}/>
                      </div>
                      <div className="col-lg-6" id="chartArea">
                        <PolicyDataBarChart data={data}/>
                     </div>
                     <div className="col-lg-6" id="chartArea">
                        <PolicyDataBarChart data={data}/>
                     </div> */}
                </Container>
                
              </div>
            </SelectableCard>
          </Col>
        
      );
    }
  }
  
  class SelectableCardList extends React.Component {
  
    constructor(props) {
      super(props);
      var selected = props.multiple ? [] : -1;
      var initialState = {
        selected: selected.state
      };
      this.state = initialState;
    }
  
    onItemSelected(index) {

      this.setState((prevState, props) => {
        if (props.multiple) {
          var selectedIndexes = prevState.selected;
          var selectedIndex = selectedIndexes.indexOf(index);
          if (selectedIndex > -1) {
            selectedIndexes.splice(selectedIndex, 1);
            props.onChange(selectedIndexes);
          } else {
            if (!(selectedIndexes.length >= props.maxSelectable)) {
              selectedIndexes.push(index);
              props.onChange(selectedIndexes);
            }
          }
          return {
            selected: selectedIndexes
          };
        } else {
          props.onChange(index);
          return {
            selected: index
          }
        }
      });
    }

    render() {
      var {
        contents,
        multiple,
      } = this.props;
      console.log(contents);
  
      var content = contents.map((cardContent, i) => {
        var {
          title,
          description,
          graphData,
          selected
        } = cardContent;
        var selected = multiple ? this.state.selected.indexOf(i) > -1 : this.state.selected === i;
        return (
          
            <SelectableTitleCard key={i} 
            title={title} description={description} data={graphData}
            // policy_id={policy_id}
            selected={selected} 
            onClick={(e) => this.onItemSelected(i)} />
          
        );
      });
      return (
          <div className="cardlist">
            <div className="row">
            {/* <div class="d-flex flex-row"> */}
              {content.splice(0,content.length-1)}
            </div>
            <div className="d-flex justify-content-center">
            {content[content.length - 1]}

            </div>
          </div>
      );
    }
  }
  

export default SelectableCardList;