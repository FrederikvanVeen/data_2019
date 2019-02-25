import csv
import json

INPUTCSV = 'KNMI_SCHIPHOL_2018.txt'
OUTPUTJSON = 'KNMI_SCHIPHOL_2018.json'
start_data_line = 15

def csvtojson(INPUTCSV, start_data_line):
    # open the CSV
    csv_infile = open( INPUTCSV,'rU' )

    # skip introduction lines
    for i in range(start_data_line):
        csv_infile.next()

    # read csv file into DictReader object
    reader = csv.DictReader(csv_infile, skipinitialspace=True, fieldnames = ('STN', 'YYYYMMDD', 'TN', 'TX', 'SQ', 'UX' ))

    # parse csv to json
    out = json.dumps( [ row for row in reader ] )

    # Save the JSON
    json_outfile = open(OUTPUTJSON, 'w')
    json_outfile.write(out)

if __name__ == '__main__':
    csvtojson(INPUTCSV, start_data_line)
