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
    # generate data to be displayed in app
    data %>% pivot_longer(-one_of("Parameter"),names_to = "labels", values_to = "values") %>% 
        rename(policy_id = Parameter) %>% group_by(policy_id) %>% 
        group_map(.f=function(data,...){
            list(policy_id=...$policy_id, labels=data$labels, values=data$values)
        }) %>%
        write_json(path = glue::glue("COVID/{file}.json"))
    # generate 0-1 normalized data to use in backend
    data %>% 
        mutate(across(where(is.numeric), rescale01)) %>%
        pivot_longer(-one_of("Parameter"),names_to = "labels", values_to = "values") %>% 
        rename(policy_id = Parameter) %>% group_by(policy_id) %>% 
        group_map(.f=function(data,...){
            list(policy_id=...$policy_id, labels=data$labels, values=data$values)
        }) %>%
        write_json(path = glue::glue("COVID/{file}_rescaled01.json"))
}
