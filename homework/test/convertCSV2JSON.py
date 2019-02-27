import csv
import json

INPUTCSV = 'CausesOfDeath_France_2001-2008.csv'
OUTPUTJSON = 'CausesOfDeath_France_2001-2008.json'


def csvtojson(INPUTCSV):
    # open the CSV
    csv_infile = open( 'CausesOfDeath_France_2001-2008.csv', 'rU' )

    # read csv file into DictReader object
    reader = csv.DictReader(csv_infile)

    # Parse the CSV into JSON
    out = json.dumps( [ row for row in reader ] )

    # Save the JSON
    json_outfile = open(OUTPUTJSON, 'w')
    json_outfile.write(out)


if __name__ == "__main__":
    csvtojson(INPUTCSV)
