#!/usr/bin/env python
# Name: Fredrik van Veen
# Student number: 10789324
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import scoreatpercentile
import json

# maximum an minimum GDP per capita according to wikipedia
MAXGDP_PER_CAPITA = 61400
MINDP_PER_CAPITA = 243

INPUT_CSV = 'input.csv'
columns_interest = ['Country', 'Region', 'Pop. Density (per sq. mi.)', 'Infant mortality (per 1000 births)','GDP ($ per capita) dollars']


def construct_dataframe(INPUT_CSV, columns_interest):
    """
    Preprocesses and creates dataframe for the columns of interest of csv file.
    """
    # read input csv into dataframe
    df = pd.read_csv(INPUT_CSV)

    # confine dataframe to columns of interest and rename columns for practical use
    df = df[columns_interest]
    df.columns = ['Country', 'Region', 'Density', 'Infant mortality', 'GDP']

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
    df.columns = ['Country', 'Region', 'Density', 'Infant mortality', 'GDP']

    # set columns to correct types
    df['GDP'] =df['GDP'].astype(int)
    df['Density'] =df['Density'].astype(float)
    df['Infant mortality'] =df['Infant mortality'].astype(float)

    # find outliers in GDP column
    delete_indices = []
    for index, row in df.iterrows():
        if row['GDP'] > MAXGDP_PER_CAPITA or row['GDP'] < MINDP_PER_CAPITA:
            delete_indices.append(index)

    # delete all rows with outliers
    for index in delete_indices:
        df = df.drop(index)

    # write preprocessed data to csv-file
    df.to_csv('out.csv', index=False)

    return df


def central_tendency(df, column_to_analyze):
    # compute and print, mean, median, mode and standard deviation
    mean = df[column_to_analyze].mean()
    median = df[column_to_analyze].median()
    mode = df[column_to_analyze].mode()[0]
    std = df[column_to_analyze].std()
    print('Central tendency: mean = {}, median = {}, mode = {}, standard deviation = {}'.format(mean, median, mode, std))

    # plot histogram of columns of interest
    plt.hist(df[column_to_analyze], 50, density=True, facecolor='g', alpha=0.75)
    plt.xlabel(column_to_analyze)
    plt.ylabel('Percentage')
    plt.title(column_to_analyze + '-distribution')
    plt.grid(True)
    plt.show()


def five_number_summary(df, column_to_analyze):
    # compute first quartile, third quartile
    quarter_1 = scoreatpercentile(df[column_to_analyze], 25)
    quarter_3 = scoreatpercentile(df[column_to_analyze], 75)
    median = df[column_to_analyze].median()
    inter_quartile_range = quarter_3 - quarter_1
    lower_fence = quarter_1 - (1.5 * inter_quartile_range)
    upper_fence = quarter_3 + (1.5 * inter_quartile_range)

    # compute list of values which lie within fences
    values_in_fences = []
    for value in df[column_to_analyze]:
        if value > lower_fence and value < upper_fence:
            values_in_fences.append(value)

    # compute max and min of values within fences
    max_in_fences = max(values_in_fences)
    min_in_fences = min(values_in_fences)

    # print the five numbers for the column of interest
    print('Five Number Summary: first quartile =  {}, third quartile = {}, median = {}, min = {}, max = {}'.format(quarter_1, quarter_3, median, min_in_fences, max_in_fences))

    # plot boxplot for column of interest
    plt.boxplot(df[column_to_analyze])
    plt.xlabel('All countries')
    plt.ylabel(column_to_analyze)
    plt.title(column_to_analyze + ' for all countries')
    plt.show()


def write_to_json(INPUT_CSV):
    """
    Transforms the preprocessed csv file, created in construct_dataframe(), into json
    """
    # read parsed csv into dataframe with original column names
    df = pd.read_csv(INPUT_CSV)
    df.columns = columns_interest

    # Set index to country and write json in
    df = df.set_index('Country')
    df.to_json('out.json', orient='index')


if __name__ == "__main__":
    df = construct_dataframe(INPUT_CSV, columns_interest)
    central_tendency(df, 'GDP')
    five_number_summary(df, 'Infant mortality')
    write_to_json('out.csv')
