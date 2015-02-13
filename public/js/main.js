$( document ).ready(function() {

  // table
  var table = $('#table').DataTable( {
    serverSide: true,
      "scrollX": true,
    ajax: {
      url: '/datatables',
      type: 'POST'
    },
     "order": [[ 1, "desc" ]],
    columns: [
       {
        data: 'address',
        'searchable': false,
        'orderable': false
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

       }, {
        data: 'bbl'
       }
    ]
  });


  // filters
  yadcf.init(table, [
      // {column_number: 2, filter_type: 'select', data:['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']},
      // {column_number: 0, filter_type: 'text', filter_delay: 600},
      {column_number: 2, filter_type: 'auto_complete', data:['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '201', '202', '203', '204', '205', '206', '207', '208', '209', '210', '211', '212', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '412', '413', '414', '501', '502', '503'], filter_delay: 300},
      {column_number: 3, filter_type: "select", data: ['A1', 'A2', 'A3', 'NB', 'DM', 'PA', 'SI', 'SC']},
      {column_number: 4, filter_type: 'text', filter_delay: 300},
      {column_number: 5, filter_type: 'text', filter_delay: 300},
      {column_number: 6, filter_type: 'text', filter_delay: 300},
      {column_number: 8, filter_type: "range_number", filter_delay: 300},
      {column_number: 9, filter_type: "range_number", filter_delay: 300},
      {column_number: 10, filter_type: "range_number", filter_delay: 300},
      {column_number: 11, filter_type: "range_number", filter_delay: 300}
    
  ]);

  // on each draw
  $("#table").on('draw.dt', function(){
    // align some columns
    $("tr td:nth-child(1)").css('text-align', 'left');
    $("tr td:nth-child(6)").css('text-align', 'left');
    $("tr td:nth-child(7)").css('text-align', 'left');
 
    // tooltip for job description
    $("tr td:nth-child(7)").each(function(i, element){
      $(this).attr('title', table.cell( this ).data())
    }).tooltip();

    $("tr td:nth-child(7)").each(function(i, element){
         // $( this ).tooltip();
    })
    // tooltip for applicant
    $("tr td:nth-child(14)").each(function(i, element){
        getApplicantContent(this);
    }).tooltip();

  })

   bblSearch();

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
  
 
  function bblSearch() {
      var html = '<div id="bbl">';
      html += '<select id="bor-select" name="bor"><option value="1">Manhattan (1)</option><option value="2">Bronx (2)</option><option value="3">Brooklyn (3)</option><option value="4">Queens (4)</option><option value="5">SI (5)</option></select>'
      html += '<input id="block-input" class="bbl-input" type="text" inputmode="numberic" maxlength="5" placeholder="Block"></input>';
      html += '<input id="lot-input" class="bbl-input" type="text" inputmode="numberic" maxlength="4" placeholder="Lot"></input>';
      html += '<button id="bbl-search-button" name="bblSubmit" class="bbl-input">Search</button>';
      html += '<input value="x" id="bbl-reset"  class="yadcf-filter-reset-button" type="button">'
      html += '</div>';

      $('#table_length').append(html);
      //"search" button
      $('#bbl-search-button').click(function(){
        var bor = $('#bor-select').val();
        var block = $('#block-input').val();
        var lot = $('#lot-input').val();
        table.columns(14).search(bbl(bor,block,lot)).draw();
      })
      // reset
      $('#bbl-reset').click(function(){
        // $('#bor-select').val();
        $('#block-input').val('');
        $('#lot-input').val('');
        table.columns(14).search('').draw();
      })

       function bbl(borough, block, lot) {
          var bor = '' + borough;
          var blk = '' + block;
          var lt = '' + lot;
          var bbl = '';

          if (block.length > 5 || lot.length > 4) {
              console.log("the block and/or lot are too long");
          } else {
                while (blk.length !== 5) {
                  blk = '0' + blk;
                }
                while (lt.length !== 4) {
                  lt = '0' + lt;
                }
                bbl = bor + blk + lt;
          }
             
          return bbl;
        }

  }

  // server-side script not ready yet
  function addSearch() {

    var html = '<div id="address-search-container">'
    html += '<input id="add-input" type="text" class="address-input" placeholder="house & street"></input>';
    html += '<select id="address-bor-select"><option>MN</option><option>BX</option><option>BK</option><option>QN</option><option>SI</option></select>'
    html += '<button id="address-submit">Search</button>';
    html += '</div>';

    $('thead tr th:first').append(html);

    $('#address-submit').click(function(){
        var formatted_address = $('#add-input').val();
        formatted_address += ';';
        formatted_address += $('#address-bor-select').val();
       table.columns(0).search(formatted_address).draw();
    })

  }

})
//end of (document ready)


