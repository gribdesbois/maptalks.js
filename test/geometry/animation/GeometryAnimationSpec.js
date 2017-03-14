
describe('#GeometryAnimation', function () {
    // animation duration for
    var animSpeed = 16 * 4;

    describe('geometry can animate', function () {
        it('all kinds of geometry', function (done) {
            var expected = GEN_GEOMETRIES_OF_ALL_TYPES();
            var i;
            for (i = 0; i < expected.length; i++) {
                expected[i].translate([0.01, 0.01]);
            }
            var geometries = GEN_GEOMETRIES_OF_ALL_TYPES();
            var counter = 0;
            function cmp(frame) {
                if (frame.state.playState !== 'finished') {
                    return;
                }
                counter++;
                if (counter < geometries.length) {
                    return;
                }
                for (var i = 0; i < expected.length; i++) {
                    expect(expected[i].toGeoJSON()).to.eqlGeoJSON(geometries[i].toGeoJSON());
                }
                done();
            }
            for (i = 0; i < geometries.length; i++) {
                var player = geometries[i].animate({
                    translate:new maptalks.Coordinate(0.01, 0.01)
                }, { duration : animSpeed }, cmp);
                expect(player).to.be.ok();
            }


        });

        it('animate a normal symbol', function (done) {
            var marker = new maptalks.Marker([100, 0], {
                symbol:{
                    'markerType' : 'ellipse',
                    'markerWidth' : 10,
                    'markerHeight' : 10
                }
            });
            function step(frame) {
                if (frame.state.playState !== 'finished') {
                    return;
                }
                var symbol = marker.getSymbol();
                expect(symbol.markerWidth).to.be.eql(20);
                expect(symbol.markerHeight).to.be.eql(30);
                expect(symbol.markerType).to.be.eql('x');
                done();
            }
            marker.animate({
                symbol : {
                    'markerType' : 'x', // string type property
                    'markerWidth' : 20,
                    'markerHeight' : 30
                }
            },
                {
                    duration : animSpeed
                },
            step);
        });

        it('animate a composite symbol', function (done) {
            var marker = new maptalks.Marker([100, 0], {
                symbol:[
                    {
                        'markerType' : 'ellipse',
                        'markerWidth' : 10,
                        'markerHeight' : 10
                    },
                    {
                        'markerType' : 'pin',
                        'markerWidth' : 20,
                        'markerHeight' : 30
                    }
                ]
            });
            function step(frame) {
                if (frame.state.playState !== 'finished') {
                    return;
                }
                var symbol = marker.getSymbol();
                expect(symbol).to.be.an(Array);
                expect(symbol[0].markerWidth).to.be.eql(100);
                expect(symbol[0].markerHeight).to.be.eql(110);
                expect(symbol[1].markerWidth).to.be.eql(120);
                expect(symbol[1].markerHeight).to.be.eql(130);
                done();
            }
            marker.animate({
                symbol : [
                    {
                        'markerWidth' : 100,
                        'markerHeight' : 110
                    },
                    {
                        'markerWidth' : 120,
                        'markerHeight' : 130
                    }
                ]
            }, {
                duration : animSpeed
            }, step);
        });

        it('cannot animate a composite symbol when its wwn is not', function () {
            var marker = new maptalks.Marker([100, 0], {
                symbol:{
                    'markerType' : 'ellipse',
                    'markerWidth' : 10,
                    'markerHeight' : 10
                }
            });
            expect(function () {
                marker.animate({
                    symbol : [
                        {
                            'markerWidth' : 100,
                            'markerHeight' : 110
                        },
                        {
                            'markerWidth' : 120,
                            'markerHeight' : 130
                        }
                    ]
                }, {
                    duration : animSpeed
                });
            }).to.throwException();


            marker = new maptalks.Marker([100, 0], {
                symbol:[
                    {
                        'markerType' : 'ellipse',
                        'markerWidth' : 10,
                        'markerHeight' : 10
                    },
                    {
                        'markerType' : 'pin',
                        'markerWidth' : 20,
                        'markerHeight' : 30
                    }
                ]
            });
            expect(function () {
                marker.animate({
                    symbol:{
                        'markerWidth' : 10,
                        'markerHeight' : 10
                    }
                }, {
                    duration : animSpeed,
                    easing : 'in'
                });
            }).to.throwException();
        });

        it('animate radius', function (done) {
            var circle = new maptalks.Circle([100, 0], 100);
            function step(frame) {
                if (frame.state.playState !== 'finished') {
                    return;
                }
                expect(circle.getRadius()).to.be.eql(1000);
                done();
            }
            circle.animate({
                radius:1000
            }, {
                duration : animSpeed
            }, step);
        });
    });

    describe('animate a geometry on a map', function () {
        var container;
        var map;
        var center = new maptalks.Coordinate(118.846825, 32.046534);
        var layer;
        var context = {
            map:map,
            layer:layer
        };

        beforeEach(function () {
            var setups = COMMON_CREATE_MAP(center);
            container = setups.container;
            map = setups.map;
            layer = new maptalks.VectorLayer('vector');
            map.addLayer(layer);
            context.map = map;
            context.layer = layer;
        });

        afterEach(function () {
            map.remove();
            REMOVE_CONTAINER(container);
        });


        it('animate a marker and focus', function (done) {
            var marker = new maptalks.Marker(center);
            function step(frame) {
                if (frame.state.playState !== 'finished') {
                    return;
                }
                var expected = center.add(new maptalks.Coordinate(0.1, 0.1));
                expect(marker.getCenter()).to.closeTo(expected);
                expect(map.getCenter()).to.closeTo(expected);
                done();
            }
            marker.addTo(layer);
            marker.animate({
                translate:[0.1, 0.1]
            }, {
                duration : animSpeed,
                focus:true
            }, step);
        });

        it('fire events during animation', function (done) {
            var marker = new maptalks.Marker(center);
            marker.addTo(layer);
            var counter = 0;
            marker.on('animatestart', function () {
                counter++;
            });
            marker.once('animating', function () {
                counter++;
            });
            marker.on('animateend', function () {
                counter++;
                if (counter === 3) {
                    done();
                }
            });
            marker.animate({
                translate:[0.1, 0.1]
            }, {
                duration : animSpeed,
                focus:true
            });
        });
    });
});


