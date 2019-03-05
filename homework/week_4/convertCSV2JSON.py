import csv
import json

INPUTCSV = 'OECD.csv'
OUTPUTJSON = 'OECD.json'

# data starts at line 15


def csvtojson(INPUTCSV):
    """
    Converts csv to json.
    """

    # open the CSV
    csv_infile = open( INPUTCSV,'r' )

    # read csv file into DictReader object
    reader = csv.DictReader(csv_infile, skipinitialspace=True)

    # parse csv to json
    out = json.dumps( [ row for row in reader ] )

    # Save the JSON
    json_outfile = open(OUTPUTJSON, 'w')
    json_outfile.write(out)


if __name__ == '__main__':
    csvtojson(INPUTCSV)
