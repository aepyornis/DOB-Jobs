$( document ).ready(function() {
  $.ajax({
    url: 'http://localhost:3000/query',
    // dataType: 'json',
    type: 'GET',
  })
  .then(function(data){
    createBootstrapTable(JSON.parse(data));
  })
  .fail(function(jqXHR, status){
    console.log(status)
    });
})

function createBootstrapTable(tableData) {
  $('#table').bootstrapTable({
    data: tableData
  });
}