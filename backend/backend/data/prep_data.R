library(tidyverse)
library(jsonlite)

policy_csvs <- c("UK_500beds-25policies",
                 "UK_1360beds-25policies",
                 "UK_6781beds-25policies")

for(file in policy_csvs){
    data <- read_csv(glue::glue("~/ape_code/backend/backend/data/COVID/{file}.csv"))
    data %>% pivot_longer(-one_of("Parameter"),names_to = "labels", values_to = "values") %>% 
        rename(policy_id = Parameter) %>% group_by(policy_id) %>% 
        group_map(.f=function(data,...){
            list(policy_id=...$policy_id, labels=data$labels, values=data$values)
        }) %>%
        write_json(path = glue::glue("~/ape_code/backend/backend/data/COVID/{file}.json"))
    
}
