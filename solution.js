{
    init: function(elevators, floors) {
        var MAX_ELEVATORS = elevators.length; // For minimizing moves, less elevators is better
        elevators = elevators.slice(0, MAX_ELEVATORS);

        var pickupRequests = floors.map(function () { return false });

        function byDistanceToFloor(floorNum) {
            return function(a, b) {
                return Math.abs(a - floorNum) - Math.abs(b - floorNum);
            }
        }

        function sortQueue(elevator) {
            elevator.destinationQueue.sort(byDistanceToFloor(elevator.currentFloor()));
            elevator.checkDestinationQueue();
        }

        function makeClosestPickupHandler(elevator) {
            return function() {
                var requestedFloors = [];
                pickupRequests.forEach(function(requested, floorNum) {
                    if (requested) { requestedFloors.push(floorNum); }
                });
                if (requestedFloors.length == 0) { return }
                requestedFloors.sort(byDistanceToFloor(elevator.currentFloor()));
                var floor = requestedFloors[0];
                elevator.goToFloor(floor);
                pickupRequests[floor] = false;
            }
        }

        elevators.forEach(function(elevator) {
            elevator.on("idle", makeClosestPickupHandler(elevator));
            elevator.on("passing_floor", function(floorNum, direction) {
                if ((pickupRequests[floorNum] && elevator.loadFactor() < 0.8) || elevator.destinationQueue.indexOf(floorNum) != -1) {
                    elevator.goToFloor(floorNum, true); // go immediately
                }
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                pickupRequests[floorNum] = false;
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                elevator.goToFloor(floorNum);
                sortQueue(elevator);
            });
        });

        function makePickupRequestHandler(floorNum) {
            return function() {
                pickupRequests[floorNum] = true;
                var idleElevators = elevators.filter(function(elevator) {
                    return elevator.destinationQueue.length == 0 && elevator.loadFactor() == 0;
                });
                if (idleElevators.length) {
                    var randomElevator = idleElevators[Math.floor(Math.random() * idleElevators.length)]
                    makeClosestPickupHandler(randomElevator)();
                }
            }
        }

        floors.forEach(function(floor) {
            floor.on("up_button_pressed", makePickupRequestHandler(floor.floorNum()));
            floor.on("down_button_pressed", makePickupRequestHandler(floor.floorNum()));
        });
    },

    update: function(dt, elevators, floors) {}
}
