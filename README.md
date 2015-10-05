# Dynamic Map Simplification with Simple Viewport-Based Culling #

This is a little example to experiment with high-performance interactive maps. Mike Bostock has several [examples of using dynamic simplification with maps](http://bl.ocks.org/mbostock/6287633), but I needed to expand on them in a few ways:

* I want to change the projections on the fly, so I wanted to avoid baking a projection into my data.
* I need to project the entire world instead of just one country or region.
* When zooming in on an area, I wanted to avoid projecting unnecessary data. (E.g. countries outside the viewport.)

This example does all of those things. Here's an overview:

1. I use a server-side build script to convert the original GeoJSON to TopoJSON, then enrich each coordinate of each arc with the data needed for [dynamic line simplification](http://bost.ocks.org/mike/simplify/). I also enrich each feature of that TopoJSON with its spherical area in steradians.
2. After converting the data back to GeoJSON on the client, I render some features and use D3 to obtain their area in SVG coordinates. Dividing this area by those features' area in steradians, I obtain a baseline for steradians per square pixel.
3. When zooming in or out, I can multiply the aforementioned baseline by the square of the magnificaiton factor to get the ideal steradians per square pixel for that magnification factor. I use this number (the number of steradians represented by one square pixel) as the minimum area when filtering points for dynamic line simplification.
4. At any zoom level, I compute the geographic bounds for the visible area defined by the viewport, then use simple lat/lon bounding box tests to cull features that don't overlap the current viewport.

The result is:

* When zoomed out, I project most features, but each at a low level of detail.
* When zoomed in, I project only a few features, but each at a high level of detail.

## Known Issues ##

There are actually a few major issues with this implementation:

* The bounding boxes for some countries cross the antimeridian, which completely screws up the current (simplistic) culling. Most noticeably, the USA and Russia are never drawn. Oops?
* Reverse-projecting the viewport bounds has crazy/undefined results when they fall outside the normal area of the projection. For now, just don't pan too far in any direction when zoomed out.

## For Posterity ##

I didn't automate the acquisition/generation of the original GeoJSON data, so here are the steps for that:

1. Download [http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/50m/cultural/ne_50m_admin_0_countries.zip](http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/50m/cultural/ne_50m_admin_0_countries.zip) and unzip it somewhere.
2. Make sure you have `ogr2ogr` installed (`brew install gdal`; see [http://bost.ocks.org/mike/map/#installing-tools](http://bost.ocks.org/mike/map/#installing-tools) for details)
3. Use `ogr2ogr` to convert the file to GeoJSON:
       
       ogr2ogr -f GeoJSON countries.geo.json ne_50m_admin_0_countries.shp

4. To only inlude certain countries in the GeoJSON output, add a `-where` option to the above command:

       -where "ADM0_A3 IN ('GBR')"