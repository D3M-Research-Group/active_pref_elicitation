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
    data %>%
        rowid_to_column("policy_id") %>%
        mutate(policy_id = policy_id - 1) %>% 
        select(-one_of("Parameter")) %>% 
        pivot_longer(-one_of("policy_id"),names_to = "labels", values_to = "values") %>% 
        split(.$policy_id) %>%
        map(~  list(labels = .x$labels, values = .x$values)) %>% 
        write_json(path = glue::glue("COVID/{file}.json"), auto_unbox=T)
    # generate 0-1 normalized data to use in backend
    data  %>% 
        mutate(across(where(is.numeric), rescale01)) %>%
        rowid_to_column("policy_id") %>% 
        mutate(policy_id = policy_id - 1) %>% 
        select(-one_of("Parameter")) %>% 
        pivot_longer(-one_of("policy_id"),names_to = "labels", values_to = "values") %>% 
        split(.$policy_id) %>%
        map(~  list(labels = .x$labels, values = .x$values)) %>% 
        write_json(path = glue::glue("COVID/{file}_rescaled01.json"), auto_unbox=T)
}
 
