$( document ).ready(function() {

  $('#table').DataTable( {
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

})