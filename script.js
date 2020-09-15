


document.querySelector( 'form' ).addEventListener( 'submit', function ( e ) {

    e.preventDefault()

    var input = document.querySelector( 'input' )

    var cik = input.value

    document.querySelector(".data-placeholder").style.display = "none"
    document.querySelector(".data").style.display = "none"
    document.querySelector( ".loading" ).style.display = "block"

    fetchData( cik )

    // mockData()

} )

function mockData() {

    document.querySelector( ".loading" ).style.display = "none"
    document.querySelector( ".data" ).style.display = "flex"

    var res = {
        result: {
            '2020': {
                'roic': '0.8',
                'eps': '0.1',
                'equity': '0.1',
                'sales': '0.1',
                'freeCashFlow': '0.1',
            },
            '2019': {
                'roic': '0.8',
                'eps': '0.1',
                'equity': '0.1',
                'sales': '0.1',
                'freeCashFlow': '0.1',
            },
            '2018': {
                'roic': '0.8',
                'eps': '0.1',
                'equity': '0.1',
                'sales': '0.1',
                'freeCashFlow': '0.1',
            },
            '2017': {
                'roic': '0.8',
                'eps': '0.1',
                'equity': '0.1',
                'sales': '0.1',
                'freeCashFlow': '0.1',
            },
            '2016': {
                'roic': '0.8',
                'eps': '0.1',
                'equity': '0.1',
                'sales': '0.1',
                'freeCashFlow': '0.1',
            },
            '2015': {
                'roic': '0.8',
                'eps': '0.1',
                'equity': '0.1',
                'sales': '0.1',
                'freeCashFlow': '0.1',
            },
            '2014': {
                'roic': '0.996545456',
                'eps': '0.1',
                'equity': '0.1',
                'sales': '0.1',
                'freeCashFlow': '0.1',
            },
        }
    }

    var data = res.result

    var allChartsOptions = {}


    
    
    
}

function fetchData ( cik ) {

    var res = fetch( "https://past-company-rates-server.herokuapp.com/rates", { method: "POST", headers: { 'content-type': 'application/json' }, body: JSON.stringify( { cik: cik, year: "2020" } ) } )
        .then( res => res.json() )
        .then( res => {

            document.querySelector(".loading").style.display = "none"
            document.querySelector(".data").style.display = "flex"

            var data = res.result




            var years = []
            var allChartsOptions = {}


            Object.entries( data )
                .sort( ( year1, year2 ) => parseInt( year1 ) < parseInt( year2 ) )
                .forEach( ( [ year, rates ] ) => {

                    Object.entries( rates ).forEach( ( [ key, value ] ) => {

                        allChartsOptions[ key ] = allChartsOptions[ key ]
                            || {
                            name: key,
                            labels: [],
                            data: [],
                            averages: []
                        }

                        allChartsOptions[ key ].labels.push( year )

                        allChartsOptions[ key ].data.push( value )

                    } )


                } )

            // Calculate averages

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
                // var arrAvg = arr => arr.reduce( ( a, b ) => Number(a) + Number(b), 0 ) / arr.length

                var averages = [ getAveragePct( y10 ), getAveragePct( y5 ), getAveragePct( y3 ) ]

                optionsForKey.averages = averages

            } );


            Chart.defaults.global.defaultFontColor = '#fff';
            Chart.defaults.global.defaultFontFamily = 'Roboto';
            Chart.Tooltip.positioners.cursor = function ( chartElements, coordinates ) {
                return coordinates;
            };


            Object.entries( allChartsOptions ).forEach( ( [ key, options ], index ) => {

                var ctx = document.getElementById( 'chart' + ( index + 1 ) )//.getContext( '2d' );

                var chart = new Chart( ctx, {
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
                                label: function ( tooltipItems, data ) {
                                    return ( Number( tooltipItems.value ) * 100 ).toFixed( 1 ) + '%'
                                }
                            }

                        }
                    },

                } )

                // Display averages
                ctx.parentElement.querySelector( '.avg-container' ).innerHTML = `<span>Averages</span> 10Y <b>${ options.averages[ 0 ] }</b> / 5Y <b>${ options.averages[ 1 ] }</b> / 3Y <b>${ options.averages[ 2 ] }</b>`

            } )

        //     Object.entries( data )
        //         .sort( ( year1, year2 ) => parseInt( year1 ) < parseInt( year2 ) )
        //         .forEach( ( [ year, rates ] ) => {

        //             Object.entries( rates ).forEach( ( [ key, value ] ) => {
        //                 console.log( key )
        //                 allChartsOptions[ key ] = allChartsOptions[ key ]
        //                     || {
        //                     name: key,
        //                     labels: [],
        //                     data: []
        //                 }

        //                 allChartsOptions[ key ].labels.push( year )

        //                 allChartsOptions[ key ].data.push( value )

        //             } )


        //         } )

        //     Object.entries( allChartsOptions ).forEach( ( [ key, options ], index ) => {

        //         var ctx = document.getElementById( 'chart' + ( index + 1 ) ).getContext( '2d' );

                
        //         var chart = new Chart( ctx, {
        //             type: 'bar',
        //             data: {
        //                 labels: options.labels,
        //                 datasets: [ {
        //                     label: options.name,
        //                     data: options.data,
        //                     borderWidth: 1
        //                 } ]
        //             },
        //             options: {
        //                 scales: {
        //                     yAxes: [ {
        //                         ticks: {
        //                             beginAtZero: true,
        //                             min: -0.2,
        //                             max: 0.5,
        //                             callback: function ( v ) {
        //                                 // Format as percentage
        //                                 return ( v * 100 ) + '%'
        //                             }
        //                         },
        //                         gridLines: {
        //                             lineWidth: 0,
        //                             zeroLineWidth: 1
                                
        //                         }
        //                     } ]
        //                 },
        //                 annotation: {

        //                     annotations: [
        //                         {
        //                             type: 'line',
        //                             mode: 'horizontal',
        //                             scaleID: 'y-axis-0',
        //                             value: 0.15,
        //                             borderColor: 'rgb(75, 192, 192)',
        //                             borderWidth: 1,
        //                             label: {
        //                                 enabled: true,
        //                                 content: '15%'
        //                             }
        //                         }

        //                     ]

        //                 }
        //             },

        //         } )



        //     } )




        } )



}


