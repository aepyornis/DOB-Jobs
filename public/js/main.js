$( document ).ready(function() {

  // table
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
        orderable: false,
        width: '20px'
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
        searchable: false,
        width: '20px'
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


  // filters
  yadcf.init(table, [
      {column_number: 2, filter_type: 'date'},
      // {column_number: 3, filter_type: 'text', filter_delay: 300},
      {column_number: 4, filter_type: "select", column_data_type: "multi_select", data: ['A1', 'A2', 'A3', 'NB']},
      {column_number: 5, filter_type: 'text', filter_delay: 300},
      {column_number: 6, filter_type: 'text', filter_delay: 300},
      {column_number: 7, filter_type: 'text', filter_delay: 300},
      {column_number: 8, filter_type: "range_number", filter_delay: 300},
      {column_number: 9, filter_type: "range_number", filter_delay: 300},
      {column_number: 10, filter_type: "range_number", filter_delay: 300},
      {column_number: 11, filter_type: "range_number", filter_delay: 300}
    
  ], 'footer');

  var text;
  // align some columns
  $("#table").on('draw.dt', function(){
    $("tr td:nth-child(2)").css('text-align', 'left');
    $("tr td:nth-child(7)").css('text-align', 'left');
    $("tr td:nth-child(8)").css('text-align', 'left');

    // tooltip
    $("tr td:nth-child(6)").each(function(i, element){

      $(this).attr('title', table.cell( this ).data());
      $(this).tooltip({
        placement: 'left'
      });

    })


  })


})
