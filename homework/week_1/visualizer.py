#!/usr/bin/env python
# Name: Fredrik van Veen
# Student number: 10789324
"""
This script visualizes data obtained from a .csv file
"""
import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# initialize dict for movies and sum of rating per year
data_dict = {str(key): [0, 0] for key in range(START_YEAR, END_YEAR)}


def input_average_rating(INPUT_CSV):
    # open csv
    with open(INPUT_CSV, newline='') as csvfile:

        # read each row
        reader = csv.DictReader(csvfile)

        for row in reader:
            for key in data_dict:

                # update total rating and movie amount for specific year
                if int(key) == int(row['Year']):
                    data_dict[key][1] += 1
                    data_dict[key][0] += float(row['Rating'])

        return data_dict

# Global dictionary for the data
if __name__ == "__main__":
    # print(data_dict)
     data_dict = input_average_rating(INPUT_CSV)

     for key in data_dict:
         # calculate average rating
         data_dict[key][0] /= data_dict[key][1]

         # change dict into years and aveerage ratings only
         data_dict[key] = data_dict[key][0]

     # plot average ratings for each year
     plt.plot(data_dict.keys(), data_dict.values())
     plt.axis([-1, 10, 0, 10])
     plt.xlabel('year')
     plt.ylabel('average rating')
     plt.title("average rating of movies in top-50 per year")
     plt.show()
