$( document ).ready(function() {
  // used to signal CSV download in for dataTables
  var download = false;
  // holds bounds data
  var bounds = '';
  // signal that map is visible
  var isTheMapVisible = true;
  // globals for leaflet
  var map;
  var markers;
  
  // used by ajax and download_button to send message to server
  // yearSelect();
  
// table
  var table = $('#table').DataTable( {
    serverSide: true,
    "scrollX": true,
    // page length optins 
    "lengthMenu": [ 1, 10, 25, 50, 100 ],
    // starts with 10
    "pageLength": 10,
    ajax: {
      url: '/datatables',
      type: 'GET',
      data: function ( d ) {
        d.year = $("#year-select :radio:checked").attr('id');
        d.bounds = bounds;
        d.mapVisible = isTheMapVisible;
        if (download) {
          d.download = 'true';
          // download_ajax_call;
          var url = '/csv?' + $.param(d);
          window.open(url);
          download = false;
        } else {
          d.download = '';
        }
    }
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
        data: 'communityboard',
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
        data: 'approved',
        searchable: false
       },
       {
        data: 'existingnoofstories',
        searchable: false,
        width: '20px'
       },
       {
        data: 'proposednoofstories',
        searchable: false
       },
       {
        data: 'existingdwellingunits',
        searchable: false
       },
       {
        data: 'proposeddwellingunits',
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
       },
       {
        data: 'lat_coord',
        visible: false,
        searchable: false
       },
      { data: 'lng_coord',
        visible: false,
        searchable: false
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

  // add BBL search + download button
  bblSearch();
  download_button();
  // toggles
  toggles();
  // start map
  mapInit();
  // movemovent updates bounds
  mapMovement();
  // create year selections
  yearSelect();

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
    });
    // tooltip for applicant
    $("tr td:nth-child(14)").each(function(i, element){
      // appliicant disabled for now.
      //  getApplicantContent(this);
    }).tooltip();
    // update map
    updateMap(table.rows().data());
  });

  // functions

  function getApplicantContent(jq) {

    var applicant = table.cell(jq).data();
    var year = $('#year-container .ui-selected').text()

    $.ajax({
      url: '/applicant',
      type: 'POST',
      data: {
        'applicant': applicant,
        'year': year
      }
    })
    .done(function(data) {
      var info = JSON.parse(data);
      // var html = "<p><strong>Name: </strong>" + applicant + "</p>"
      //   html += "<p><strong><Applicant Title: </strong>" + info.applicanttitle + '</p>';
      //   html += "<p><strong>Professional License: </strong>" + info.professionallicense + '</p>';
      //   html += "<p><strong>Professional Certified: </strong>" + info.professionalcert + '</p>';
        
      var tooltip = "Title: " + info.applicantprofessionaltitle + " / Professional License: " + info.applicantlicense + " / Professional Certified: " + info.professionalcert;
      $(jq).attr('title', tooltip);
    })
    .fail(function(err) {
      console.log('some ajax error');
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
      });
      // reset
      $('#bbl-reset').click(function(){
        // $('#bor-select').val();
        $('#block-input').val('');
        $('#lot-input').val('');
        table.columns(14).search('').draw();
      });

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

  function yearSelect () {
   $("#year-select :input:radio").click(function(){
     table.draw();
    });
  }
  
  function download_button() {
    $('#download-button').click(function(){
      download = true; 
      table.draw();
    });  
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
    });
  }

  // initalizes map to center of NYC with osm
  function mapInit() {
    // references the variable at top of this page
    map = L.map('map', {
      center: [40.783435, -73.966249],
      zoom: 11
    });
    // add osm title layer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{}).addTo(map);
    // groupLayer to old markers
    markers = L.layerGroup().addTo(map);
    // set bounds to map bounds
    bounds = map.getBounds().toBBoxString();
  }

  function mapMovement() {
    // on end of movement
    map.on('moveend', function(e) {
      // update bounds
      bounds = map.getBounds().toBBoxString();
      // refresh map
      table.draw();
    });
  }

  // displays table on map upon
  function updateMap(tableData) {
    // clear the old markers
    markers.clearLayers();
    
    tableData.each(function(row){
      if (row.lat_coord && row.lng_coord) {
        var marker = L.circleMarker([row.lat_coord, row.lng_coord],{
          // style goes here
        });
        marker.bindPopup(markerPopupHTML(row));
        markers.addLayer(marker);
      }
    });
  }

  // generates html for marker
  function markerPopupHTML(row) {
    return '<div class="popup"><p><b>Address:  </b>' + row.address + "</p><p><b>Job Type:  </b>" + row.jobtype +
          "</p><p><b>Latest Action Date:  </b>" + row.latestactiondate +
          "</p><p>Description:  </b>" + row.jobdescription + '</p></div>';
  }

  // creates toggle for map and table
  function toggles() {
    $('#table-toggle').click(function(){
      $('tbody').toggle();
    });
    $('#map-toggle').click(function(){
      $('#map').toggle();
      // updates isTheMapVisible and re-loads the map 
      if (isTheMapVisible) {
        // map is turning off...
        isTheMapVisible = false;
        // set bounds back to ''
        bounds = '';
        table.draw();
      } else {
        // map is turning on...
        isTheMapVisible = true;
        // reset map to initial settings
        map.setView( [40.783435, -73.966249] );
        map.setZoom(11);
        // set bounds to map bounds
        bounds = map.getBounds().toBBoxString();
        table.draw();
      }
    });
  }
  
});
//end of (document ready)

