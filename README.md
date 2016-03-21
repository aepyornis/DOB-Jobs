# [DOB-Jobs](http://www.dobjobs.org/)

An interactive query tool for Department of Buildings data.

## Technologies:

- Node.js
- DataTables & Leaflet
- PostgreSQL
- python3

## To develop/run locally:

download the data: 

```
wget https://data.cityofnewyork.us/api/views/ic3t-wcy2/rows.csv?accessType=DOWNLOAD -O job_fillings.csv
```

create a database: ``` createdb dobjobs ```

Set connection settings env variable for the parser: 

``` export DOBJOBS_CONNECTION='connection string' ```
sample string: "dbname=dobjobs user=ziggy"

create python3 virtual evnironment & install dependencies:
```
cd csvparser
pyvenv venv
source venv/bin/activate
pip install psycopg2
```

run the parser:

```
python3 db_dobjobs.py /path/to/jobs_fillings.csv

```

add lat/lng to database
(you have to update sql/geocode.sql with the correct path to the bbl, lat, lng lookup file.)

```
cd ..
psql -d dobjobs -f sql/geocode.sql
```

Add indexes, which requires pg_trgm extension. You can install this module with the postgresql-contrib package:

``` sudo apt-get install postgresql-contrib  ```

Create a file, config.js, that contains the postgres connection & server info:

``` javascript
module.exports = {
  database: 'database-name',
  host: 'localhost',
  user: 'pgusername',
  password: 'pgpassword',
  port: '3000',
  ip: 'localhost',
  tableName: 'dobjobs'
};

```

install node modules: ``` npm install ```

run app: ``` npm start ```

## data source:

https://data.cityofnewyork.us/Housing-Development/DOB-Job-Application-Filings/ic3t-wcy2
http://www.nyc.gov/html/dob/html/codes_and_reference_materials/foilmonthly.shtml


## LICENSE: GPLv3

Copyright (C) 2015-2016 Ziggy Mintz

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.



#### old development steps

Create postgres database 'dobjobs':

```
createdb dobjobs
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
