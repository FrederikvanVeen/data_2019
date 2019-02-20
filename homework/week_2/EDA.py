import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import scoreatpercentile
import json


# maximum an minimum GDP per capita according to wikipedia
MAXGDP_PER_CAPITA = 61400
MINDP_PER_CAPITA = 243
INPUT_CSV = 'input.csv'
collumns_interest = ['Country', 'Region', 'Pop. Density (per sq. mi.)', 'Infant mortality (per 1000 births)','GDP ($ per capita) dollars']

def construct_dataframe(INPUT_CSV, collumns_interest):

    # read input csv into dataframe
    df = pd.read_csv(INPUT_CSV)

    # confine dataframe to collumns of interest and rename collumns for practical use
    df = df[collumns_interest]
    df.columns = ['Country', 'Region', 'Density', 'InfantMortality', 'GDP']

    # find all rows with value 'unknown'
    delete_indices = []
    for index, row in df.iterrows():
        for col in df:
            if row[col] == 'unknown':
                delete_indices.append(index)

    # delete al rows with unkown values
    for index in delete_indices:
        df = df.drop(index)

    # drop all rows with NaN
    df = df.dropna()

    # replace comma's with points
    df = df.apply(lambda x: x.str.replace(',','.'))

    # create dict for GDP withour 'dollar' and as int
    GDP_dict  = {key: 0 for key in range(len(df))}

    index_i = 0
    for index, row in df.iterrows():
        for i in range(len(row['GDP'])):
            if row['GDP'][i] == ' ':
                space_index = i
                GDP_dict[index_i] = int(row['GDP'][0:space_index])
                index_i += 1
                # print(i)
                # print(row['GDP'][0:i])
                # df.set_value(index,'GDP', row['GDP'][0:i])

    # create new column for GDP without 'dollar', and delete old
    df['GDP_int'] = GDP_dict.values()
    df = df.drop(columns='GDP')

    # rename collumns again for practical use
    df.columns = ['Country', 'Region', 'Density', 'InfantMortality', 'GDP']


    # set collumns to correct types
    df['GDP'] =df['GDP'].astype(int)
    df['Density'] =df['Density'].astype(float)
    df['InfantMortality'] =df['InfantMortality'].astype(float)

    # check for outliers in GDP
    delete_indices = []
    for index, row in df.iterrows():
        if row['GDP'] > MAXGDP_PER_CAPITA or row['GDP'] < MINDP_PER_CAPITA:
            delete_indices.append(index)

    # delete all rows with outliers
    for index in delete_indices:
        df = df.drop(index)

    # write csv-file
    df.to_csv('out.csv', index=False)

    return df


def central_tedency(df, collumn_to_analyze):
    # compute and print, mean, median, mode and standard deviation
    mean = df[collumn_to_analyze].mean()
    median = df[collumn_to_analyze].median()
    mode = df[collumn_to_analyze].mode()[0]
    std = df[collumn_to_analyze].std()
    print('Central Tedency produces mean: {}, median: {}, mode: {}, standard deviation: {}'.format(mean, median, mode, std))

    # plot histogram of collumns of interest
    plt.hist(df[collumn_to_analyze], 50, density=True, facecolor='g', alpha=0.75)
    plt.xlabel(collumn_to_analyze)
    plt.ylabel('Percentage')
    plt.title(collumn_to_analyze + '-distribution')
    plt.grid(True)
    plt.show()


def five_number_summary(df, collumn_to_analyze):
    # compute first quartile, third quartile
    quarter_1 = scoreatpercentile(df[collumn_to_analyze], 25)
    quarter_3 = scoreatpercentile(df[collumn_to_analyze], 75)
    median = df[collumn_to_analyze].median()
    inter_quartile_range = quarter_3 - quarter_1
    lower_fence = quarter_1 - (1.5 * inter_quartile_range)
    upper_fence = quarter_3 + (1.5 * inter_quartile_range)

    # compute list of values which lie within fences
    values_in_fences = []
    for value in df[collumn_to_analyze]:
        if value > lower_fence and value < upper_fence:
            values_in_fences.append(value)

    # compute max and min of values within fences
    max_in_fences = max(values_in_fences)
    min_in_fences = min(values_in_fences)

    # print the five numbers for the collumn of interest
    print('Five Number Summary produces first quartile: {}, third quartile: {}, median: {}, min: {}, max: {}'.format(quarter_1, quarter_3, median, min_in_fences, max_in_fences))

    # plot boxplot for collumn of interest
    plt.boxplot(df[collumn_to_analyze])
    plt.xlabel(collumn_to_analyze)
    plt.ylabel('Percentage')
    plt.title(collumn_to_analyze + '-distribution')
    plt.show()

def write_to_json(INPUT_CSV):
    df = pd.read_csv(INPUT_CSV)
    df.columns = collumns_interest
    df = df.set_index('Country')
    df.to_json('out.json', orient='index')

if __name__ == "__main__":
    # create preprocessed dataframe for collumns of interest input csv
    df = construct_dataframe(INPUT_CSV, collumns_interest)
    central_tedency(df, 'GDP')
    five_number_summary(df, 'InfantMortality')
    write_to_json('out.csv')
