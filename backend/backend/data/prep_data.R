library(tidyverse)
library(jsonlite)

policy_csvs <- c("UK_500beds-25policies",
                 "UK_1360beds-25policies",
                 "UK_6781beds-25policies")

rescale01 <- function(x) {
    rng <- range(x, na.rm = TRUE)
    (x - rng[1]) / (rng[2] - rng[1])
}

for(file in policy_csvs){
    data <- read_csv(glue::glue("COVID/{file}.csv"))

    data %>% pivot_longer(-one_of("Parameter"),names_to = "labels", values_to = "values") %>% 
        rename(policy_id = Parameter) %>% group_by(policy_id) %>% 
        group_map(.f=function(data,...){
            list(policy_id=...$policy_id, labels=data$labels, values=data$values)
        }) %>%
        write_json(path = glue::glue("COVID/{file}1.json"))
    
}


policy_csvs <- c("AdultHMIS_20210922_preprocessed_final_Robust_edit")

for(file in policy_csvs){
    data <- read_csv(glue::glue("LAHSA/{file}.csv"))
    data %>% pivot_longer(-one_of("Approach"),names_to = "labels", values_to = "values") %>%
        rename(policy_id = Approach) %>% group_by(policy_id) %>%
        group_map(.f=function(data,...){
            list(policy_id=...$policy_id, labels=data$labels, values=data$values)
        }) %>%
        write_json(path = glue::glue("LAHSA/{file}.json"))
    
}
 
