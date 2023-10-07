library(tidyverse)
library(jsonlite)

policy_csvs <- c("UK_500beds-25policies",
                 "UK_1360beds-25policies",
                 "UK_6781beds-25policies")

rescale01 <- function(x) {
    rng <- range(x, na.rm = TRUE)
    (x - rng[1]) / (rng[2] - rng[1])
}

# rescaleneg11 <- function(x) {
#     mn <- mean(x, na.rm = TRUE)
#     n <- length(x)
#     std <- sqrt((n-1)/n) * sd(x, na.rm = TRUE)
#     (x - mn) / std
# }

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
  colnames(data)
  #drop columns 
  data <- subset(data,select = -c(NumDatapoints, TreeDepth, BranchingLimit, TimeLimit, SolverStatus, ObjVal,
                                                          MIPGap, SolvingTime, NumBranchingNodes))
  #rename columns
  data <- data %>% rename("Number of Features Used" = "NumBranchingFeatures")
  data <- data %>% rename("Number of Protected Features Used" = "NumProtectedBranchingFeatures")
  data <- data %>% rename("Increased Likelihood of Exiting Homelessness (Overall)" = "ATE")
  data <- data %>% rename("CATE_gender_Transgender" = "CATE_gender_Trans")
  data <- data %>% rename("CATE_age_42-48" = "CATE_age_41-48")
  data <- data %>% rename("CATE_age_49-54" = "CATE_age_48-54")
  data <- data %>% rename("CATE_age_55-84" = "CATE_age_54-84")
  
  # generate 0-1 normalized data to use in backend
  data  %>% 
    mutate(across(where(is.numeric), rescale01)) %>%
    rowid_to_column("policy_id") %>% 
    mutate(policy_id = policy_id - 1) %>% 
    select(-one_of("Approach")) %>% 
    pivot_longer(-one_of("policy_id"),names_to = "labels", values_to = "values") %>% 
    split(.$policy_id) %>%
    map(~  list(labels = .x$labels, values = .x$values)) %>% 
    write_json(path = glue::glue("LAHSA/{file}_rescaled01.json"), auto_unbox=T)
  
  data %>% 
    pivot_longer(-one_of("Approach"),names_to = "labels", values_to = "values") %>%
    rename(policy_id = Approach) %>% group_by(policy_id) %>%
    group_map(.f=function(data,...){list(policy_id=...$policy_id, labels=data$labels, values=data$values)     }) %>%
    write_json(path = glue::glue("LAHSA/{file}1.json"))
  
  #transform features to be displayed in app
  data$`Number of Protected Features Used` = -(data$`Number of Protected Features Used` - 10)
  data$`Number of Features Used` = -(data$`Number of Features Used` - 80)
          
  # generate data to be displayed in app
  data %>%
    rowid_to_column("policy_id") %>%
    mutate(policy_id = policy_id - 1) %>% 
    select(-one_of("Approach")) %>% 
    pivot_longer(-one_of("policy_id"),names_to = "labels", values_to = "values") %>% 
    split(.$policy_id) %>%
    map(~  list(labels = .x$labels, values = .x$values)) %>% 
  write_json(path = glue::glue("LAHSA/{file}.json"), auto_unbox=T)
  }

 
