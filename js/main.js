$( document ).ready(function() {

  var table = $('#table').DataTable( {
    serverSide: true,
    ajax: {
      url: '/datatables',
      type: 'POST'
    },
     "order": [[ 2, "desc" ]],
    columns: [
        { data: 'house',
          "searchable": false,
          "orderable": false 
        },
        { data: 'streetname',
        "orderable": false 
        },
        { data: 'bbl', 
          "searchable": false,
          "orderable": false
        },
        { data: 'latestactiondate',
          "searchable": false
        },
        { data: 'jobtype' 
        },
        { data: 'existstories', 
          "searchable": false
        },
        { data: 'proposedstories',
          "searchable": false
         },
        { data: 'ownername' },
        { data: 'ownerbusinessname' },
        { data: 'jobdescription' }
    ]
  });

  yadcf.init(table, [
    {column_number : 1, filter_type: "text"},
    {column_number : 3, filter_type: "date"},
    {column_number : 4, column_data_type: "multi_select", data: ['A1', 'A2', 'A3', 'NB']},
    {column_number : 5, filter_type: "range_number", filter_delay: 300},
    {column_number : 6, filter_type: "range_number", filter_delay: 300},
  ]);

})
