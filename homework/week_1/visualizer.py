#!/usr/bin/env python
# Name:
# Student number:
"""
This script visualizes data obtained from a .csv file
"""
import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

data_dict = {str(key): [0, 0] for key in range(START_YEAR, END_YEAR)}

def input_average_rating(INPUT_CSV):
    with open(INPUT_CSV, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            for key in data_dict:
                if int(key) == int(row['Year']):
                    data_dict[key][1] += 1
                    data_dict[key][0] += float(row['Rating'])
        return data_dict

# Global dictionary for the data
if __name__ == "__main__":
    # print(data_dict)
     data_dict = input_average_rating(INPUT_CSV)
     for key in data_dict:
         data_dict[key][0] /= data_dict[key][1]




         data_dict[key] = data_dict[key][0]

     plt.plot(data_dict.keys(), data_dict.values())
     plt.xlabel('years')
     plt.ylabel('average rating')
     plt.show()
