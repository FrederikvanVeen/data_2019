# import csv
# import json
# INPUT_CSV = "CausesOfDeath_France_2001-2008.csv"
# csvfile = open(INPUT_CSV, 'r')
# jsonfile = open('output.json', 'w')
#
# fieldnames = ("FirstName","LastName","IDNumber","Message")
#
# reader = csv.DictReader( csvfile, fieldnames)
# for row in reader:
#     json.dump(row, jsonfile)
#     jsonfile.write('\n')

import csv
import json

# open the CSV
csv_infile = open( 'CausesOfDeath_France_2001-2008.csv', 'rU' )

# read csv file into DictReader object
reader = csv.DictReader(csv_infile)

# Parse the CSV into JSON
out = json.dumps( [ row for row in reader ] )
# Save the JSON
json_outfile = open( 'output.json', 'w')
json_outfile.write(out)
