#!/usr/bin/env python
# Name: Fredrik van Veen
# Student number: 10789324
import pandas as pd
import json

# maximum an minimum GDP per capita according to wikipedia
MAXGDP_PER_CAPITA = 61400
MINGDP_PER_CAPITA = 243

INPUT_CSV = 'gdpdataraw.csv'
columns_interest = ['Country', 'GDP ($ per capita) dollars']


def construct_dataframe(INPUT_CSV, columns_interest):
    """
    Preprocesses and creates dataframe for the columns of interest of csv file.
    """
    # read input csv into dataframe
    df = pd.read_csv(INPUT_CSV)

    # confine dataframe to columns of interest and rename columns for practical use
    df = df[columns_interest]
    df.columns = ['Country', 'GDP']

    # find all rows with value 'unknown'
    delete_indices = []
    for index, row in df.iterrows():
        for col in df:
            if row[col] == 'unknown':
                delete_indices.append(index)

    # delete al rows with unkown values
    for index in delete_indices:
        df = df.drop(index)

    # drop all rows containing NaN
    df = df.dropna()

    # replace comma's with points
    df = df.apply(lambda x: x.str.replace(',','.'))

    # create dict for GDP withour 'dollar' and as int
    GDP_dict  = {key: 0 for key in range(len(df))}

    index_dict = 0
    # remove 'dollar' for all row in GDP-column
    for index, row in df.iterrows():
        for i in range(len(row['GDP'])):

            # integer ends at first space
            if row['GDP'][i] == ' ':
                space_index = i

                # add GDP as int to dict
                GDP_dict[index_dict] = int(row['GDP'][0:space_index])
                index_dict += 1

    # create new column for GDP without 'dollar', and delete old
    df['GDP_int'] = GDP_dict.values()
    df = df.drop(columns='GDP')

    # rename columns again for practical use
    df.columns = ['Country', 'GDP']

    # set columns to correct types
    df['GDP'] =df['GDP'].astype(int)

    # find outliers in GDP column
    delete_indices = []
    for index, row in df.iterrows():
        if row['GDP'] > MAXGDP_PER_CAPITA or row['GDP'] < MINGDP_PER_CAPITA:
            delete_indices.append(index)

    # delete all rows with outliers
    for index in delete_indices:
        df = df.drop(index)

    # read the csv for countrycodes into dataframe
    df2 = pd.read_csv('countries_codes.csv')
    df2 = df2[["Country","Alpha-3 code"]]

    # create column of countries without space at end
    countries_clean = []
    for index, row in df.iterrows():
        country = row['Country'][0:len(row['Country']) - 1]
        countries_clean.append(country)
    df['Country'] = countries_clean
    df = df.reset_index(drop=True)

    # remove row in df2 if countries not in df1
    indices_keep2 = []
    for index, row in df2.iterrows():
        for country in df.Country:
            if (row.Country == country):
                indices_keep2.append(index)
    df2 = df2.iloc[indices_keep2]
    df2 = df2.reset_index(drop=True)

    # remove row of df1 if country not in df2
    indices_keep = []
    for index, row in df.iterrows():
        for country in df2.Country:
            if (row.Country == country):
                indices_keep.append(index)
    df = df.iloc[indices_keep]
    df = df.reset_index(drop=True)

    # add countrycode column to gdp dataframe
    df["3code"] = df2["Alpha-3 code"]

    # remove unnecessary columns
    df = df[['Country', 'GDP', '3code']]

    fillkeys = []
    for index, row in df.iterrows():
        gdp = row.GDP
        if (gdp < 3500):
            fillkeys.append("HIGH")
        if (gdp >= 3500 and gdp < 7500):
            fillkeys.append('HIGH')
        if (gdp >= 7500 and gdp < 15000):
            fillkeys.append('HIGH')
        if (gdp >= 15000 and gdp < 25000):
            fillkeys.append('HIGH')
        if (gdp >= 25000):
            fillkeys.append('HIGH')

    # add fillkey column
    df['fillKey'] = fillkeys
    df.to_csv('gdpdata.csv')


if __name__ == "__main__":
    df = construct_dataframe(INPUT_CSV, columns_interest)
