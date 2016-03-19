import datetime


def boro_to_code(boro):
    b = boro.strip()
    if b == 'MANHATTAN':
        code = '1'
    elif b == 'BRONX':
        code = '2'
    elif b == 'BROOKLYN':
        code = '3'
    elif b == 'QUEENS':
        code = '4'
    elif b == 'STATEN ISLAND':
        code = '5'
    else:
        print('Incorrect borough: ' + boro)
        code = '0'
    return code


def bbl(boro, block, lot):
    return boro_to_code(boro) + block.zfill(5) + lot.zfill(4)


def placeholders(num):
    text = '('
    for x in range(num):
        if x < (num - 1):
            text += '%s, '
        else:
            text += '%s)'

    return text


def make_query(tablename, row):
    fieldnames = []
    values = []
    for key in row:
        fieldnames.append(key)
        values.append(row[key])
    query = "INSERT INTO " + tablename + " " + str(tuple(fieldnames))
    query += " values " + placeholders(len(fieldnames))
    query = query.replace("'", "")
    return (query, tuple(values))


def sql_type_dir(sql_file):
    d = {}
    with open(sql_file, 'r') as f:
        for line in f:
            if ')' not in line:
                key = line.strip().replace(',', '').split(' ')[0]
                val = ' '.join(line.strip().replace(',', '').split(' ')[1:])
                d[key] = val
    return d


# mm-dd-year string -> datetime date object
def date_format(datestring):
    datelist = datestring[0:10].split('/')
    datelist = [int(x) for x in datelist]
    datetuple = (datelist[2], datelist[0], datelist[1])
    return datetime.date(*datetuple)


# lookup = util.sql_type_dir('sql/dobjobs.sql')
def type_cast(key, val, lookup):
    datatype = lookup[key].strip()
    if val.strip() == '':
        return None
    elif datatype == 'text':
        return val.strip()
    elif datatype == 'integer':
        return int(val.strip())
    elif datatype == 'money':
        return val.strip().replace('$', '')
    elif datatype == 'boolean':
        if val.strip():
            return True
        else:
            return False
    elif datatype == 'date':
        return date_format(val.strip())
    else:
        raise Exception('Type Cast Error - ' + datatype)
