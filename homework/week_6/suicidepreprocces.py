#!/usr/bin/env python
# Name: Fredrik van Veen
# Student number: 10789324
import pandas as pd
import json

INPUT_CSV = 'suicidedataraw.csv'
columns_interest = ['country', 'year', 'sex', 'age', 'suicides_no']


def construct_dataframe(INPUT_CSV, columns_interest):
    """
    Preprocesses and creates dataframe for the columns of interest of csv file.
    """
    # read input csv into dataframe
    df = pd.read_csv(INPUT_CSV)

    # confine dataframe to columns of interest
    df = df[columns_interest]

    # find all rows where year is 2010
    indices_interest = []
    for index, row in df.iterrows():
            if row.year == 2010:
                indices_interest.append(index)

    # confine dataframe to rows of year 2010
    df = df.iloc[indices_interest]
    df = df.reset_index(drop=True)

    # drop all rows containing NaN
    df = df.dropna()

    print(df)
    df.to_json('suicidedata.json', orient='index')


if __name__ == "__main__":
    df = construct_dataframe(INPUT_CSV, columns_interest)
