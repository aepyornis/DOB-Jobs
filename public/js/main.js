$( document ).ready(function() {

  var table = $('#table').DataTable( {
    serverSide: true,
    ajax: {
      url: '/datatables',
      type: 'POST'
    },
     "order": [[ 2, "desc" ]],
    columns: [
       {
        data: 'house',
        'searchable': false,
        'orderable': false
       },
       {
        data: 'streetname',
        orderable: false
       },
       {
        data: 'latestactiondate',
        searchable: false
       },
       {
        data: 'cb',
        searchable: false,
        orderable: false
       },
       {
        data: 'jobtype',
        searchable: false
       },
       {
        data: 'jobdescription',
        orderable: false
       },
       {
        data: 'ownername'
       },
       {
        data: 'ownerbusinessname'
       },
       {
        data: 'existstories',
        searchable: false
       },
       {
        data: 'proposedstories',
        searchable: false
       },
       {
        data: 'existdwellunits',
        searchable: false
       },
       {
        data: 'proposeddwellunits',
        searchable: false
       },
       {
        data: 'initialcost',
        searchable: false
       }
    ]
  });

  // yadcf.init(table, [
    
  // ]);

})
