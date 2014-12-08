# Geo Vault
A demonstrator for a JSON-P based poor man's data residency option. This vault stores longitude / latitude next to an ID and provides a JSON-P based API for reading all locations, reading one location by ID, adding one location.

## API Introduction
The API of the geo vault can be used with the following URLs (nothing for REST purists, we use GET to crteate new entries ... uhh).

### Get all locations
    https://<server>:<port>/locations?callback=<function>
### Get one location by ID
    https://<server>:<port>/locations/<id>?callback=<function>

### Add one location
    https://<server>:<port>/location/?callback=<function>&id=<id>&longitude=<longitude>&latitude=<latitude>

## Using the API from a web client
As the intention of this vault is to be integrated in cloud solutions to host geo data on premise (or on territory), a cross origin call is required to access the vault. This can be achieved using the following jQuery helper method:

### Call for getting all locations
    ...
    $.ajax({
        type : "GET",
        url : "https://morning-ridge-5891.herokuapp.com/locations?callback=?", 
        dataType: "jsonp", 
        success: function(data) { 
            console.log(data); //formatted JSON data 
            $scope.$apply(function() {
                $scope.locations = data;
            });
        } 
    ...

### Call for getting one location by ID
    ...

    ...

### Call for adding one location
    ...
    url_val = 
        "https://morning-ridge-5891.herokuapp.com/location?callback=?&id="+
        $scope.newId+"&longitude="+
        $scope.newLongitude+"&latitude="+
        $scope.newLatitude;
    $.ajax({
        type : "GET",
        url : url_val, 
        dataType: "jsonp", 
        success: function(data) { 
            console.log(data); //formatted JSON data 
        } 
    });

    ...

That's all.
