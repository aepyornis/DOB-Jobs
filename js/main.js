$( document ).ready(function() {

  $('#table').DataTable( {
    serverSide: true,
    ajax: {
      url: '/datatables',
      type: 'POST'
    },
    columns: [
        { data: 'house',
          "searchable": false },
        { data: 'streetname' },
        { data: 'bbl', 
          "searchable": false
        },
        { data: 'latestactiondate',
          "searchable": false
         },
        { data: 'buildingtype' },
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