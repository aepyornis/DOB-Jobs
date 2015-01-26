$( document ).ready(function() {

  $('#table').DataTable( {
    serverSide: true,
    ajax: {
      url: '/datatables',
      type: 'POST'
    },
    columns: [
        { data: 'house' },
        { data: 'streetname' },
        { data: 'bbl' },
        { data: 'latestactiondate' },
        { data: 'buildingtype' },
        { data: 'existstories' },
        { data: 'proposedstories' },
        { data: 'ownername' },
        { data: 'ownerbusinessname' },
        { data: 'jobdescription' }
    ]
  });

})


//graveyard
  // $.ajax({
  //   url: 'http://localhost:3000/query',
  //   // dataType: 'json',
  //   type: 'GET',
  // })
  // .then(function(data){
  //   createTable(JSON.parse(data));
  // })
  // .fail(function(jqXHR, status){
  //   console.log(status)
  //   });