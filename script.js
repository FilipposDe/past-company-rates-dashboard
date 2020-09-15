


document.querySelector( 'form' ).addEventListener( 'submit', function ( e ) {

    e.preventDefault()

    var input = document.querySelector( 'input' )

    var cik = input.value

    // Hide placeholder, start loading, hide previous data
    
    document.querySelector(".data-placeholder").style.display = "none"
    document.querySelector(".data").style.display = "none"
    document.querySelector( ".loading" ).style.display = "block"

    fetchData( cik )

} )






// Main function

function fetchData ( cik ) {


    // Fetch the data from API up to current year

    fetch( "https://past-company-rates-server.herokuapp.com/rates", 
        { 
            method: "POST", 
            headers: { 'content-type': 'application/json' }, 
            body: JSON.stringify( { cik: cik, year: new Date().getFullYear() } ) 
        } )
        .then( res => res.json() )
        .then( res => {

            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////
            //
            //      AFTER DATA IS RECEIVED
            //
            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////

            // Hide loading spinner, show data

            document.querySelector(".loading").style.display = "none"
            document.querySelector(".data").style.display = "flex"

            var data = res.result
            var allChartsOptions = {}



            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////
            //
            //      POPULATE CHART OPTIONS FROM DATA
            //
            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////

            // For each year
            Object.entries( data )
                // Sort by year
                .sort( ( year1, year2 ) => parseInt( year1 ) < parseInt( year2 ) )
                .forEach( ( [ year, rates ] ) => {

                    // For each financial key
                    Object.entries( rates ).forEach( ( [ key, value ] ) => {

                        // Initialize options for financial key if not exists
                        allChartsOptions[ key ] = allChartsOptions[ key ]
                            || {
                            name: key,
                            labels: [],
                            data: [],
                            averages: []
                        }
                        
                        // Label for this key is the key (string) itself
                        allChartsOptions[ key ].labels.push( year )
                        
                        // Append the value for this year and financial key
                        allChartsOptions[ key ].data.push( value )

                    } )


                } )



            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////
            //
            //      CALCULATE AVERAGES
            //
            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////

            Object.values( allChartsOptions ).forEach( optionsForKey => {

                var y10 = optionsForKey.data.slice( 0 )
                var y5 = optionsForKey.data.slice( -5 )
                var y3 = optionsForKey.data.slice( -3 )

                function getAveragePct ( array ) {
                    var total = array.reduce( ( a, b ) => Number( a ) + Number( b ), 0 )
                    var average = ( total / array.length )
                    var pct = average * 100
                    return pct.toFixed( 1 ) + '%'
                }

                var averages = [ getAveragePct( y10 ), getAveragePct( y5 ), getAveragePct( y3 ) ]

                optionsForKey.averages = averages

            } );


            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////
            //
            //      SETUP AND DISPLAY CHARTS PER FINANCIAL KEY
            //
            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////

            // Setup global chart options
            Chart.defaults.global.defaultFontColor = '#fff'
            Chart.defaults.global.defaultFontFamily = 'Roboto'
            Chart.Tooltip.positioners.cursor = function ( chartElements, coordinates ) {
                return coordinates
            }

            Object.values( allChartsOptions ).forEach( ( options, index ) => {

                // ctx is the element (canvas)
                var ctx = document.getElementById( 'chart' + ( index + 1 ) )

                // Chart options
                var chartOpts = {

                    type: 'bar',
                    data: {
                        labels: options.labels,
                        datasets: [ {
                            label: options.name,
                            data: options.data,
                            borderWidth: 0,
                            backgroundColor: '#d5f5ff',
                            borderColor: '#d5f5ff',
                        } ]
                    },
                    options: {
                        scales: {
                            yAxes: [ {
                                ticks: {
                                    fontColor: '#fff',
                                    beginAtZero: true,
                                    min: -0.2,
                                    max: 0.4,
                                    callback: function ( v ) {
                                        // Format as percentage
                                        return ( v * 100 ) + '%'
                                    }
                                },
                                gridLines: {
                                    lineWidth: 0,
                                    zeroLineWidth: 1
    
                                }
                            } ]
                        },
                        title: {
                            display: true,
                            text: options.name === 'freeCashFlow' ? 'FREE CASH FLOW' : options.name.toUpperCase(),
                            fontSize: 30,
                            padding: 40,
                            fontStyle: '100',
                        },
                        legend: {
                            display: false,
                        },
                        annotation: {
                            // Horizontal line with 15%
                            annotations: [
                                {
                                    type: 'line',
                                    mode: 'horizontal',
                                    scaleID: 'y-axis-0',
                                    value: 0.15,
                                    borderColor: '#FF9800',
                                    borderWidth: 1,
                                    label: {
                                        enabled: true,
                                        content: '15%'
                                    }
                                }
                            ]
                        },
                        tooltips: {
                            mode: 'index',
                            position: 'cursor',
                            intersect: false,
                            backgroundColor: '#FF9800',
                            cornerRadius: 0,
                            xPadding: 12,
                            yPadding: 12,
                            displayColors: false,
                            callbacks: {
                                // Display tooltip over mouse
                                label: function ( tooltipItems, data ) {
                                    return ( Number( tooltipItems.value ) * 100 ).toFixed( 1 ) + '%'
                                }
                            }
    
                        }
                    },
                }


                // Create the chart
                new Chart( ctx, chartOpts )

                // Display averages
                ctx.parentElement.querySelector( '.avg-container' )
                    .innerHTML = `<span>Averages</span> 10Y <b>${ options.averages[ 0 ] }</b> / 5Y <b>${ options.averages[ 1 ] }</b> / 3Y <b>${ options.averages[ 2 ] }</b>`
           
            } )




        } )


}





// var mockRes = {
//     result: {
//         '2020': {
//             'roic': '0.8',
//             'eps': '0.1',
//             'equity': '0.1',
//             'sales': '0.1',
//             'freeCashFlow': '0.1',
//         },
//         '2019': {
//             'roic': '0.8',
//             'eps': '0.1',
//             'equity': '0.1',
//             'sales': '0.1',
//             'freeCashFlow': '0.1',
//         },
//         '2018': {
//             'roic': '0.8',
//             'eps': '0.1',
//             'equity': '0.1',
//             'sales': '0.1',
//             'freeCashFlow': '0.1',
//         },
//         '2017': {
//             'roic': '0.8',
//             'eps': '0.1',
//             'equity': '0.1',
//             'sales': '0.1',
//             'freeCashFlow': '0.1',
//         },
//         '2016': {
//             'roic': '0.8',
//             'eps': '0.1',
//             'equity': '0.1',
//             'sales': '0.1',
//             'freeCashFlow': '0.1',
//         },
//         '2015': {
//             'roic': '0.8',
//             'eps': '0.1',
//             'equity': '0.1',
//             'sales': '0.1',
//             'freeCashFlow': '0.1',
//         },
//         '2014': {
//             'roic': '0.996545456',
//             'eps': '0.1',
//             'equity': '0.1',
//             'sales': '0.1',
//             'freeCashFlow': '0.1',
//         },
//     }
// }
