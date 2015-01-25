{
    init: function(elevators, floors) {
        var pickupRequests = floors.map(function () { return false });

        function requestPickup(floorNum) {
            pickupRequests[floorNum] = true;
            updatePickupRequests();
        }

        function clearPickupRequest(floorNum) {
            pickupRequests[floorNum] = false;
        }

        function updatePickupRequests(elevator) {
            console.log("pickupRequests:", pickupRequests);
            var floorNum = pickupRequests.indexOf(true);
            if (floorNum != -1) {
                if (typeof elevator === 'undefined') {
                    if (anyElevatorGoingTo(floorNum)) { return }
                    elevator = closestAvailableElevator(floorNum);
                }
                if (elevator.destinationQueue.indexOf(floorNum) == -1) {
                    elevator.goToFloor(floorNum);
                }
            }
        }

        function closestAvailableElevator(floorNum) {
            var availableElevators = elevators.filter(function(elevator) {
                return elevator.loadFactor() < 0.8;
            });
            if (availableElevators.length == 0) {
                // None are actually available, so consider all available (one will be eventually!):
                availableElevators = elevators;
            }
            availableElevators.sort(function(a, b) {
                return Math.abs(a.currentFloor() - floorNum) - Math.abs(b.currentFloor() - floorNum);
            });
            return availableElevators[0];
        }

        function anyElevatorGoingTo(floorNum) {
            return elevators.filter(function(elevator) {
                return elevator.destinationQueue.indexOf(floorNum) != -1;
            }).length > 0
        }

        elevators.forEach(function(elevator) {
            elevator.on("idle", function() {
                updatePickupRequests(elevator);
            });
            elevator.on("passing_floor", function(floorNum, direction) {
                if (pickupRequests[floorNum] && elevator.loadFactor() < 0.8) {
                    elevator.goToFloor(floorNum, true); // go immediately
                }
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                if (elevator.loadFactor() < 0.8) {
                    clearPickupRequest(floorNum);
                }
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                if (elevator.destinationQueue.indexOf(floorNum) == -1) {
                    elevator.goToFloor(floorNum);
                }
            });
        });

        floors.forEach(function(floor) {
            floor.on("up_button_pressed", function() {
                requestPickup(floor.floorNum());
            });
            floor.on("down_button_pressed", function() {
                requestPickup(floor.floorNum());
            });
        });
    },

    update: function(dt, elevators, floors) {}
}
