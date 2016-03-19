"""
python3

Inserts dob application files csv data (from nyc open) into postgres
"""
import psycopg2
import csv
import datetime
import os
import util

db_connection_string = os.environ['DOBJOBS_CONNECTION']
csv_file = 'path/to/DOB_Job_Application_Filings.csv'

conn = psycopg2.connect(db_connection_string)
cur = conn.cursor()
errors = 0


def create_table(cur):
    cur.execute('DROP TABLE IF EXISTS dobjobs')
    with open('schema.sql', 'r') as f:
        sql = f.read()
        cur.execute(sql)


def get_headers():
    with open('headers.txt', 'r') as f:
        return f.read().replace('\n', '').split(',')

lookup = util.sql_type_dir('schema.sql')
def insert_row(row):
    for key in row:
        try:
            row[key] = util.type_cast(key, row[key], lookup)
        except ValueError as e:
            print(key + "," + row[key])
            print(e)
            global errors
            errors += 1
            row[key] = None
    query = util.make_query('dobjobs', row)[0]
    data = util.make_query('dobjobs', row)[1]
    cur.execute(query, data)


def copy_data(csv_file):
    with open(csv_file, 'r') as f:
        next(f)  # skip headers
        headers = get_headers()
        csvreader = csv.DictReader(f, fieldnames=headers)
        for row in csvreader:
            row['bbl'] = util.bbl(row['Borough'], row['Block'], row['Lot'])
            insert_row(row)
        conn.commit()

create_table(cur)
copy_data(csv_file)
print('errors: ' + str(errors))
