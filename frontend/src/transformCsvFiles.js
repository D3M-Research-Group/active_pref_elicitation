// read csv and transform into javascript object in long format
// [ label: "col name", value: 32423, policy_id: 1]

import { csv } from 'd3-fetch';
import {nest} from 'd3-collection';
import url from './COVID_and_LAHSA_datasets/COVID/UK_1360beds-25policies.csv';


// const policy_data = csv(url).then((csv) => {

const getPolicyData = async(csv) =>{
    // console.log(csv);
    var groups = nest().key(d => d.Parameter).entries(csv),
    result = groups.map(function(d){
        var obj = d.values[0];
        delete obj['Parameter']
        var values = Object.keys(obj).map(function (key) {
          
            // Exclude Parameter key value 
            // Using obj[key] to retrieve key value
            return Number(obj[key]);
            
        });

        var labels = Object.keys(obj).map(function (key) {
          
            // Exclude Parameter key value 
            // Using obj[key] to retrieve key value
            return key;
            
        });
        return {
            policy_id: d.key,
            values: values,
            labels: labels
        };
  
    });
    return result;
}

export default getPolicyData;
