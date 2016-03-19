# [DOB-Jobs](http://www.dobjobs.org/)

An interactive query tool for Department of Buildings data.

## Runs on:

- Node.js
- DataTables & Leaflet
- PostgreSQL

## LICENSE

-  The ONLY restriction: NON-COMMERICAL use. This may not be used by real estate or for ANY profit-making purpose. 

## To develop/run locally:

Create postgres database 'dobjobs':

```
createdb dobjobs
```

create jobs table:

```
psql -U <username> -h <host> -f  "sql/dob_jobs_schema.sql" dobjobs
```

Run the parser. Change the db settings & the path to the DOB data as needed. Parse.js requires all the data files to be in a single folder. You may get a few postgres db insert errors. Any more than 50 and something probably went wrong. When I did this for the all the excel files from 2010 through September 2015, I got only 9 errors. 

parse.js requires python and these two libraries: argparse, xlrd

command line use of parse.js: node parse.js [table name] [path to excel directory] [database] [user] [password] [host] [port]

example:

```
node ./parser/parse.js jobs data/dob dobjobs user mypasword localhost
```

add the 'BBL' field by running the geocode.sql script. Note: you may have to modify geocode.sql to correctly set the path of  the bbl_lat_lng.txt file.


```
 psql -U <username> -h <host> -f "sql/geocode.sql" dobjobs
```

create indexes:

```
psql -U <username> -h <host> -f "sql/index.sql" dobjobs
```

Ok, now the database is all set up. Now we just have to start the app:

```
node app.js
```

Go to http://localhost:3000 and you should have a working app. 


## data source:

http://www.nyc.gov/html/dob/html/codes_and_reference_materials/foilmonthly.shtml

## csv parser


``` bash
export DOBJOBS_CONNECTION='connection string'

```
sample string: "dbname=dobjobs user=ziggy"
