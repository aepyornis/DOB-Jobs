$( document ).ready(function() {

  // table
  var table = $('#table').DataTable( {
    serverSide: true,
      "scrollX": true,
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
        data: 'ownername'
       },
       {
        data: 'ownerbusinessname'
       },
       {
        data: 'jobdescription',
        orderable: false
       },
       {
        data: 'approveddate',
        searchable: false
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
       },
       {
        data: 'applicantname'

       }
    ]
  });


  // filters
  yadcf.init(table, [
      // {column_number: 2, filter_type: 'select', data:['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']},
      {column_number: 3, filter_type: 'auto_complete', data:['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '201', '202', '203', '204', '205', '206', '207', '208', '209', '210', '211', '212', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '412', '413', '414', '501', '502', '503'], filter_delay: 300},
      {column_number: 4, filter_type: "select", data: ['A1', 'A2', 'A3', 'NB', 'DM', 'PA', 'SI', 'SC']},
      {column_number: 5, filter_type: 'text', filter_delay: 300},
      {column_number: 6, filter_type: 'text', filter_delay: 300},
      {column_number: 7, filter_type: 'text', filter_delay: 300},
      {column_number: 9, filter_type: "range_number", filter_delay: 300},
      {column_number: 10, filter_type: "range_number", filter_delay: 300},
      {column_number: 11, filter_type: "range_number", filter_delay: 300},
      {column_number: 12, filter_type: "range_number", filter_delay: 300}
    
  ]);

  // on each draw
  $("#table").on('draw.dt', function(){
    // align some columns
    $("tr td:nth-child(2)").css('text-align', 'left');
    $("tr td:nth-child(7)").css('text-align', 'left');
    $("tr td:nth-child(8)").css('text-align', 'left');
 
    // tooltip for job description
    $("tr td:nth-child(8)").each(function(i, element){
      $(this).attr('title', table.cell( this ).data())
    }).tooltip();

    $("tr td:nth-child(8)").each(function(i, element){
         // $( this ).tooltip();
    })
    // tooltip for applicant
    $("tr td:nth-child(15)").each(function(i, element){
        getApplicantContent(this);
    }).tooltip();

         // $( document ).tooltip();

  })



  function getApplicantContent(jq) {

    var applicant = table.cell(jq).data();

    $.ajax({
      url: '/applicant',
      type: 'POST',
      data: {'applicant': applicant}
    })
    .done(function(data) {
      var info = JSON.parse(data);
      var html = "<p><strong>Name: </strong>" + applicant + "</p>"
        html += "<p><strong><Applicant Title: </strong>" + info.applicanttitle + '</p>';
        html += "<p><strong>Professional License: </strong>" + info.professionallicense + '</p>';
        html += "<p><strong>Professional Certified: </strong>" + info.professionalcert + '</p>';
        
      var tooltip = "Title: " + info.applicanttitle + " / Professional License: " + info.professionallicense + " / Professional Certified: " + info.professionalcert;
      $(jq).attr('title', tooltip);
    })
    .fail(function(err) {
      console.log('some ajax error')
      console.log(err);
    });
    

  }





})
