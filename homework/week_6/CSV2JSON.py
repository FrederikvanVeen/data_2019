#!/usr/bin/env python
# Name: Fredrik van Veen
# Student number: 10789324
import pandas as pd
import json

def write_to_json(INPUT_CSV):
    """
    Transforms the preprocessed csv file, created in construct_dataframe(), into json
    """

    # read parsed csv into dataframe with original column names
    df = pd.read_csv(INPUT_CSV)

    # Set index to country and write json
    df = df.set_index('3code')
    df.to_json('gdp_data_clean.json', orient='index')


if __name__ == "__main__":
    write_to_json('gdp_data_clean.csv')
