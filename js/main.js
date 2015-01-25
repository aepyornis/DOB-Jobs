$( document ).ready(function() {

  $.ajax({
    url: 'http://localhost:3000/query',
    // dataType: 'json',
    type: 'GET',
  })
  .then(function(data){
    createTable(JSON.parse(data));
  })
  .fail(function(jqXHR, status){
    console.log(status)
    });
})

function createTable(tableData) {

  $('#table').DataTable( {
    data: tableData,
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

}


// function setDefaults(){

//   $.fn.bootstrapTable.columnDefaults.sortable = true;
//   // jQuery.fn.bootstrapTable.columnDefaults.

// }

// function createBootstrapTable(tableData) {
//   $('#table').bootstrapTable({
//     data: tableData,
//     pageSize: 5,
//     pagination: true
//   });
// }